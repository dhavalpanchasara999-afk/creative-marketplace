import mongoose from 'mongoose';

// 1. MONGODB CONNECTION POOLING ENGINE
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside your project configuration.');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
            return mongooseInstance;
        });
    }
    
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

// 2. MONGOOSE SCHEMA DEFINITIONS

// A. User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    purchases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    createdAt: { type: Date, default: Date.now }
});

// B. Product Schema
const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    rating: { type: Number, default: 5 },
    salePrice: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    thumbnail: { type: String, required: true },
    downloadUrl: { type: String, required: true },
    shortDescription: { type: String },
    customLandingUrl: { type: String },
    tags: [String],
    featured: { type: Boolean, default: false },
    premiumAsset: { type: Boolean, default: true },
    reviews: [{
        name: String,
        text: String,
        rating: Number,
        createdAt: { type: Date, default: Date.now }
    }],
    status: { type: String, enum: ['enabled', 'disabled'], default: 'enabled' }
});

// C. Orders & Invoices Schema
const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    userEmail: { type: String, required: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: String,
        downloadUrl: String
    }],
    totalPaid: { type: Number, required: true },
    gateway: { type: String, required: true },
    status: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

// D. Homepage Dynamic CMS Configurations Schema
const CMSConfigSchema = new mongoose.Schema({
    brandName: { type: String, default: "DigiVault" },
    brandDomain: { type: String, default: "digivault.co.in" },
    supportEmail: { type: String, default: "support@digivault.co.in" },
    logoUrl: { type: String, default: "" },
    logoHeight: { type: String, default: "52px" },
    primaryColor: { type: String, default: "#3b82f6" },
    secondaryColor: { type: String, default: "#8b5cf6" },
    announcementText: { type: String, default: "" },
    heroHeadline: { type: String, default: "Unlock Your <span class='text-gradient'>Creative Potential</span>" },
    heroSub: { type: String, default: "Access thousands of premium digital assets, courses, and templates designed to elevate your creative projects. The ultimate vault for modern creators." },
    heroCtaLabel: { type: String, default: "Explore Our Creative Vault" },
    offerTitle: { type: String, default: "Get up to 70% OFF!" },
    offerSub: { type: String, default: "Last Chance! Price will increase soon. Don't miss out on premium assets at fraction of the cost." },
    countdownHours: { type: Number, default: 24 },
    footerTagline: { type: String, default: "The ultimate premium marketplace for creators, designers, and professionals." },
    footerCopyright: { type: String, default: "© 2026 DigiVault Premium Marketplace. All rights reserved. Built for creators." },
    contactPhone: { type: String, default: "+91 99999 88888" },
    contactAddress: { type: String, default: "DigiVault Technologies, 3rd Floor, Connaught Place, New Delhi, Delhi 110001, India" },
    contactHeading: { type: String, default: "Contact Customer Support" },
    contactSub: { type: String, default: "Have an issue with your digital locker, or need custom licensing? Our dedicated customer success team is here to assist you." },
    policyTerms: { type: String, default: "" },
    policyPrivacy: { type: String, default: "" },
    policyRefund: { type: String, default: "" },
    aboutHeading: { type: String, default: "About DigiVault" },
    aboutContentHTML: { type: String, default: "" }
});

// 3. CACHED MODEL EXPORTS
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const CMSConfig = mongoose.models.CMSConfig || mongoose.model('CMSConfig', CMSConfigSchema);
