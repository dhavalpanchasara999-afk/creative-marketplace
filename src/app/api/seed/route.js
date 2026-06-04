import { NextResponse } from 'next/server';
import { connectToDatabase, User, Product, CMSConfig } from '../../../lib/db';
import { hashPassword } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        if (key !== 'digivault_seed_2026') {
            return NextResponse.json({ error: 'Invalid seed key' }, { status: 403 });
        }

        await connectToDatabase();

        // Check if already seeded
        const existingProducts = await Product.countDocuments();
        if (existingProducts > 0) {
            return NextResponse.json({ error: 'Database already seeded. Delete collections first to re-seed.' }, { status: 400 });
        }

        // 1. Create Admin User
        const adminHash = await hashPassword('admin123');
        await User.create({
            name: 'DigiVault Admin',
            email: 'admin@digivault.in',
            password: adminHash,
            role: 'admin'
        });

        // 2. Create Demo User
        const userHash = await hashPassword('user123');
        await User.create({
            name: 'Creative User',
            email: 'user@digivault.in',
            password: userHash,
            role: 'user'
        });

        // 3. Create Products
        const defaultThumb = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
        const products = [
            {
                title: 'Graphics Design Mastery Bundle',
                slug: 'graphics-design-mastery-bundle',
                description: 'The ultimate collection of premium graphic design assets, templates, and resources for creative professionals.',
                category: 'graphic-assets',
                rating: 5,
                salePrice: 499,
                originalPrice: 4999,
                thumbnail: defaultThumb,
                downloadUrl: 'https://drive.google.com/uc?export=download&id=graphics_mastery_zip_mock',
                tags: ['graphics', 'design', 'templates', 'premium'],
                featured: true,
                status: 'enabled'
            },
            {
                title: 'Video Creator Pro Suite',
                slug: 'video-creator-pro-suite',
                description: 'Professional video editing templates, transitions, effects, and motion graphics for content creators.',
                category: 'video-templates',
                rating: 5,
                salePrice: 599,
                originalPrice: 5999,
                thumbnail: defaultThumb,
                downloadUrl: 'https://drive.google.com/uc?export=download&id=video_creator_zip_mock',
                tags: ['video', 'editing', 'motion', 'effects'],
                featured: false,
                status: 'enabled'
            },
            {
                title: 'T-Shirt & Merch Design Pack',
                slug: 't-shirt-merch-design-pack',
                description: 'Ready-to-print t-shirt designs, mockups, and merchandise templates for print-on-demand businesses.',
                category: 'templates',
                rating: 5,
                salePrice: 349,
                originalPrice: 3499,
                thumbnail: defaultThumb,
                downloadUrl: 'https://drive.google.com/uc?export=download&id=tshirt_designs_zip_mock',
                tags: ['tshirt', 'merch', 'print', 'design'],
                featured: false,
                status: 'enabled'
            },
            {
                title: 'Premium Fonts Vault',
                slug: 'premium-fonts-vault',
                description: 'A curated collection of 500+ premium fonts including display, serif, sans-serif, and handwritten styles.',
                category: 'fonts',
                rating: 5,
                salePrice: 249,
                originalPrice: 2499,
                thumbnail: defaultThumb,
                downloadUrl: 'https://drive.google.com/uc?export=download&id=fonts_vault_zip_mock',
                tags: ['fonts', 'typography', 'display', 'serif'],
                featured: false,
                status: 'enabled'
            },
            {
                title: 'AI Prompts Mega Library',
                slug: 'ai-prompts-mega-library',
                description: 'Over 10,000 expertly crafted AI prompts for ChatGPT, Midjourney, and Stable Diffusion.',
                category: 'ai-prompts',
                rating: 5,
                salePrice: 199,
                originalPrice: 1999,
                thumbnail: defaultThumb,
                downloadUrl: 'https://drive.google.com/uc?export=download&id=ai_prompts_pdf_mock',
                tags: ['ai', 'prompts', 'chatgpt', 'midjourney'],
                featured: false,
                status: 'enabled'
            },
            {
                title: 'SaaS Landing Pages Kit',
                slug: 'saas-landing-pages-kit',
                description: 'High-converting SaaS landing page templates built with modern design principles.',
                category: 'templates',
                rating: 5,
                salePrice: 449,
                originalPrice: 4499,
                thumbnail: defaultThumb,
                downloadUrl: 'https://drive.google.com/uc?export=download&id=saas_pages_zip_mock',
                tags: ['saas', 'landing', 'pages', 'conversion'],
                featured: false,
                status: 'enabled'
            },
            {
                title: 'E-books Creator Vault',
                slug: 'e-books-creator-vault',
                description: 'Everything you need to create, design, and publish professional e-books and digital guides.',
                category: 'e-books',
                rating: 5,
                salePrice: 299,
                originalPrice: 2999,
                thumbnail: defaultThumb,
                downloadUrl: 'https://drive.google.com/uc?export=download&id=ebooks_vault_zip_mock',
                tags: ['ebooks', 'publishing', 'writing', 'digital'],
                featured: true,
                status: 'enabled'
            },
            {
                title: 'Freelance Business Mastery',
                slug: 'freelance-business-mastery',
                description: 'Complete course bundle on building a six-figure freelancing business from scratch.',
                category: 'courses',
                rating: 5,
                salePrice: 699,
                originalPrice: 6999,
                thumbnail: defaultThumb,
                downloadUrl: 'https://drive.google.com/uc?export=download&id=freelance_course_zip_mock',
                tags: ['freelance', 'business', 'course', 'income'],
                featured: false,
                status: 'enabled'
            },
            {
                title: 'Marathi Calligraphy Fonts',
                slug: 'marathi-calligraphy-fonts',
                description: 'Exclusive collection of 200+ Marathi calligraphy and Devanagari fonts for designers.',
                category: 'fonts',
                rating: 5,
                salePrice: 249,
                originalPrice: 999,
                thumbnail: defaultThumb,
                downloadUrl: 'https://drive.google.com/uc?export=download&id=fonts_vault_zip_mock',
                tags: ['marathi', 'calligraphy', 'devanagari', 'fonts'],
                featured: true,
                status: 'enabled'
            }
        ];

        await Product.insertMany(products);

        // 4. Create CMS Config with defaults
        await CMSConfig.create({});

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully!',
            summary: {
                users: 2,
                products: products.length,
                cmsConfig: 1
            }
        });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
