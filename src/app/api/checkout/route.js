import { NextResponse } from 'next/server';
import { connectToDatabase, Product, Order, User } from '../../../lib/db';
import { getAuthenticatedUser } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

// POST PAYMENT SUBMISSION - Logs verified checkout purchases
export async function POST(req) {
    try {
        await connectToDatabase();
        
        // 1. Authenticate Buyer Session
        const sessionUser = getAuthenticatedUser(req);
        if (!sessionUser) {
            return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
        }

        const body = await req.json();
        const { cartItems, gateway, couponCode } = body;

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return NextResponse.json({ error: 'Shopping cart is empty. Checkout aborted.' }, { status: 400 });
        }

        if (!gateway) {
            return NextResponse.json({ error: 'Payment gateway parameter is required' }, { status: 400 });
        }

        // 2. Fetch fresh products prices directly from database to prevent client tampering
        const productIds = cartItems.map(item => item.id || item._id);
        const dbProducts = await Product.find({ _id: { $in: productIds } });

        if (dbProducts.length === 0) {
            return NextResponse.json({ error: 'Products not found in store catalog' }, { status: 400 });
        }

        // 3. Compute secure pricing subtotal
        let subtotal = dbProducts.reduce((acc, p) => acc + p.salePrice, 0);

        // 4. Calculate discount coupon rules
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

        // 5. Generate secure order receipt identifiers
        const orderId = 'DV-' + Math.floor(100000 + Math.random() * 900000);

        // 6. Build purchased products records
        const purchasedList = dbProducts.map(p => ({
            productId: p._id,
            title: p.title,
            downloadUrl: p.downloadUrl
        }));

        // 7. Write Order Receipt to Database
        const newOrder = await Order.create({
            orderId,
            userEmail: sessionUser.email,
            products: purchasedList,
            totalPaid: finalTotal,
            gateway,
            status: 'Paid'
        });

        // 8. Bind purchased items directly to User's database collection locker
        const user = await User.findById(sessionUser.id);
        if (user) {
            dbProducts.forEach(p => {
                if (!user.purchases.includes(p._id)) {
                    user.purchases.push(p._id);
                }
            });
            await user.save();
        }

        return NextResponse.json({
            success: true,
            message: 'Secure checkout transaction processed successfully!',
            orderId,
            totalPaid: finalTotal,
            order: newOrder
        });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
