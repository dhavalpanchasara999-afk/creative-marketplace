import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase, Order, Product, User } from '../../../lib/db';
import { getAuthenticatedUser } from '../../../lib/auth';
import { sendPurchaseEmail } from '../../../lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        await connectToDatabase();

        const sessionUser = getAuthenticatedUser(req);
        if (!sessionUser) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cartItems, couponCode } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'Missing signature verification parameters' }, { status: 400 });
        }

        // Verify the payment signature using SHA256 HMAC
        const text = razorpay_order_id + '|' + razorpay_payment_id;
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid transaction signature. Verification failed.' }, { status: 400 });
        }

        // Check for duplicate payment processing
        const existingOrder = await Order.findOne({ orderId: razorpay_order_id });
        if (existingOrder) {
            return NextResponse.json({ success: true, message: 'Payment verified (already processed)', orderId: razorpay_order_id });
        }

        // Retrieve product details for secure pricing calculation
        const productIds = cartItems.map(item => item.id || item._id);
        const dbProducts = await Product.find({ _id: { $in: productIds } });

        let subtotal = dbProducts.reduce((acc, p) => acc + p.salePrice, 0);

        let discountPercent = 0;
        if (couponCode) {
            const codeUpper = couponCode.toUpperCase();
            if (codeUpper === 'PROMO70') {
                discountPercent = 70;
            } else if (codeUpper === 'WELCOME10') {
                discountPercent = 10;
            }
        }

        const finalTotal = Math.round(subtotal * (1 - discountPercent / 100));

        // Create the paid order receipt
        const purchasedList = dbProducts.map(p => ({
            productId: p._id,
            title: p.title,
            downloadUrl: p.downloadUrl
        }));

        const newOrder = await Order.create({
            orderId: razorpay_order_id,
            userEmail: sessionUser.email,
            products: purchasedList,
            totalPaid: finalTotal,
            gateway: 'Razorpay Live',
            status: 'Paid'
        });

        // Add purchases to user dashboard locker
        const user = await User.findById(sessionUser.id);
        if (user) {
            dbProducts.forEach(p => {
                if (!user.purchases.includes(p._id)) {
                    user.purchases.push(p._id);
                }
            });
            await user.save();
        }

        // Trigger delivery email
        console.log(`[EMAIL DELIVERY] Sending products download receipt to ${sessionUser.email} for order ${razorpay_order_id}.`);
        try {
            await sendPurchaseEmail({
                to: sessionUser.email,
                orderId: razorpay_order_id,
                products: purchasedList,
                totalPaid: finalTotal
            });
        } catch (emailErr) {
            console.error('[Payment Verification Email Trigger Error]', emailErr);
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified and order fulfilled successfully!',
            orderId: razorpay_order_id,
            order: newOrder
        });

    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
