import { NextResponse } from 'next/server';
import { connectToDatabase, CMSConfig } from '../../../lib/db';
import { getAuthenticatedUser } from '../../../lib/auth';

// GET - Public endpoint to fetch CMS config
export async function GET(req) {
    try {
        await connectToDatabase();
        let config = await CMSConfig.findOne();
        if (!config) {
            config = await CMSConfig.create({});
        }
        return NextResponse.json({ success: true, config });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PUT - Admin-only endpoint to update CMS config
export async function PUT(req) {
    try {
        await connectToDatabase();
        const sessionUser = getAuthenticatedUser(req);
        if (!sessionUser || sessionUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized Administrative Action' }, { status: 403 });
        }
        const body = await req.json();
        let config = await CMSConfig.findOne();
        if (!config) {
            config = await CMSConfig.create(body);
        } else {
            Object.assign(config, body);
            await config.save();
        }
        return NextResponse.json({ success: true, message: 'CMS configuration updated successfully!', config });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
