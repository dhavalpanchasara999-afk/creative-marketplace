import { NextResponse } from 'next/server';
import { connectToDatabase, User, Product } from '../../../../lib/db';
import { getAuthenticatedUser } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

// GET SECURE STREAM - Redirects to high-bandwidth file links if verified
export async function GET(req, { params }) {
    try {
        await connectToDatabase();
        const productId = params.id;

        if (!productId) {
            return NextResponse.json({ error: 'Product ID parameter is required' }, { status: 400 });
        }

        // 1. Authenticate user session
        const sessionUser = getAuthenticatedUser(req);
        if (!sessionUser) {
            return NextResponse.json({ error: 'Authentication required. Please login.' }, { status: 401 });
        }

        // 2. Fetch User database file to verify purchases locker array
        const user = await User.findById(sessionUser.id);
        if (!user) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        // 3. Verify digital asset ownership privilege
        const isPurchased = user.purchases.includes(productId) || sessionUser.role === 'admin';
        if (!isPurchased) {
            return NextResponse.json({
                error: 'Access Denied. You have not purchased this digital file yet. Please complete checkout.'
            }, { status: 403 });
        }

        // 4. Fetch the private download URL from database
        const product = await Product.findById(productId);
        if (!product || !product.downloadUrl) {
            return NextResponse.json({ error: 'Downloadable resource file not found' }, { status: 404 });
        }

        // 5. Perform secure high-bandwidth redirect
        return NextResponse.redirect(new URL(product.downloadUrl));
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
