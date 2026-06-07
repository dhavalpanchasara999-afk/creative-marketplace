import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase, Order, Product, User } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        await connectToDatabase();

        // Retrieve raw body buffer to verify webhook signature
        const rawBody = await req.text();
        const signature = req.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Webhook signature is required' }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('hex');

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: 'Webhook signature validation failed' }, { status: 400 });
        }

        const payload = JSON.parse(rawBody);
        const event = payload.event;

        if (event !== 'payment.captured') {
            // Ignore other events but return 200 OK
            return NextResponse.json({ success: true, message: 'Event ignored: ' + event });
        }

        const payment = payload.payload.payment.entity;
        const notes = payment.notes;
        const orderId = payment.order_id;
        const email = notes.email || payment.email;
        const userId = notes.userId;
        const productIdsStr = notes.productIds;

        if (!orderId) {
            return NextResponse.json({ error: 'Razorpay order ID not found in payload' }, { status: 400 });
        }

        // Check if the order is already fulfilled
        const existingOrder = await Order.findOne({ orderId: orderId });
        if (existingOrder) {
            return NextResponse.json({ success: true, message: 'Order already processed (idempotent)' });
        }

        // Fulfillment details
        const productIds = productIdsStr ? productIdsStr.split(',') : [];
        const dbProducts = await Product.find({ _id: { $in: productIds } });

        const purchasedList = dbProducts.map(p => ({
            productId: p._id,
            title: p.title,
            downloadUrl: p.downloadUrl
        }));

        const totalPaid = Math.round(payment.amount / 100);

        // Save order receipt to MongoDB
        const newOrder = await Order.create({
            orderId: orderId,
            userEmail: email,
            products: purchasedList,
            totalPaid: totalPaid,
            gateway: 'Razorpay Webhook',
            status: 'Paid'
        });

        // Add to user dashboard locker
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                dbProducts.forEach(p => {
                    if (!user.purchases.includes(p._id)) {
                        user.purchases.push(p._id);
                    }
                });
                await user.save();
            }
        }

        // Trigger delivery email simulation
        console.log(`[WEBHOOK EMAIL] Webhook verified payment.captured. Sending receipt to ${email} for order ${orderId}.`);

        return NextResponse.json({ success: true, message: 'Webhook processed and order fulfilled successfully!' });

    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
