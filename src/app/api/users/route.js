import { NextResponse } from 'next/server';
import { connectToDatabase, User } from '../../../lib/db';
import { getAuthenticatedUser } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await connectToDatabase();
        const user = getAuthenticatedUser(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await User.find().select('-password').sort({ createdAt: -1 });
        return NextResponse.json({ success: true, users });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
