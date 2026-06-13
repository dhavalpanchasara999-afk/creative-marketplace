import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getAuthenticatedUser } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        // Configure Cloudinary dynamically inside the request handler
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // 1. Authenticate user (Admin only)
        const sessionUser = getAuthenticatedUser(req);
        if (!sessionUser || sessionUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized Administrative Action' }, { status: 403 });
        }

        // 2. Parse FormData
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
        }

        // Validate file size (max 5MB)
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'Image size exceeds the 5MB limit' }, { status: 400 });
        }

        // 3. Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 4. Upload to Cloudinary using upload_stream
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: 'digivault_products',
                transformation: [
                    { width: 800, crop: 'limit' }, // Limit to max 800px width for storefront optimized images
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(buffer);
        });

        return NextResponse.json({
            success: true,
            message: 'Image uploaded successfully!',
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        });
    } catch (e) {
        console.error('Upload API Error:', e);
        return NextResponse.json({ error: e.message || 'Image upload failed' }, { status: 500 });
    }
}
