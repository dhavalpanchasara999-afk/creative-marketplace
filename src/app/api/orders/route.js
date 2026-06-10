import { NextResponse } from 'next/server';
import { connectToDatabase, Order } from '../../../lib/db';
import { getAuthenticatedUser } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await connectToDatabase();
        const user = getAuthenticatedUser(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orders = await Order.find().sort({ createdAt: -1 });
        return NextResponse.json({ success: true, orders });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
