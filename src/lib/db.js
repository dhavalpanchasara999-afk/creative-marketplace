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

// 2. MONGOOSE SCHEMA SCHEDULERS

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
    tags: [String],
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
    brandDomain: { type: String, default: "digivault.in" },
    supportEmail: { type: String, default: "support@digivault.in" },
    primaryColor: { type: String, default: "#3b82f6" },
    secondaryColor: { type: String, default: "#8b5cf6" },
    announcementText: { type: String, required: true },
    heroHeadline: { type: String, required: true },
    heroSub: { type: String, required: true },
    heroCtaLabel: { type: String, default: "Explore Our Creative Vault" },
    offerTitle: { type: String, required: true },
    offerSub: { type: String, required: true },
    countdownHours: { type: Number, default: 24 },
    footerTagline: { type: String, required: true },
    footerCopyright: { type: String, required: true }
});

// 3. CACHED MODEL EXPORTS (Avoid model rebuild compilation errors in dev hot reloading)
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const CMSConfig = mongoose.models.CMSConfig || mongoose.model('CMSConfig', CMSConfigSchema);
