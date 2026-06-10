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

        const paidOrders = await Order.find({ status: 'Paid' });

        let totalRevenue = 0;
        let weeklySales = 0;
        let monthlySales = 0;

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const productSales = {};

        paidOrders.forEach(o => {
            const orderDate = new Date(o.createdAt);
            const amount = o.totalPaid;
            totalRevenue += amount;

            if (orderDate >= oneWeekAgo) {
                weeklySales += amount;
            }
            if (orderDate >= oneMonthAgo) {
                monthlySales += amount;
            }

            o.products.forEach(p => {
                if (!productSales[p.title]) {
                    productSales[p.title] = { title: p.title, revenue: 0, count: 0 };
                }
                productSales[p.title].revenue += amount / o.products.length;
                productSales[p.title].count += 1;
            });
        });

        return NextResponse.json({
            success: true,
            analytics: {
                totalRevenue,
                weeklySales,
                monthlySales,
                productWise: Object.values(productSales).sort((a, b) => b.revenue - a.revenue)
            }
        });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
