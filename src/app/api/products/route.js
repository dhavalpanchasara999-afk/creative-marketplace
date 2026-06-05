import { NextResponse } from 'next/server';
import { connectToDatabase, Product } from '../../../lib/db';
import { getAuthenticatedUser } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

// 1. GET CATALOG - Fetch and filter digital products publically
export async function GET(req) {
    try {
        await connectToDatabase();
        
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort');
        const rating = searchParams.get('rating');

        let query = { status: 'enabled' };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        if (rating) {
            query.rating = { $gte: Number(rating) };
        }

        let productsQuery = Product.find(query);

        // Sorting definitions
        if (sort === 'price-low') {
            productsQuery = productsQuery.sort({ salePrice: 1 });
        } else if (sort === 'price-high') {
            productsQuery = productsQuery.sort({ salePrice: -1 });
        } else if (sort === 'rating') {
            productsQuery = productsQuery.sort({ rating: -1 });
        } else {
            productsQuery = productsQuery.sort({ createdAt: -1 });
        }

        const products = await productsQuery;
        return NextResponse.json({ success: true, count: products.length, products });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// 2. POST CREATION - Add a new digital product to DB (Admin only)
export async function POST(req) {
    try {
        await connectToDatabase();
        const sessionUser = getAuthenticatedUser(req);

        if (!sessionUser || sessionUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized Administrative Action' }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, category, salePrice, originalPrice, thumbnail, downloadUrl, tags, featured, premiumAsset } = body;

        if (!title || !description || !category || !salePrice || !originalPrice || !thumbnail || !downloadUrl) {
            return NextResponse.json({ error: 'Missing required digital asset parameters' }, { status: 400 });
        }

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const tagsArray = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;

        const newProduct = await Product.create({
            title,
            slug,
            description,
            category,
            salePrice: Number(salePrice),
            originalPrice: Number(originalPrice),
            thumbnail,
            downloadUrl,
            tags: tagsArray || [],
            featured: featured === true || featured === 'true',
            premiumAsset: premiumAsset === true || premiumAsset === 'true'
        });

        return NextResponse.json({ success: true, message: 'Digital product created successfully!', product: newProduct });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// 3. PUT MODIFICATION - Edit an existing digital product (Admin only)
export async function PUT(req) {
    try {
        await connectToDatabase();
        const sessionUser = getAuthenticatedUser(req);

        if (!sessionUser || sessionUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized Administrative Action' }, { status: 403 });
        }

        const body = await req.json();
        const { id, title, description, category, rating, salePrice, originalPrice, thumbnail, downloadUrl, tags, status, featured, premiumAsset } = body;

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required for editing' }, { status: 400 });
        }

        const tagsArray = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;

        const updated = await Product.findByIdAndUpdate(
            id,
            {
                title,
                description,
                category,
                rating: Number(rating),
                salePrice: Number(salePrice),
                originalPrice: Number(originalPrice),
                thumbnail,
                downloadUrl,
                tags: tagsArray,
                status,
                featured: featured === true || featured === 'true',
                premiumAsset: premiumAsset === true || premiumAsset === 'true'
            },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ error: 'Product file not found in collection' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Digital product updated successfully!', product: updated });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// 4. DELETE REMOVAL - Permanently delete a digital product from inventory (Admin only)
export async function DELETE(req) {
    try {
        await connectToDatabase();
        const sessionUser = getAuthenticatedUser(req);

        if (!sessionUser || sessionUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized Administrative Action' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required in query parameters' }, { status: 400 });
        }

        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Digital product permanently deleted from database inventory.' });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
