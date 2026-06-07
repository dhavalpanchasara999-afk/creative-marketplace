import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { connectToDatabase, Product } from '../../../lib/db';
import { getAuthenticatedUser } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
    try {
        await connectToDatabase();

        const sessionUser = getAuthenticatedUser(req);
        if (!sessionUser) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const body = await req.json();
        const { cartItems, couponCode } = body;

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return NextResponse.json({ error: 'Shopping cart is empty' }, { status: 400 });
        }

        const productIds = cartItems.map(item => item.id || item._id);
        const dbProducts = await Product.find({ _id: { $in: productIds } });

        if (dbProducts.length === 0) {
            return NextResponse.json({ error: 'Products not found in store catalog' }, { status: 400 });
        }

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

        const options = {
            amount: finalTotal * 100, // Amount in paise
            currency: 'INR',
            receipt: 'rcpt_' + Math.floor(100000 + Math.random() * 900000),
            notes: {
                userId: sessionUser.id,
                email: sessionUser.email,
                productIds: productIds.join(','),
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        });

    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
