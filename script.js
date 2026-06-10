/*
========================================================================
   DIGIVAULT CENTRAL DYNAMIC OPERATIONS ENGINE (LocalStorage Full-Stack SPA)
========================================================================
*/

// Force clear old cached local storage DB layouts once to ensure the new features are synchronized
const DB_VERSION = "2.2";
if (typeof window !== 'undefined' && window.localStorage) {
    if (localStorage.getItem('digivault_db_version') !== DB_VERSION) {
        localStorage.removeItem('digivault_products');
        localStorage.removeItem('digivault_categories');
        localStorage.removeItem('digivault_cms_config');
        localStorage.setItem('digivault_db_version', DB_VERSION);
    }
}


// --- API INTEGRATION HELPERS ---
function getAuthToken() {
    return localStorage.getItem('digivault_auth_token');
}
function setAuthToken(token) {
    localStorage.setItem('digivault_auth_token', token);
}
function removeAuthToken() {
    localStorage.removeItem('digivault_auth_token');
}

async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(endpoint, { ...options, headers, signal: controller.signal });
        clearTimeout(timeoutId);
        return await res.json();
    } catch (err) {
        console.warn('API request failed:', endpoint, err);
        return null;
    }
}

async function saveCmsToApi() {
    if (_isInitializing) return;
    const result = await apiRequest('/api/cms', {
        method: 'PUT',
        body: JSON.stringify(CMS_CONFIG)
    });
    if (result && result.success) console.log('CMS saved to DB');
}

let _isInitializing = true;

async function loadDataFromApi() {
    try {
        const [prodRes, cmsRes] = await Promise.all([
            apiRequest('/api/products'),
            apiRequest('/api/cms')
        ]);
        if (prodRes && prodRes.success && prodRes.products && prodRes.products.length > 0) {
            PRODUCTS = prodRes.products.map(p => ({ ...p, id: p._id || p.id }));
            saveDb('products', PRODUCTS);
        }
        if (cmsRes && cmsRes.success && cmsRes.config) {
            CMS_CONFIG = Object.assign({}, INITIAL_CMS_CONFIG, cmsRes.config);
            saveDb('cms_config', CMS_CONFIG);
    saveCmsToApi();
        }
    } catch (err) {
        console.warn('API load failed, using local cache:', err);
    }
}

// --- 1. LOCAL DATA STORES & SEED DATA DEFINITIONS ---
const INITIAL_PRODUCTS = [
    {
        id: 1,
        title: "Graphics Mastery Combo Pack",
        slug: "graphics-mastery-combo",
        description: "Ultimate collection of 90,000+ premium graphics assets, vector templates, photoshop mockups, UI elements, and pre-made vector graphics. Lifetime access with future bundle additions absolutely free. Designed to accelerate your professional design workflows.",
        category: "Graphic Assets",
        rating: 5,
        salePrice: 399,
        originalPrice: 10999,
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        downloadUrl: "https://drive.google.com/uc?export=download&id=graphics_mastery_zip_mock",
        tags: "graphics, templates, mockups, vector, psd",
        reviews: [],
        featured: true
    },
    {
        id: 2,
        title: "Video Creator Mega Bundle",
        slug: "video-creator-mega-bundle",
        description: "Over 30,000+ ready-to-use premium video assets, after effects templates, transition effects, background audio tracks, LUT color profiles, and lower thirds vectors. Perfect for digital marketers, freelance video editors, and content creators.",
        category: "Video Templates",
        rating: 5,
        salePrice: 399,
        originalPrice: 15999,
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        downloadUrl: "https://drive.google.com/uc?export=download&id=video_creator_zip_mock",
        tags: "video, effects, transitions, footage, presets",
        reviews: []
    },
    {
        id: 3,
        title: "T-Shirt Designs Engine",
        slug: "tshirt-designs-engine",
        description: "Over 2,00,000+ fully scalable vector designs and typography presets perfect for print-on-demand businesses, t-shirt designers, and custom clothing brands. Easy customization in Illustrator.",
        category: "Graphic Assets",
        rating: 5,
        salePrice: 299,
        originalPrice: 8999,
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        downloadUrl: "https://drive.google.com/uc?export=download&id=tshirt_designs_zip_mock",
        tags: "tshirt, designs, vectors, printing, clothing",
        reviews: []
    },
    {
        id: 4,
        title: "Premium Fonts Mega Pack",
        slug: "premium-fonts-mega-pack",
        description: "Access 10,000+ premium display typography, modern sans-serif, brush calligraphy, and standard publishing fonts. Elevate your banner headers, editorial designs, and visual branding.",
        category: "Graphic Assets",
        rating: 5,
        salePrice: 199,
        originalPrice: 4999,
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        downloadUrl: "https://drive.google.com/uc?export=download&id=fonts_vault_zip_mock",
        tags: "fonts, typography, calligraphy, vectors, headers",
        reviews: []
    },
    {
        id: 5,
        title: "Artificial Intelligence Prompts Vault",
        slug: "ai-prompts-vault",
        description: "Over 50,000+ masterfully structured prompts for ChatGPT, Midjourney, Stable Diffusion, and Bard. Boost your content creation speed, generate beautiful generative artwork, and automate programming tasks.",
        category: "Online Courses",
        rating: 5,
        salePrice: 149,
        originalPrice: 2999,
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        downloadUrl: "https://drive.google.com/uc?export=download&id=ai_prompts_pdf_mock",
        tags: "ai, prompts, chatgpt, midjourney, coding",
        reviews: []
    },
    {
        id: 6,
        title: "Premium SaaS Pages Templates",
        slug: "premium-saas-pages-templates",
        description: "Fully responsive, modular HTML5/TailwindCSS templates for landing pages, user settings dashboard, checkout flows, and analytics panels. High-converting layouts built with clean code.",
        category: "Web Templates",
        rating: 5,
        salePrice: 349,
        originalPrice: 9999,
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        downloadUrl: "https://drive.google.com/uc?export=download&id=saas_pages_zip_mock",
        tags: "html, templates, saas, tailwind, coding",
        reviews: []
    },
    {
        id: 7,
        title: "1,200+ eBooks & 1,000+ Audiobooks Bundle",
        slug: "ebooks-audiobooks-bundle",
        description: "Access the absolute ultimate digital growth library containing 1,200+ self-growth bestsellers and 1,000+ high-definition audiobooks folders. Fully editable with private label resell rights.",
        category: "E-Books",
        rating: 5,
        salePrice: 249,
        originalPrice: 217800,
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        downloadUrl: "https://drive.google.com/uc?export=download&id=ebooks_vault_zip_mock",
        tags: "ebooks, audiobooks, resell, selfgrowth, library",
        reviews: [],
        featured: true
    },
    {
        id: 8,
        title: "The Zero-to-One Freelancing Course",
        slug: "zero-to-one-freelancing",
        description: "The complete, step-by-step masterclass teaching you how to land high-paying international clients, secure recurring retainers, draft bulletproof proposals, and build an agency.",
        category: "Online Courses",
        rating: 5,
        salePrice: 399,
        originalPrice: 14999,
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        downloadUrl: "https://drive.google.com/uc?export=download&id=freelance_course_zip_mock",
        tags: "freelance, course, business, agency, marketing",
        reviews: []
    },
    {
        id: 9,
        title: "300+ Premium Marathi Fonts & Converter",
        slug: "marathi-fonts-pack",
        description: "Get 1000+ premium Marathi calligraphy, bold display, and modern sans-serif fonts plus a free offline converter tool for ₹99. Instant delivery.",
        shortDescription: "300+ Premium calligraphy, display & sans-serif Marathi fonts with conversion tool.",
        customLandingUrl: "marathi-fonts.html",
        category: "Graphic Assets",
        rating: 5,
        salePrice: 99,
        originalPrice: 1999,
        thumbnail: "assets/marathi_fonts_bundle_box.png",
        downloadUrl: "https://drive.google.com/uc?export=download&id=fonts_vault_zip_mock",
        tags: "fonts, marathi, calligraphy, converter, banner",
        reviews: [],
        featured: true
    }
];

const INITIAL_CATEGORIES = [
    { name: "Courses", icon: "🎓", slug: "courses", status: "enabled" },
    { name: "E-books", icon: "📚", slug: "e-books", status: "enabled" },
    { name: "Templates", icon: "💻", slug: "templates", status: "enabled" },
    { name: "Fonts", icon: "✍️", slug: "fonts", status: "enabled" },
    { name: "AI Prompts", icon: "🧠", slug: "ai-prompts", status: "enabled" },
    { name: "Graphic Assets", icon: "🎨", slug: "graphic-assets", status: "enabled" },
    { name: "Video Templates", icon: "🎬", slug: "video-templates", status: "enabled" }
];

const INITIAL_CMS_CONFIG = {
    brandName: "DigiVault",
    brandDomain: "digivault.in",
    heroBg: "",
    supportEmail: "support@digivault.in",
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdERfxvscrw9MZOLZxbaEZTBme3y0v-I795Oblk90GRbwajZKrVuCwIznmDf2PScUjdQf54FUcgFRiJc-_qGqXiEMCu3y2Zy05GrcGiXDcCuq-5Xla9PVAULpPtNxJcXQrGJlCaCe1IDQ1Fd699SDs8HtIWqmeO2BjbZDw4cgA0-ohG8aF5Y1Z8e-Qn2Y9h9cKsrdq9YXovNk1tGSID5fV4oqkgX245hdh2AegWCzuO2oaVUUXOrdp_wULt7lkwOrjBTxbP5Awf1sb",
    logoHeight: "52px",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    announcementText: "⚡ Limited Period Offer- Get up to 70% Off Premium Asset Vaults! Instant Locker Delivery ⚡",
    heroHeadline: "Unlock Your <span class='text-gradient'>Creative Potential</span>",
    heroSub: "Access thousands of premium digital assets, courses, and templates designed to elevate your creative projects. The ultimate vault for modern creators.",
    heroCtaLabel: "Explore Our Creative Vault",
    offerTitle: "Get up to 70% OFF!",
    offerSub: "Last Chance! Price will increase soon. Don't miss out on premium assets at fraction of the cost.",
    countdownHours: 24,
    footerTagline: "The ultimate premium marketplace for creators, designers, and professionals.",
    footerCopyright: "© 2026 DigiVault Premium Marketplace. All rights reserved. Built for creators.",
    
    // Extended contact configurations
    contactPhone: "+91 99999 88888",
    contactAddress: "DigiVault Technologies, 3rd Floor, Connaught Place, New Delhi, Delhi 110001, India",
    contactHeading: "Contact Customer Support",
    contactSub: "Have an issue with your digital locker, or need custom licensing? Our dedicated customer success team is here to assist you.",
    
    // Dynamic Policies HTML
    policyTerms: `<h1>Terms & Conditions</h1>\n<p>Welcome to <strong>DigiVault</strong> (digivault.in). By using our digital marketplace website, you agree to comply with and be bound by the following Terms and Conditions of service.</p>\n<h3>1. Licensing and Intellectual Property</h3>\n<p>All digital products sold on DigiVault (including templates, e-books, courses, vector fonts, and graphics assets) are protected under global intellectual property laws. Upon purchasing, you receive a Personal and Commercial Project License. However, you are strictly prohibited from reselling, sub-licensing, redistributing, or sharing the actual download files to third parties.</p>\n<h3>2. Access and Digital Downloads Locker</h3>\n<p>Upon successfully purchasing a product, access keys will be generated and logged to your personal User Dashboard. Download links are stored in your secure locker with anti-sharing protocols.</p>`,
    
    policyPrivacy: `<h1>Privacy Policy</h1>\n<p>Your privacy is of critical importance to us. This Privacy Policy details the types of personal data we collect when you visit DigiVault Technologies (digivault.in) and how we secure it.</p>\n<h3>1. Collection of Personal Data</h3>\n<p>We collect essential information to set up your account profile and verify download keys, including Display Name, Mobile Number, and Deliverable Email address.</p>`,
    
    policyRefund: `<h1>Refund & Return Policy</h1>\n<p>At <strong>DigiVault</strong>, we are dedicated to providing premium digital files, courses, and design assets. Because our files are instantly downloadable upon payment, please review our refund limits carefully:</p>\n<h3>1. Downloadable Digital Products are Non-Returnable</h3>\n<p>Since digital files cannot be physically returned or revoked, all catalog purchases are strictly non-refundable once checkout is complete and links are generated.</p>`,

    // About Us Editor Default
    aboutHeading: "About DigiVault",
    aboutContentHTML: `<p>DigiVault is a premium startup-style digital products marketplace engineered for creative designers, freelance developers, and high-performance digital marketers.</p>\n<p>We believe that high-quality assets (such as customizable templates, high-definition fonts, specialized e-books, and modular vectors) should not carry astronomical, budget-breaking costs. Our core mission is to curate the absolute highest tier of digital files and bundle them at accessible prices for creators worldwide.</p>\n<h3>Our Operations</h3>\n<p>Registered legally as <strong>DigiVault Technologies</strong>, we operate out of our primary administrative offices in New Delhi:</p>\n<ul>\n    <li><strong>Registered Address:</strong> 3rd Floor, Connaught Place, New Delhi, Delhi 110001, India</li>\n    <li><strong>Support Helpline:</strong> support@digivault.in</li>\n</ul>`
};

const FEATURE_BENEFITS = [
    { icon: "⚡", title: "Lifetime Access", desc: "One-time payment for endless utility and assets use." },
    { icon: "🔄", title: "Free Future Updates", desc: "Stay current and download new files without extra costs." },
    { icon: "🛡️", title: "Genuine Products", desc: "Budget friendly, verified premium licensing quality." },
    { icon: "📦", title: "Instant Delivery", desc: "Download immediately from dashboard locker after checkout." },
    { icon: "💬", title: "Dedicated Support", desc: "We are here 24/7 via support email to help you succeed." },
    { icon: "🌍", title: "Anywhere, Anytime", desc: "Access your digital vault purchase folder from any device." }
];

const CUSTOMER_REVIEWS = [
    { name: "Nayna Sharma", role: "Digital Marketer", rating: 5, text: "This deal is SUPER! Fully satisfied. They have best features and awesome web templates, they have best designs. I'm so happy to sign up here." },
    { name: "Md Rizwan", role: "Freelancer", rating: 5, text: "The variety of stock options on DigiVault is incredible. As a digital creator, this is the best one-stop-shop I know for stock video, graphic templates, and fonts." },
    { name: "Santana Asharjee", role: "Video Editor", rating: 5, text: "Really a great collection of ready to use effects. People looking for instant video edits and easy workflows without complex tech knowledge can use this. Must use." }
];

// --- 2. LOCAL DATABASE ADAPTER UTILS ---
function getDb(key, defaultData) {
    const data = localStorage.getItem(`digivault_${key}`);
    if (data === null) {
        saveDb(key, defaultData);
        return defaultData;
    }
    return JSON.parse(data);
}

function saveDb(key, data) {
    localStorage.setItem(`digivault_${key}`, JSON.stringify(data));
}

// Global System Session Variables
let PRODUCTS = getDb('products', INITIAL_PRODUCTS);
let CATEGORIES = getDb('categories', INITIAL_CATEGORIES);
let CMS_CONFIG = getDb('cms_config', INITIAL_CMS_CONFIG);
// Self-healing merge to guarantee all fields are pre-filled on startup
CMS_CONFIG = Object.assign({}, INITIAL_CMS_CONFIG, CMS_CONFIG);
let COUPONS = getDb('coupons', [
    { code: "PROMO70", discountPercent: 70 },
    { code: "WELCOME10", discountPercent: 10 }
]);
let USERS = getDb('users', [
    { name: "DigiVault Admin", email: "admin@digivault.in", password: "admin123", role: "admin" },
    { name: "Creative User", email: "user@digivault.in", password: "user123", role: "user" }
]);
let ORDERS = getDb('orders', []);
let ACTIVE_USER = getDb('active_user', null);
let CART = getDb('cart', []);
let APPLIED_COUPON = null;

// Routing Views Config
const VIEWS = ['homeView', 'shopView', 'detailView', 'loginView', 'signupView', 'forgotPasswordView', 'resetPasswordCompletionView', 'userDashboardView', 'adminDashboardView', 'termsView', 'privacyView', 'refundView', 'aboutView', 'contactView'];
let currentView = 'homeView';

// --- 3. TOAST & NOTIFICATION ENGINES ---
function showToast(title, msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-alert ${type}`;
    
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-content">
            <h5>${title}</h5>
            <p>${msg}</p>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 400);
    }, 4500);
}

// Periodic Social Proof purchase alert loops
const INDIAN_NAMES = ["Rahul Sharma", "Priya Patel", "Aravind Nair", "Sneha Reddy", "Amit Gupta", "Neha Singh", "Siddharth V.", "Ananya Roy", "Rajesh Kumar", "Divya Pillai"];
function triggerSocialPurchaseAlert() {
    const ticker = document.getElementById('purchaseTicker');
    if (!ticker) return;

    // Pick random details
    const name = INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)];
    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    
    document.getElementById('tickerAvatarChar').textContent = name.charAt(0);
    document.getElementById('tickerCustomerName').textContent = name;
    document.getElementById('tickerProductName').textContent = `Just purchased the "${product.title}"`;

    ticker.classList.add('show');

    setTimeout(() => {
        ticker.classList.remove('show');
    }, 5000);
}

// --- 4. CORE ROUTING CONTROLLER ---
function routeTo(viewName) {
    // If navigating to anything other than reset-password, clear the token from URL so it doesn't persist
    if (viewName !== 'reset-password') {
        const url = new URL(window.location);
        if (url.searchParams.has('resetToken')) {
            url.searchParams.delete('resetToken');
            window.history.replaceState({}, document.title, url.toString());
        }
    }
    const targetMap = {
        'home': 'homeView',
        'shop': 'shopView',
        'detail': 'detailView',
        'login': 'loginView',
        'signup': 'signupView',
        'forgot-password': 'forgotPasswordView',
        'reset-password': 'resetPasswordCompletionView',
        'user-dashboard': 'userDashboardView',
        'admin-dashboard': 'adminDashboardView',
        'terms': 'termsView',
        'privacy': 'privacyView',
        'refund': 'refundView',
        'about': 'aboutView',
        'contact': 'contactView'
    };

    const targetView = targetMap[viewName] || 'homeView';
    
    // Auth route guards
    if (viewName === 'user-dashboard' && !ACTIVE_USER) {
        showToast("Authentication Required", "Please log in to access your digital downloads locker.", "error");
        routeTo('login');
        return;
    }

    if (viewName === 'admin-dashboard') {
        if (!ACTIVE_USER || ACTIVE_USER.role !== 'admin') {
            showToast("Access Denied", "Administrative role privileges are required to access this portal.", "error");
            routeTo('login');
            return;
        }
    }

    // Toggle Active Views
    VIEWS.forEach(viewId => {
        const el = document.getElementById(viewId);
        if (el) {
            el.classList.remove('active-view');
        }
    });

    const activeEl = document.getElementById(targetView);
    if (activeEl) {
        activeEl.classList.add('active-view');
    }

    currentView = targetView;
    window.scrollTo(0, 0);

    // Sync navbar link styles
    document.querySelectorAll('.nav-anchor').forEach(link => {
        link.classList.remove('active-nav');
    });
    
    // Highlight matching link
    const matchingLink = document.querySelector(`.nav-anchor[href="#${viewName}"]`);
    if (matchingLink) {
        matchingLink.classList.add('active-nav');
    }

    // Trigger page-specific renders
    if (viewName === 'home') renderHomeView();
    if (viewName === 'shop') renderShopView();
    if (viewName === 'user-dashboard') {
        renderUserDashboard();
        // Reset user dashboard tabs to the first tab (Downloads Locker)
        const userDashboard = document.getElementById('userDashboardView');
        if (userDashboard) {
            const navItems = userDashboard.querySelectorAll('.dash-sidebar-nav .dash-nav-item');
            const tabContents = userDashboard.querySelectorAll('.dash-tab-content');
            navItems.forEach((btn, idx) => {
                if (idx === 0) btn.classList.add('active-dash');
                else btn.classList.remove('active-dash');
            });
            tabContents.forEach((tab, idx) => {
                if (idx === 0) tab.classList.add('active');
                else tab.classList.remove('active');
            });
        }
    }
    if (viewName === 'admin-dashboard') {
        renderAdminDashboard();
        // Reset admin dashboard tabs to the first tab (Metrics Overview)
        const adminDashboard = document.getElementById('adminDashboardView');
        if (adminDashboard) {
            const navItems = adminDashboard.querySelectorAll('.dash-sidebar-nav .dash-nav-item');
            const tabContents = adminDashboard.querySelectorAll('.admin-tab-content');
            navItems.forEach((btn, idx) => {
                if (idx === 0) btn.classList.add('active-dash');
                else btn.classList.remove('active-dash');
            });
            tabContents.forEach((tab, idx) => {
                if (idx === 0) tab.classList.add('active');
                else tab.classList.remove('active');
            });
        }
    }

    // Setup Admin customized floating panel state
    const floatingCmsTrigger = document.getElementById('floatingCmsTrigger');
    if (floatingCmsTrigger) {
        if (ACTIVE_USER && ACTIVE_USER.role === 'admin') {
            floatingCmsTrigger.classList.remove('hide');
            floatingCmsTrigger.style.display = 'flex';
        } else {
            floatingCmsTrigger.classList.add('hide');
            floatingCmsTrigger.style.display = 'none';
        }
    }

    // Handle Mobile navbar drawer close on route change
    const navLinks = document.getElementById('navbarLinks');
    if (navLinks) navLinks.classList.remove('mobile-open');

    // Sync navbar action states
    syncNavActions();
}

function syncNavActions() {
    const btnAuth = document.getElementById('btnNavAuth');
    const badge = document.getElementById('navUserBadge');
    
    // Toggle Admin Customizer visibility
    const floatingCmsTrigger = document.getElementById('floatingCmsTrigger');
    const btnExportCms = document.getElementById('btnExportCms');
    const isAdmin = ACTIVE_USER && ACTIVE_USER.role === 'admin';
    
    if (floatingCmsTrigger) {
        if (isAdmin) {
            floatingCmsTrigger.classList.remove('hide');
            floatingCmsTrigger.style.display = 'flex';
        } else {
            floatingCmsTrigger.classList.add('hide');
            floatingCmsTrigger.style.display = 'none';
        }
    }
    
    if (btnExportCms) {
        if (isAdmin) {
            btnExportCms.style.display = 'block';
        } else {
            btnExportCms.style.display = 'none';
        }
    }
    
    if (ACTIVE_USER) {
        btnAuth.classList.add('hide');
        badge.classList.remove('hide');
        
        let dashboardBtn = ACTIVE_USER.role === 'admin' ? 
            `<button class="btn-nav-primary" onclick="routeTo('admin-dashboard')" style="background:var(--accent-purple); display:flex; align-items:center; gap:8px;"><i data-lucide="shield-check" style="width:16px;"></i> Admin Portal</button>` :
            `<button class="btn-nav-primary" onclick="routeTo('user-dashboard')" style="background:var(--grad-glow); border:1px solid var(--accent-blue); display:flex; align-items:center; gap:8px;"><i data-lucide="layout-dashboard" style="width:16px;"></i> Dashboard</button>`;
        
        badge.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                ${dashboardBtn}
                <button class="icon-btn" onclick="handleLogout()" title="Logout" style="color:var(--accent-red);"><i data-lucide="log-out"></i></button>
            </div>
        `;
        lucide.createIcons();
    } else {
        btnAuth.classList.remove('hide');
        badge.classList.add('hide');
    }
    
    // Sync cart badge count
    const navCartCount = document.getElementById('navCartCount');
    if (navCartCount) navCartCount.textContent = CART.length;
}

// Mobile hamburger toggle
function toggleMobileNav() {
    const navLinks = document.getElementById('navbarLinks');
    if (navLinks) navLinks.classList.toggle('mobile-open');
}

// --- 5. VISUAL CMS DATA BINDINGS ---
function loadCmsValuesIntoInputs() {
    const setCmsVal = (id, key) => {
        const el = document.getElementById(id);
        if (el) el.value = CMS_CONFIG[key] || "";
    };
    
    setCmsVal('cmsBrandName', 'brandName');
    setCmsVal('cmsBrandDomain', 'brandDomain');
    setCmsVal('cmsLogoUrl', 'logoUrl');
    setCmsVal('cmsSupportEmail', 'supportEmail');
    setCmsVal('cmsHeroHeadline', 'heroHeadline');
    setCmsVal('cmsHeroSub', 'heroSub');
    setCmsVal('cmsHeroCtaText', 'heroCtaLabel');
    setCmsVal('cmsHeroBg', 'heroBg');
    setCmsVal('cmsAnnText', 'announcementText');
    setCmsVal('cmsOfferTitle', 'offerTitle');
    setCmsVal('cmsOfferSub', 'offerSub');
    setCmsVal('cmsCountdownHours', 'countdownHours');
    setCmsVal('cmsFooterTag', 'footerTagline');
    setCmsVal('cmsFooterCopyright', 'footerCopyright');
    
    setCmsVal('cmsLogoHeight', 'logoHeight');
    setCmsVal('cmsAboutHeading', 'aboutHeading');
    setCmsVal('cmsAboutContentHTML', 'aboutContentHTML');
    
    // Extended contact details
    setCmsVal('cmsContactHeading', 'contactHeading');
    setCmsVal('cmsContactSub', 'contactSub');
    setCmsVal('cmsContactPhone', 'contactPhone');
    setCmsVal('cmsContactAddress', 'contactAddress');
    
    // Policies
    setCmsVal('cmsPolicyTerms', 'policyTerms');
    setCmsVal('cmsPolicyPrivacy', 'policyPrivacy');
    setCmsVal('cmsPolicyRefund', 'policyRefund');

    document.getElementById('cmsColPrimary').value = CMS_CONFIG.primaryColor;
    document.getElementById('cmsColSecondary').value = CMS_CONFIG.secondaryColor;
}

function applyCmsTheme() {
    const prim = document.getElementById('cmsColPrimary').value;
    const sec = document.getElementById('cmsColSecondary').value;
    
    CMS_CONFIG.primaryColor = prim;
    CMS_CONFIG.secondaryColor = sec;
    
    const root = document.documentElement;
    root.style.setProperty('--accent-blue', prim);
    root.style.setProperty('--accent-purple', sec);
    root.style.setProperty('--grad-primary', `linear-gradient(135deg, ${prim} 0%, ${sec} 100%)`);
    root.style.setProperty('--shadow-glow', `0 0 25px rgba(${hexToRgb(sec)}, 0.25)`);
    
    saveDb('cms_config', CMS_CONFIG);
    saveCmsToApi();
}

function hexToRgb(hex) {
    let bigint = parseInt(hex.replace('#', ''), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return `${r}, ${g}, ${b}`;
}

function applyCmsBranding() {
    const name = document.getElementById('cmsBrandName').value.trim();
    const domain = document.getElementById('cmsBrandDomain').value.trim();
    const email = document.getElementById('cmsSupportEmail').value.trim();
    const logoUrl = document.getElementById('cmsLogoUrl').value.trim();
    const logoHeight = document.getElementById('cmsLogoHeight').value.trim() || "52px";

    CMS_CONFIG.brandName = name;
    CMS_CONFIG.brandDomain = domain;
    CMS_CONFIG.supportEmail = email;
    CMS_CONFIG.logoUrl = logoUrl;
    CMS_CONFIG.logoHeight = logoHeight;

    const logoImgs = document.querySelectorAll('.brand-logo-img');
    logoImgs.forEach(img => {
        img.src = logoUrl;
    });

    document.documentElement.style.setProperty('--logo-height', logoHeight);

    const emailAnchor = document.getElementById('contactOfficeEmail');
    if (emailAnchor) {
        emailAnchor.href = "mailto:" + email;
        emailAnchor.textContent = email;
    }

    saveDb('cms_config', CMS_CONFIG);
    saveCmsToApi();
}

function applyCmsAbout() {
    const heading = document.getElementById('cmsAboutHeading').value.trim();
    const content = document.getElementById('cmsAboutContentHTML').value.trim();

    CMS_CONFIG.aboutHeading = heading;
    CMS_CONFIG.aboutContentHTML = content;

    const aboutBox = document.getElementById('aboutPageContentBox');
    if (aboutBox) {
        aboutBox.innerHTML = '<h1>' + heading + '</h1>' + content;
    }

    saveDb('cms_config', CMS_CONFIG);
    saveCmsToApi();
}

function applyCmsHero() {
    const head = document.getElementById('cmsHeroHeadline').value;
    const sub = document.getElementById('cmsHeroSub').value;
    const cta = document.getElementById('cmsHeroCtaText').value;

    CMS_CONFIG.heroHeadline = head;
    CMS_CONFIG.heroSub = sub;
    CMS_CONFIG.heroCtaLabel = cta;
    
    const bgVal = document.getElementById('cmsHeroBg') ? document.getElementById('cmsHeroBg').value : '';
    CMS_CONFIG.heroBg = bgVal;
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.background = bgVal || '';
    }

    const hTitle = document.getElementById('homeHeroTitle');
    const hSub = document.getElementById('homeHeroSubtitle');
    const hCta = document.getElementById('homeHeroCtaText');

    if (hTitle) hTitle.innerHTML = head;
    if (hSub) hSub.textContent = sub;
    if (hCta) hCta.textContent = cta;

    saveDb('cms_config', CMS_CONFIG);
    saveCmsToApi();
}

function applyCmsAnnouncement() {
    const text = document.getElementById('cmsAnnText').value;
    CMS_CONFIG.announcementText = text;
    
    const annSpan = document.getElementById('announcementText');
    if (annSpan) annSpan.textContent = text;

    saveDb('cms_config', CMS_CONFIG);
    saveCmsToApi();
}

function applyCmsScarcity() {
    const title = document.getElementById('cmsOfferTitle').value;
    const sub = document.getElementById('cmsOfferSub').value;
    const hrs = document.getElementById('cmsCountdownHours').value;

    CMS_CONFIG.offerTitle = title;
    CMS_CONFIG.offerSub = sub;
    CMS_CONFIG.countdownHours = Number(hrs);

    const bTitle = document.getElementById('homeOfferTitle');
    const bSub = document.getElementById('homeOfferSubtitle');

    if (bTitle) bTitle.textContent = title;
    if (bSub) bSub.textContent = sub;

    saveDb('cms_config', CMS_CONFIG);
    startScarcityTimer();
}

function applyCmsFooter() {
    const tag = document.getElementById('cmsFooterTag').value;
    const cop = document.getElementById('cmsFooterCopyright').value;
    const contactHeading = document.getElementById('cmsContactHeading').value;
    const contactSub = document.getElementById('cmsContactSub').value;
    const contactPhone = document.getElementById('cmsContactPhone').value;
    const contactAddress = document.getElementById('cmsContactAddress').value;

    CMS_CONFIG.footerTagline = tag;
    CMS_CONFIG.footerCopyright = cop;
    CMS_CONFIG.contactHeading = contactHeading;
    CMS_CONFIG.contactSub = contactSub;
    CMS_CONFIG.contactPhone = contactPhone;
    CMS_CONFIG.contactAddress = contactAddress;

    const fTag = document.getElementById('footerTaglineText');
    const fCop = document.getElementById('footerCopyrightText');

    if (fTag) fTag.textContent = tag;
    if (fCop) fCop.textContent = cop;

    // Contact page elements
    const cHead = document.getElementById('contactHeadingText');
    const cSub = document.getElementById('contactSubtext');
    const cPhone = document.getElementById('contactOfficePhone');
    const cAddress = document.getElementById('contactOfficeAddress');
    const cEmail = document.getElementById('contactOfficeEmail');

    if (cHead) cHead.textContent = contactHeading;
    if (cSub) cSub.textContent = contactSub;
    if (cPhone) cPhone.textContent = contactPhone;
    if (cAddress) cAddress.innerHTML = contactAddress.replace(/\n/g, '<br>');
    if (cEmail) {
        cEmail.href = `mailto:${CMS_CONFIG.supportEmail}`;
        cEmail.textContent = CMS_CONFIG.supportEmail;
    }

    saveDb('cms_config', CMS_CONFIG);
    saveCmsToApi();
}

function applyCmsPolicies() {
    const terms = document.getElementById('cmsPolicyTerms').value;
    const privacy = document.getElementById('cmsPolicyPrivacy').value;
    const refund = document.getElementById('cmsPolicyRefund').value;

    CMS_CONFIG.policyTerms = terms;
    CMS_CONFIG.policyPrivacy = privacy;
    CMS_CONFIG.policyRefund = refund;

    const termsBox = document.getElementById('termsContentBox');
    const privacyBox = document.getElementById('privacyContentBox');
    const refundBox = document.getElementById('refundContentBox');

    if (termsBox) termsBox.innerHTML = terms;
    if (privacyBox) privacyBox.innerHTML = privacy;
    if (refundBox) refundBox.innerHTML = refund;

    saveDb('cms_config', CMS_CONFIG);
    saveCmsToApi();
}

function exportCmsConfiguration() {
    const fileContent = `// --- DIGIVAULT CMS STATIC BACKUP CONFIGURATION ---\nconst DIGITAL_CMS_CONFIG = ${JSON.stringify(CMS_CONFIG, null, 4)};`;
    const blob = new Blob([fileContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    
    const dlLink = document.createElement('a');
    dlLink.href = url;
    dlLink.download = 'cms_backup_config.js';
    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
    URL.revokeObjectURL(url);
    
    showToast("Config Exported", "CMS JSON config downloaded successfully! Keep this as a dynamic homepage backup.", "success");
}

// Customizer drawers toggles
function toggleCustomizerSidebar() {
    const sidebar = document.getElementById('customizerSidebar');
    const overlay = document.getElementById('drawerOverlay');
    
    if (sidebar) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    }
}

function switchCustomizerTab(btn, tabId) {
    document.querySelectorAll('#customizerSidebar .custom-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#customizerSidebar .customizer-tab-content').forEach(t => t.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function closeAllDrawers() {
    document.getElementById('customizerSidebar').classList.remove('open');
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('drawerOverlay').classList.remove('show');
}

// --- 6. SHOPPING CART & COUPONS ENGINE ---
function toggleCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('drawerOverlay');
    
    if (drawer) {
        drawer.classList.toggle('open');
        overlay.classList.toggle('show');
        renderCartItems();
    }
}

function addToCart(productId, triggerRedirect = false) {
    const prod = PRODUCTS.find(p => String(p.id) === String(productId));
    if (!prod) return;

    if (CART.some(item => String(item.id) === String(productId))) {
        showToast("Cart Notice", `"${prod.title}" is already in your cart.`, "info");
        if (triggerRedirect) {
            toggleCartDrawer();
        }
        return;
    }

    CART.push(prod);
    saveDb('cart', CART);
    syncNavActions();
    showToast("Added to Cart", `"${prod.title}" added to shopping cart!`, "success");

    if (triggerRedirect) {
        toggleCartDrawer();
    }
}

function removeFromCart(productId) {
    CART = CART.filter(item => String(item.id) !== String(productId));
    saveDb('cart', CART);
    syncNavActions();
    renderCartItems();
    showToast("Removed from Cart", "Item removed from shopping cart.", "info");
}

function getCartSubtotal() {
    const total = CART.reduce((acc, item) => acc + item.salePrice, 0);
    if (APPLIED_COUPON) {
        return Math.round(total * (1 - APPLIED_COUPON.discountPercent / 100));
    }
    return total;
}

function renderCartItems() {
    const container = document.getElementById('cartItemsContainer');
    if (!container) return;

    container.innerHTML = '';

    if (CART.length === 0) {
        container.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:14px; text-align:center; color:var(--text-dim); margin-top: 60px;">
                <i data-lucide="shopping-cart" style="width:48px; height:48px;"></i>
                <p style="font-size:0.95rem; font-weight:600;">Your shopping cart is empty.</p>
                <button class="btn-nav-primary" onclick="closeAllDrawers(); routeTo('shop');" style="padding: 8px 18px; font-size:0.8rem;">Browse Products</button>
            </div>
        `;
        lucide.createIcons();
        document.getElementById('cartSubtotalText').textContent = '₹ 0.00';
        return;
    }

    CART.forEach(item => {
        const card = document.createElement('div');
        card.className = 'cart-item-card';
        card.innerHTML = `
            <img src="${item.thumbnail}" alt="${item.title}">
            <div class="cart-item-card-details">
                <h5>${item.title}</h5>
                <div style="display:flex; justify-content:between; width:100%; align-items:center;">
                    <span>₹ ${item.salePrice}</span>
                    <button class="btn-remove-cart" onclick="removeFromCart('${item.id}')"><i data-lucide="trash-2" style="width:16px;"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    const sub = getCartSubtotal();
    let couponInfo = APPLIED_COUPON ? `<span style="font-size:0.75rem; color:var(--accent-green); display:block;">(Applied Coupon: ${APPLIED_COUPON.code} -${APPLIED_COUPON.discountPercent}%)</span>` : '';
    document.getElementById('cartSubtotalText').innerHTML = `₹ ${sub.toLocaleString('en-IN')} ${couponInfo}`;
    lucide.createIcons();
}

function handleCouponApply() {
    const input = document.getElementById('couponCodeInput');
    const val = input.value.trim().toUpperCase();

    if (!val) return;

    const cop = COUPONS.find(c => c.code === val);
    if (cop) {
        APPLIED_COUPON = cop;
        renderCartItems();
        showToast("Coupon Applied", `Coupon ${cop.code} applied successfully!`, "success");
    } else {
        showToast("Invalid Coupon", "The entered promo code is expired or invalid.", "error");
    }
}

// --- 7. SIMULATED CHECKOUT GATEWAY INTERACTION ---
function openCheckoutGatewayModal() {
    if (CART.length === 0) {
        showToast("Checkout Empty", "Your cart is empty. Please add products to checkout.", "error");
        return;
    }

    closeAllDrawers();
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.add('open');
        document.getElementById('checkoutTotalText').textContent = `₹ ${getCartSubtotal().toLocaleString('en-IN')}`;
    }

    // Dynamic prepopulation of values based on ACTIVE_USER status
    if (ACTIVE_USER) {
        const nameParts = ACTIVE_USER.name.split(' ');
        document.getElementById('checkoutFirstName').value = nameParts[0] || '';
        document.getElementById('checkoutLastName').value = nameParts.slice(1).join(' ') || '';
        document.getElementById('checkoutEmail').value = ACTIVE_USER.email || '';
        document.getElementById('checkoutPhone').value = ACTIVE_USER.phone || '';
        
        // Hide password container
        const pwdGroup = document.getElementById('checkoutPasswordGroup');
        if (pwdGroup) pwdGroup.style.display = 'none';
        const pwdInput = document.getElementById('checkoutPassword');
        if (pwdInput) pwdInput.removeAttribute('required');
    } else {
        document.getElementById('checkoutFirstName').value = '';
        document.getElementById('checkoutLastName').value = '';
        document.getElementById('checkoutEmail').value = '';
        document.getElementById('checkoutPhone').value = '';
        document.getElementById('checkoutPassword').value = '';
        
        // Show password container
        const pwdGroup = document.getElementById('checkoutPasswordGroup');
        if (pwdGroup) pwdGroup.style.display = 'flex';
        const pwdInput = document.getElementById('checkoutPassword');
        if (pwdInput) pwdInput.setAttribute('required', 'true');
    }
}

function closeCheckoutGatewayModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.remove('open');
}

function handleRazorpayCheckout(e) {
    if (e) e.preventDefault();

    const firstName = document.getElementById('checkoutFirstName').value.trim();
    const lastName = document.getElementById('checkoutLastName').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    const passwordInput = document.getElementById('checkoutPassword');
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!firstName || !lastName || !email || !phone) {
        showToast("Form Error", "Please fill in all the required billing fields.", "error");
        return;
    }

    // Perform Signup-on-checkout if user is not currently logged in
    let currentUser = ACTIVE_USER;
    if (!currentUser) {
        if (!password) {
            showToast("Password Required", "Please create a password to set up your dynamic dashboard locker.", "error");
            return;
        }

        // Check if email already registered
        const existingUser = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            currentUser = existingUser;
            ACTIVE_USER = currentUser;
            saveDb('active_user', ACTIVE_USER);
            showToast("Welcome Back", `Existing email detected! Logged you in automatically.`, "info");
        } else {
            currentUser = {
                name: firstName + ' ' + lastName,
                email: email,
                password: password,
                phone: phone,
                role: 'user'
            };
            USERS.push(currentUser);
            saveDb('users', USERS);
            
            ACTIVE_USER = currentUser;
            saveDb('active_user', ACTIVE_USER);
            showToast("Account Created", `Success! Your dashboard locker account has been initialized.`, "success");
        }
    } else {
        // If logged in, update user properties
        currentUser.phone = phone;
        saveDb('users', USERS);
        ACTIVE_USER = currentUser;
        saveDb('active_user', ACTIVE_USER);
    }

    // Simulate Razorpay Gateway Interaction
    showToast("Connecting Razorpay", "Initializing Razorpay Secure API checkout overlay...", "info");
    
    // Create a beautiful, temporary payment processing screen overlay
    const processingOverlay = document.createElement('div');
    processingOverlay.style.position = 'fixed';
    processingOverlay.style.top = '0';
    processingOverlay.style.left = '0';
    processingOverlay.style.width = '100vw';
    processingOverlay.style.height = '100vh';
    processingOverlay.style.background = 'rgba(10, 11, 15, 0.95)';
    processingOverlay.style.display = 'flex';
    processingOverlay.style.flexDirection = 'column';
    processingOverlay.style.alignItems = 'center';
    processingOverlay.style.justifyContent = 'center';
    processingOverlay.style.zIndex = '999999';
    processingOverlay.style.color = '#fff';
    processingOverlay.style.fontFamily = 'system-ui, sans-serif';
    processingOverlay.style.textAlign = 'center';
    processingOverlay.innerHTML = `
        <div style="background: var(--bg-darker); border: 1px solid var(--border-color); padding: 32px; border-radius: 12px; box-shadow: var(--shadow-glow); max-width: 400px; width: 90%;">
            <div style="font-size:2.2rem; font-weight:800; color:#4299e1; margin-bottom:12px; letter-spacing:0.5px;">Razorpay</div>
            <div style="border: 3px solid transparent; border-top-color: #4299e1; border-radius: 50%; width: 40px; height: 40px; margin: 20px auto; animation: spin 1s linear infinite;"></div>
            <h4 style="font-size: 1.1rem; margin-bottom: 8px; font-weight: 700;">Processing Razorpay Transaction</h4>
            <p style="font-size: 0.8rem; color: var(--text-dim); line-height: 1.5; margin-bottom: 12px;">Connecting to mobile banking server... Please do not hit back button or close this tab.</p>
            <div style="font-size: 0.8rem; color: #4299e1; font-weight: 700; background: rgba(66,153,225,0.1); padding: 6px 12px; border-radius: 4px; display: inline-block;">Secure 256-bit SSL Gateway</div>
        </div>
        <style>
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(processingOverlay);

    setTimeout(() => {
        // Complete the order
        const orderId = 'DV-' + Math.floor(100000 + Math.random() * 900000);
        const total = getCartSubtotal();
        
        const newOrder = {
            orderId: orderId,
            userEmail: currentUser.email,
            products: CART.map(item => ({ id: item.id, title: item.title, downloadUrl: item.downloadUrl })),
            totalPaid: total,
            gateway: 'Razorpay API',
            date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
            status: 'Paid'
        };

        ORDERS.push(newOrder);
        saveDb('orders', ORDERS);

        // Send confirmation simulation to support logs
        console.log(`[EMAIL DISPATCH] Purchased files successfully delivered to ${currentUser.email} for order ${orderId}.`);

        // Flush active checkout states
        CART = [];
        saveDb('cart', CART);
        APPLIED_COUPON = null;
        syncNavActions();
        
        // Remove simulated overlay and close checkout modal
        document.body.removeChild(processingOverlay);
        closeCheckoutGatewayModal();

        // Redirect and display success notification
        showToast("Razorpay Payment Success", `Thank you, ${firstName}! Dynamic email sent to ${currentUser.email}. Files unlocked in your locker.`, "success");
        
        routeTo('user-dashboard');
    }, 2200);
}

// --- 8. SUB-RENDERING LAYOUT PAGES ENGINE ---

// Home dynamic renderer
function renderHomeView() {
    // Announcement text
    const annText = document.getElementById('announcementText');
    if (annText) annText.textContent = CMS_CONFIG.announcementText;

    // Hero details
    const hTitle = document.getElementById('homeHeroTitle');
    const hSub = document.getElementById('homeHeroSubtitle');
    const hCta = document.getElementById('homeHeroCtaText');

    if (hTitle) hTitle.innerHTML = CMS_CONFIG.heroHeadline;
    if (hSub) hSub.textContent = CMS_CONFIG.heroSub;
    if (hCta) hCta.textContent = CMS_CONFIG.heroCtaLabel;

    // Banner scarcity cards details
    const oTitle = document.getElementById('homeOfferTitle');
    const oSub = document.getElementById('homeOfferSubtitle');
    if (oTitle) oTitle.textContent = CMS_CONFIG.offerTitle;
    if (oSub) oSub.textContent = CMS_CONFIG.offerSub;

    // Categories
    const homeCatGrid = document.getElementById('homeCategoriesGrid');
    if (homeCatGrid) {
        homeCatGrid.innerHTML = '';
        CATEGORIES.slice(0, 5).forEach(cat => {
            const card = document.createElement('div');
            card.className = 'category-pill-card';
            card.onclick = () => {
                routeTo('shop');
                // Select category filter in shop view
                setTimeout(() => {
                    const shopFilter = document.getElementById('shopCategoriesFilter');
                    if (shopFilter) {
                        const items = shopFilter.querySelectorAll('.filter-cat-item');
                        items.forEach(it => {
                            if (it.textContent.includes(cat.name)) {
                                it.click();
                            }
                        });
                    }
                }, 100);
            };
            card.innerHTML = `
                <div class="category-icon-box">${cat.icon}</div>
                <h4>${cat.name}</h4>
            `;
            homeCatGrid.appendChild(card);
        });
    }

    // Featured premium cards grid with auto-rotating slider
    startHeroSlider();

    const homeProductsGrid = document.getElementById('homeProductsGrid');
    if (homeProductsGrid) {
        homeProductsGrid.innerHTML = '';
        homeProductsGrid.style.display = 'flex';
        homeProductsGrid.style.flexDirection = 'column';
        homeProductsGrid.style.gap = '40px';
        homeProductsGrid.style.width = '100%';

        // For each enabled category, draw a sub-section
        CATEGORIES.forEach(cat => {
            if (cat.status !== 'enabled') return;
            
            // Get products belonging to this category and marked as premium asset
            const catProds = PRODUCTS.filter(p => p.category === cat.name && p.status !== 'disabled' && p.premiumAsset !== false);
            if (catProds.length === 0) return;
            
            const catSection = document.createElement('div');
            catSection.className = 'category-group-section';
            catSection.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:20px; text-align:left;">
                    <span style="font-size:1.4rem; background:var(--grad-glow); padding:6px 12px; border-radius:8px; border:1px solid rgba(59,130,246,0.15); display:inline-flex; align-items:center; justify-content:center;">${cat.icon}</span>
                    <h3 style="font-size:1.4rem; font-weight:800; color:var(--text-white); margin:0;">${cat.name}</h3>
                </div>
                <div class="products-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:24px;">
                    <!-- Products inside category -->
                </div>
            `;
            
            const grid = catSection.querySelector('.products-grid');
            catProds.forEach(prod => {
                const card = document.createElement('div');
                card.className = 'product-card';
                
                // Buy button action
                const clickBuy = prod.customLandingUrl
                    ? "window.location.href='" + prod.customLandingUrl + "'"
                    : `addToCart('${prod.id}', true)`;
                
                card.innerHTML = `
                    <div class="prod-thumbnail-wrapper" onclick="loadProductDetails('${prod.id}')">
                        <span class="badge-sale">SALE</span>
                        <span class="badge-category">${prod.category}</span>
                        <img class="prod-thumbnail" src="${prod.thumbnail}" alt="${prod.title}">
                    </div>
                     <div class="prod-info-block">
                         <div class="prod-rating">⭐⭐⭐⭐⭐ <span>(5.0)</span></div>
                         <h3 onclick="loadProductDetails(&apos;${prod.id}&apos;)">${prod.title}</h3>
                         <p class="prod-desc-short">${prod.description}</p>
                         <div class="prod-footer-row">
                             <div class="prod-price-box">
                                 <span class="price-strike-sm">₹ ${prod.originalPrice.toLocaleString('en-IN')}</span>
                                 <span class="price-active-lg">₹ ${prod.salePrice}</span>
                             </div>
                             <button class="btn-card-buy" onclick="${clickBuy}" title="Buy Now"><i data-lucide="shopping-cart"></i></button>
                         </div>
                     </div>
                `;
                grid.appendChild(card);
            });
            homeProductsGrid.appendChild(catSection);
        });
        lucide.createIcons();
    }

    // Features and benefits list
    const homeFeaturesGrid = document.getElementById('homeFeaturesGrid');
    if (homeFeaturesGrid) {
        homeFeaturesGrid.innerHTML = '';
        FEATURE_BENEFITS.forEach(feat => {
            const card = document.createElement('div');
            card.className = 'feature-benefit-card';
            card.innerHTML = `
                <div class="feature-icon-wrapper">${feat.icon}</div>
                <div class="feature-text-wrapper">
                    <h3>${feat.title}</h3>
                    <p>${feat.desc}</p>
                </div>
            `;
            homeFeaturesGrid.appendChild(card);
        });
    }

    // Testimonials
    const homeTestimonialsGrid = document.getElementById('homeTestimonialsGrid');
    if (homeTestimonialsGrid) {
        homeTestimonialsGrid.innerHTML = '';
        CUSTOMER_REVIEWS.forEach(rev => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';
            card.innerHTML = `
                <div class="quote-icon">�</div>
                <div class="review-stars">⭐⭐⭐⭐⭐</div>
                <p>"${rev.text}"</p>
                <div class="reviewer-meta-box">
                    <div class="reviewer-avatar-box">${rev.name.charAt(0)}</div>
                    <div class="reviewer-details">
                        <h5>${rev.name}</h5>
                        <span>${rev.role}</span>
                    </div>
                </div>
            `;
            homeTestimonialsGrid.appendChild(card);
        });
    }

    // Dynamic countdown trigger
    startScarcityTimer();
}

// Scarcity countdown ticking loop
let timerCountdownInterval = null;
function startScarcityTimer() {
    if (timerCountdownInterval) clearInterval(timerCountdownInterval);

    const timerKey = 'digivault_scarcity_timer_deadline';
    let deadline = localStorage.getItem(timerKey);
    const now = new Date().getTime();

    // Set new deadline if not exists or if expired
    if (!deadline || now > parseInt(deadline)) {
        const totalMs = CMS_CONFIG.countdownHours * 3600 * 1000;
        const targetDeadline = now + totalMs;
        localStorage.setItem(timerKey, targetDeadline.toString());
        deadline = targetDeadline.toString();
    }

    const daysBox = document.getElementById('daysBox');
    const hoursBox = document.getElementById('hoursBox');
    const minsBox = document.getElementById('minsBox');
    const secsBox = document.getElementById('secsBox');

    const updateTimerUI = () => {
        const currentTime = new Date().getTime();
        let remainingSeconds = Math.floor((parseInt(deadline) - currentTime) / 1000);

        if (remainingSeconds <= 0) {
            // Loop timer back to countdownHours quietly to maintain urgency
            const nextDeadline = new Date().getTime() + (CMS_CONFIG.countdownHours * 3600 * 1000);
            localStorage.setItem(timerKey, nextDeadline.toString());
            deadline = nextDeadline.toString();
            remainingSeconds = CMS_CONFIG.countdownHours * 3600;
        }

        let d = Math.floor(remainingSeconds / 86400);
        let h = Math.floor((remainingSeconds % 86400) / 3600);
        let m = Math.floor((remainingSeconds % 3600) / 60);
        let s = remainingSeconds % 60;

        const pad = (n) => String(n).padStart(2, '0');

        if (daysBox) daysBox.textContent = pad(d);
        if (hoursBox) hoursBox.textContent = pad(h);
        if (minsBox) minsBox.textContent = pad(m);
        if (secsBox) secsBox.textContent = pad(s);
    };

    updateTimerUI();
    timerCountdownInterval = setInterval(updateTimerUI, 1000);
}

// Shop Dynamic Catalog filters and catalog listings
let activeShopCategory = 'all';
let activeShopRating = 0;
let shopSearchQuery = '';
let activeSort = 'default';

function renderShopView() {
    // Categories filter list
    const shopCatFilter = document.getElementById('shopCategoriesFilter');
    if (shopCatFilter) {
        shopCatFilter.innerHTML = '';
        const allItem = document.createElement('span');
        allItem.className = `filter-cat-item ${activeShopCategory === 'all' ? 'active-cat' : ''}`;
        allItem.textContent = "All Vaults";
        allItem.onclick = () => selectShopCategory('all', allItem);
        shopCatFilter.appendChild(allItem);

        CATEGORIES.forEach(cat => {
            if (cat.status !== 'enabled') return;
            const item = document.createElement('span');
            item.className = `filter-cat-item ${activeShopCategory === cat.name ? 'active-cat' : ''}`;
            item.innerHTML = `${cat.icon} <span>${cat.name}</span>`;
            item.onclick = () => selectShopCategory(cat.name, item);
            shopCatFilter.appendChild(item);
        });
    }

    renderShopCatalog();
}

function selectShopCategory(catName, element) {
    document.querySelectorAll('#shopCategoriesFilter .filter-cat-item').forEach(it => it.classList.remove('active-cat'));
    element.classList.add('active-cat');
    activeShopCategory = catName;
    renderShopCatalog();
}

function filterByRating(rating) {
    activeShopRating = rating;
    
    // Toggle active classes on inline sibling items
    event.target.parentNode.querySelectorAll('.filter-cat-item').forEach(it => it.classList.remove('active-cat'));
    event.target.classList.add('active-cat');
    
    renderShopCatalog();
}

function handleSearch(e) {
    shopSearchQuery = e.target.value.toLowerCase().trim();
    renderShopCatalog();
}

function handleSort(e) {
    activeSort = e.target.value;
    renderShopCatalog();
}

function renderShopCatalog() {
    const grid = document.getElementById('shopProductsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    // Render skeleton loading blocks
    for (let i = 0; i < 3; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        skeleton.innerHTML = `
            <div class="skeleton-thumb skeleton-animate"></div>
            <div class="skeleton-line skeleton-animate"></div>
            <div class="skeleton-line half skeleton-animate"></div>
            <div class="skeleton-line third skeleton-animate"></div>
        `;
        grid.appendChild(skeleton);
    }

    // Mock quick database fetch delay
    setTimeout(() => {
        grid.innerHTML = '';

        // Filter catalog items
        let filtered = PRODUCTS.filter(prod => {
            const matchesCat = activeShopCategory === 'all' || prod.category === activeShopCategory;
            const matchesRating = activeShopRating === 0 || prod.rating >= activeShopRating;
            const matchesSearch = !shopSearchQuery || 
                prod.title.toLowerCase().includes(shopSearchQuery) || 
                prod.description.toLowerCase().includes(shopSearchQuery) ||
                prod.tags.toLowerCase().includes(shopSearchQuery);
            return matchesCat && matchesRating && matchesSearch;
        });

        // Apply sorting rules
        if (activeSort === 'price-low') {
            filtered.sort((a, b) => a.salePrice - b.salePrice);
        } else if (activeSort === 'price-high') {
            filtered.sort((a, b) => b.salePrice - a.salePrice);
        } else if (activeSort === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; display:flex; flex-direction:column; align-items:center; gap:16px; padding:60px 0; text-align:center; color:var(--text-dim);">
                    <i data-lucide="package-search" style="width:48px; height:48px;"></i>
                    <p style="font-size:1.05rem; font-weight:600;">No premium products found matching filters.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        filtered.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="prod-thumbnail-wrapper" onclick="loadProductDetails('${prod.id}')">
                    <span class="badge-sale">SALE</span>
                    <span class="badge-category">${prod.category}</span>
                    <img class="prod-thumbnail" src="${prod.thumbnail}" alt="${prod.title}">
                </div>
                <div class="prod-info-block">
                    <div class="prod-rating">⭐⭐⭐⭐⭐ <span>(5.0)</span></div>
                    <h3 onclick="loadProductDetails('${prod.id}')">${prod.title}</h3>
                    <p class="prod-desc-short">${prod.description}</p>
                    <div class="prod-footer-row">
                        <div class="prod-price-box">
                            <span class="price-strike-sm">₹ ${prod.originalPrice.toLocaleString('en-IN')}</span>
                            <span class="price-active-lg">₹ ${prod.salePrice}</span>
                        </div>
                        <button class="btn-card-buy" onclick="addToCart('${prod.id}', true)" title="Buy Now"><i data-lucide="shopping-cart"></i></button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
        lucide.createIcons();
    }, 450);
}

// Product Details dynamic loader page
function loadProductDirectly(id) {
    const prod = PRODUCTS.find(p => String(p.id) === String(id));
    if (prod && prod.customLandingUrl) {
        window.location.href = prod.customLandingUrl;
    } else {
        routeTo('detail');
        loadProductDetails(id);
    }
}

function loadProductDetails(productId) {
    const prod = PRODUCTS.find(p => String(p.id) === String(productId));
    if (prod && prod.customLandingUrl) {
        window.location.href = prod.customLandingUrl;
        return;
    }
    routeTo('detail');
    const container = document.getElementById('productDetailsContainer');
    if (!container) return;

    container.innerHTML = `
        <div style="grid-column: 1 / -1; display:flex; justify-content:center; padding: 100px 0;">
            <div style="width:40px; height:40px; border:2px solid var(--accent-purple); border-top-color:transparent; border-radius:50%; animation:spin 1s infinite linear;"></div>
        </div>
    `;

    setTimeout(() => {
        const prod = PRODUCTS.find(p => String(p.id) === String(productId));
        if (!prod) {
            container.innerHTML = `<p style="grid-column:1/-1; text-align:center;">Product not found.</p>`;
            return;
        }

        let reviewListHtml = '';
        if (prod.reviews.length === 0) {
            reviewListHtml = `<p style="color:var(--text-dim); font-style:italic;">No customer reviews yet. Be the first to leave a feedback review!</p>`;
        } else {
            prod.reviews.forEach(r => {
                reviewListHtml += `
                    <div style="background:rgba(255,255,255,0.01); border:1px solid var(--border-color); padding:16px; border-radius:8px; margin-bottom:12px;">
                        <div style="color:#eab308; margin-bottom:6px;">⭐⭐⭐⭐⭐</div>
                        <p style="font-size:0.92rem; font-style:italic; margin-bottom:8px;">"${r.text}"</p>
                        <h6 style="font-size:0.85rem; font-weight:700;">- ${r.name}</h6>
                    </div>
                `;
            });
        }

        // Pull 3 related products
        let relatedHtml = '';
        const related = PRODUCTS.filter(p => p.category === prod.category && String(p.id) !== String(prod.id)).slice(0, 3);
        if (related.length > 0) {
            relatedHtml = `
                <div style="grid-column: 1 / -1; margin-top: 60px;">
                    <h3 style="font-size:1.4rem; font-weight:800; margin-bottom:24px;">Related Products</h3>
                    <div class="products-grid">
            `;
            related.forEach(rp => {
                relatedHtml += `
                    <div class="product-card">
                        <div class="prod-thumbnail-wrapper" onclick="loadProductDetails('${rp.id}')">
                            <span class="badge-sale">SALE</span>
                            <span class="badge-category">${rp.category}</span>
                            <img class="prod-thumbnail" src="${rp.thumbnail}" alt="${rp.title}">
                        </div>
                        <div class="prod-info-block">
                            <h3 onclick="loadProductDetails('${rp.id}')">${rp.title}</h3>
                            <div class="prod-footer-row">
                                <span class="price-active-lg">₹ ${rp.salePrice}</span>
                                <button class="btn-card-buy" onclick="addToCart('${rp.id}', true)"><i data-lucide="shopping-cart"></i></button>
                            </div>
                        </div>
                    </div>
                `;
            });
            relatedHtml += `</div></div>`;
        }

        container.innerHTML = `
            <!-- Left Layout Gallery + details -->
            <div class="detail-main-panel">
                <div class="gallery-visual-wrapper">
                    <img src="${prod.thumbnail}" alt="${prod.title}">
                </div>
                <div class="detail-title-block">
                    <h1>${prod.title}</h1>
                    <div class="detail-meta-strip">
                        <span><i data-lucide="folder" style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;"></i> Category: <strong>${prod.category}</strong></span>
                        <span><i data-lucide="star" style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;"></i> Ratings: <strong>${prod.rating}.0 / 5.0</strong></span>
                        <span><i data-lucide="truck" style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;"></i> Delivery: <strong>Instant Locker Access</strong></span>
                    </div>
                </div>
                
                <div class="detail-text-block">
                    <h3>Product Overview</h3>
                    <p>${prod.description}</p>
                </div>

                <div class="detail-text-block" style="border-top: 1px solid var(--border-color); padding-top: 32px;">
                    <h3 style="display:flex; justify-content:space-between;"><span>Customer Reviews</span> <button class="btn-action-sm edit" onclick="promptMockReview('${prod.id}')">+ Add Review</button></h3>
                    <div style="margin-top:20px;">
                        ${reviewListHtml}
                    </div>
                </div>
            </div>

            <!-- Right Sidebar checkout panel sticky -->
            <div class="detail-purchase-panel">
                <div class="detail-pricing">
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-size:0.85rem; color:var(--text-dim); text-decoration:line-through;">INR ${prod.originalPrice.toLocaleString('en-IN')}/-</span>
                        <span style="font-size:2rem; font-weight:900; color:var(--text-white);">₹ ${prod.salePrice}/-</span>
                    </div>
                    <span style="background:var(--grad-glow); border:1px solid rgba(139,92,246,0.3); color:#a78bfa; padding:4px 10px; border-radius:4px; font-size:0.75rem; font-weight:800;">70% OFF</span>
                </div>

                <button class="btn-buy-primary" onclick="addToCart('${prod.id}', false); openCheckoutGatewayModal();">Buy Now</button>
                <button class="btn-add-cart-outline" onclick="addToCart('${prod.id}', true)">Add to Cart</button>

                <div class="locker-delivery-info">
                    <span>⚡ <strong>Lifetime Access</strong> with free updates folder</span>
                    <span>🛡️ <strong>Anti-sharing protected</strong> secure downloads locker</span>
                    <span>💻 Compatible with Desktop, Mobile, & Kindle</span>
                    <span>💳 One-time payment. Zero subscription fees.</span>
                </div>
            </div>

            <!-- Related rows -->
            ${relatedHtml}
        `;
        lucide.createIcons();
    }, 400);
}

function promptMockReview(productId) {
    const text = prompt("Enter your valuable feedback review statement:");
    if (!text) return;
    
    const prod = PRODUCTS.find(p => String(p.id) === String(productId));
    if (prod) {
        prod.reviews.push({
            name: ACTIVE_USER ? ACTIVE_USER.name : "Anonymous Buyer",
            text: text,
            rating: 5
        });
        saveDb('products', PRODUCTS);
        loadProductDetails(productId);
        showToast("Review Posted", "Thank you for sharing your feedback reviews!", "success");
    }
}

// User dynamic dashboard tab rendering
function renderUserDashboard() {
    if (!ACTIVE_USER) return;

    // Fill profile settings inputs
    document.getElementById('settingsName').value = ACTIVE_USER.name;
    document.getElementById('settingsEmail').value = ACTIVE_USER.email;

    // Load dynamic purchased downloads list
    const downloadsContainer = document.getElementById('dashDownloadsList');
    if (downloadsContainer) {
        downloadsContainer.innerHTML = '';
        
        // Grab all completed orders of active user
        const userOrders = ORDERS.filter(o => o.userEmail === ACTIVE_USER.email && o.status === 'Paid');
        
        let purchasedProducts = [];
        userOrders.forEach(o => {
            o.products.forEach(p => {
                // Eliminate duplicates in display if bought twice
                if (!purchasedProducts.some(item => item.id === p.id)) {
                    purchasedProducts.push(p);
                }
            });
        });

        if (purchasedProducts.length === 0) {
            downloadsContainer.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; gap:16px; padding:48px 0; text-align:center; color:var(--text-dim);">
                    <i data-lucide="lock" style="width:40px; height:40px;"></i>
                    <p style="font-size:0.95rem; font-weight:600;">Your secure locker is empty. Complete a checkout purchase to unlock assets.</p>
                </div>
            `;
            lucide.createIcons();
        } else {
            purchasedProducts.forEach(item => {
                const card = document.createElement('div');
                card.className = 'locker-item-card';
                card.innerHTML = `
                    <div class="locker-item-info">
                        <h4>${item.title}</h4>
                        <span>🔒 Secure Link: Verified Access � Lifetime Updated</span>
                    </div>
                    <button class="btn-download-now" onclick="triggerMockDownload('${item.title}', '${item.downloadUrl}')">
                        <i data-lucide="download"></i>
                        <span>Download ZIP</span>
                    </button>
                `;
                downloadsContainer.appendChild(card);
            });
            lucide.createIcons();
        }
    }

    // Load purchase history voucher rows
    const historyBody = document.getElementById('dashHistoryTableBody');
    if (historyBody) {
        historyBody.innerHTML = '';
        const userOrders = ORDERS.filter(o => o.userEmail === ACTIVE_USER.email);

        if (userOrders.length === 0) {
            historyBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-dim);">No transactions logged yet.</td></tr>`;
        } else {
            userOrders.forEach(o => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>#${o.orderId}</strong></td>
                    <td>${o.date}</td>
                    <td>₹ ${o.totalPaid.toLocaleString('en-IN')}</td>
                    <td>${o.gateway}</td>
                    <td><span class="badge-status paid">${o.status}</span></td>
                `;
                historyBody.appendChild(tr);
            });
        }
    }
}

function triggerMockDownload(title, url) {
    showToast("Initializing Secure Download", `Verifying tokens and streaming "${title}" secure package...`, "info");
    
    setTimeout(() => {
        // Log secure download metrics to admin metrics
        let downloadLogs = getDb('download_counter', 0);
        downloadLogs++;
        saveDb('download_counter', downloadLogs);
        
        // Open download link in tab
        window.open(url, '_blank');
        showToast("Download Delivered", `ZIP file download successful for "${title}"!`, "success");
    }, 1500);
}

function switchDashTab(btn, tabId) {
    document.querySelectorAll('.dash-sidebar-nav .dash-nav-item').forEach(b => b.classList.remove('active-dash'));
    document.querySelectorAll('.dash-tab-content').forEach(t => t.classList.remove('active'));

    btn.classList.add('active-dash');
    document.getElementById(tabId).classList.add('active');
}

// Settings changes profile submit
function handleSettingsUpdate(e) {
    e.preventDefault();
    if (!ACTIVE_USER) return;

    const nameInput = document.getElementById('settingsName').value.trim();
    const newPass = document.getElementById('settingsNewPassword').value.trim();

    if (!nameInput) return;

    ACTIVE_USER.name = nameInput;
    if (newPass) {
        ACTIVE_USER.password = newPass;
    }

    // Save back to users list
    USERS = USERS.map(u => u.email === ACTIVE_USER.email ? { ...u, name: nameInput, password: newPass || u.password } : u);
    saveDb('users', USERS);
    saveDb('active_user', ACTIVE_USER);

    showToast("Profile Updated", "Your account settings have been updated successfully!", "success");
    document.getElementById('settingsNewPassword').value = '';
}

// --- 9. ADMINISTRATIVE PORTAL CONTROL PANEL ENGINE ---
async function renderAdminDashboard() {
    try {
        const [ordersRes, usersRes, analyticsRes] = await Promise.all([
            apiRequest('/api/orders'),
            apiRequest('/api/users'),
            apiRequest('/api/analytics')
        ]);
        
        if (ordersRes && ordersRes.success) {
            ORDERS = ordersRes.orders;
            saveDb('orders', ORDERS);
        }
        if (usersRes && usersRes.success) {
            USERS = usersRes.users;
            saveDb('users', USERS);
        }
        
        const revTotal = ORDERS.reduce((acc, o) => o.status === 'Paid' ? acc + o.totalPaid : acc, 0);
        const downloadsTotal = getDb('download_counter', 42);

        document.getElementById('mSales').textContent = `₹ ${revTotal.toLocaleString('en-IN')}`;
        document.getElementById('mOrders').textContent = ORDERS.length;
        document.getElementById('mUsers').textContent = USERS.length;
        document.getElementById('mDownloads').textContent = downloadsTotal;

        const recentOrdersBody = document.getElementById('adminRecentOrdersBody');
        if (recentOrdersBody) {
            recentOrdersBody.innerHTML = '';
            const recent = ORDERS.slice().reverse().slice(0, 5);
            if (recent.length === 0) {
                recentOrdersBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-dim);">No transactions captured yet.</td></tr>`;
            } else {
                recent.forEach(o => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>#${o.orderId}</strong></td>
                        <td>${o.userEmail}</td>
                        <td>${o.products.map(p => p.title).join(', ').slice(0, 40)}...</td>
                        <td>₹ ${o.totalPaid}</td>
                        <td>${new Date(o.createdAt).toLocaleDateString()}</td>
                        <td><span class="badge-status paid">${o.status}</span></td>
                    `;
                    recentOrdersBody.appendChild(tr);
                });
            }
        }

        if (analyticsRes && analyticsRes.success && analyticsRes.analytics) {
            const ana = analyticsRes.analytics;
            document.getElementById('aWeeklySales').textContent = `₹ ${ana.weeklySales.toLocaleString('en-IN')}`;
            document.getElementById('aMonthlySales').textContent = `₹ ${ana.monthlySales.toLocaleString('en-IN')}`;
            document.getElementById('aTotalSales').textContent = `₹ ${ana.totalRevenue.toLocaleString('en-IN')}`;
            
            const anaBody = document.getElementById('adminProductAnalyticsBody');
            if (anaBody) {
                anaBody.innerHTML = '';
                if (ana.productWise.length === 0) {
                    anaBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-dim);">No product analytics data available.</td></tr>`;
                } else {
                    ana.productWise.forEach(p => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td><strong>${p.title}</strong></td>
                            <td>${p.count}</td>
                            <td>₹ ${Math.round(p.revenue).toLocaleString('en-IN')}</td>
                        `;
                        anaBody.appendChild(tr);
                    });
                }
            }
        }
    } catch (err) {
        console.warn('API metrics loading failed, using offline fallback:', err);
        const revTotal = ORDERS.reduce((acc, o) => o.status === 'Paid' ? acc + o.totalPaid : acc, 0);
        const downloadsTotal = getDb('download_counter', 42);

        document.getElementById('mSales').textContent = `₹ ${revTotal.toLocaleString('en-IN')}`;
        document.getElementById('mOrders').textContent = ORDERS.length;
        document.getElementById('mUsers').textContent = USERS.length;
        document.getElementById('mDownloads').textContent = downloadsTotal;

        const recentOrdersBody = document.getElementById('adminRecentOrdersBody');
        if (recentOrdersBody) {
            recentOrdersBody.innerHTML = '';
            const recent = ORDERS.slice().reverse().slice(0, 5);
            if (recent.length === 0) {
                recentOrdersBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-dim);">No transactions captured yet.</td></tr>`;
            } else {
                recent.forEach(o => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>#${o.orderId}</strong></td>
                        <td>${o.userEmail}</td>
                        <td>${o.products.map(p => p.title).join(', ').slice(0, 40)}...</td>
                        <td>₹ ${o.totalPaid}</td>
                        <td>${o.date}</td>
                        <td><span class="badge-status paid">${o.status}</span></td>
                    `;
                    recentOrdersBody.appendChild(tr);
                });
            }
        }
    }

    // 3. Load Product list CRUD Inventory
    const productsTableBody = document.getElementById('adminProductsTableBody');
    if (productsTableBody) {
        productsTableBody.innerHTML = '';
        PRODUCTS.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${p.thumbnail}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;"></td>
                <td><strong>${p.title}</strong></td>
                <td>${p.category}</td>
                <td>₹ ${p.salePrice}</td>
                <td>₹ ${p.originalPrice}</td>
                <td><span class="badge-status paid">Active</span></td>
                <td>
                    <button class="btn-action-sm edit" onclick="editProduct('${p.id}')">Edit</button>
                    <button class="btn-action-sm delete" onclick="deleteProduct('${p.id}')">Delete</button>
                </td>
            `;
            productsTableBody.appendChild(tr);
        });
    }

    // 4. Fill categories dropdown list inside adding modal form
    const catSelect = document.getElementById('prodFormCategoryInput');
    if (catSelect) {
        catSelect.innerHTML = '';
        CATEGORIES.forEach(c => {
            if (c.status !== 'enabled') return;
            const opt = document.createElement('option');
            opt.value = c.name;
            opt.textContent = c.name;
            catSelect.appendChild(opt);
        });
    }

    // 5. Load sales orders table list tab
    const ordersTableBody = document.getElementById('adminOrdersTableBody');
    if (ordersTableBody) {
        ordersTableBody.innerHTML = '';
        if (ORDERS.length === 0) {
            ordersTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-dim);">No transactions logged yet.</td></tr>`;
        } else {
            ORDERS.forEach(o => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>#${o.orderId}</strong></td>
                    <td>${o.userEmail}</td>
                    <td>${o.products.map(p => p.title).join(', ').slice(0, 30)}...</td>
                    <td>₹ ${o.totalPaid}</td>
                    <td>${o.gateway}</td>
                    <td>${o.date}</td>
                    <td><span class="badge-status paid">${o.status}</span></td>
                `;
                ordersTableBody.appendChild(tr);
            });
        }
    }

    // 6. Load Category manage table
    const categoriesTableBody = document.getElementById('adminCategoriesTableBody');
    if (categoriesTableBody) {
        categoriesTableBody.innerHTML = '';
        CATEGORIES.forEach((c, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-size:1.4rem;">${c.icon}</td>
                <td><code>${c.slug}</code></td>
                <td><strong>${c.name}</strong></td>
                <td><span class="badge-status paid" style="${c.status !== 'enabled' ? 'background:rgba(239,68,68,0.1); color:var(--accent-red);' : ''}">${c.status}</span></td>
                <td>
                    <button class="btn-action-sm edit" onclick="toggleCategoryStatus(${idx})">${c.status === 'enabled' ? 'Disable' : 'Enable'}</button>
                </td>
            `;
            categoriesTableBody.appendChild(tr);
        });
    }

    // 7. Load User client accounts
    const usersTableBody = document.getElementById('adminUsersTableBody');
    if (usersTableBody) {
        usersTableBody.innerHTML = '';
        USERS.forEach(u => {
            // Count purchases of user
            const purchases = ORDERS.filter(o => o.userEmail === u.email && o.status === 'Paid').length;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td><code>${u.role}</code></td>
                <td>${purchases} Purchases</td>
            `;
            usersTableBody.appendChild(tr);
        });
    }
}

function switchAdminTab(btn, tabId) {
    document.querySelectorAll('.dash-sidebar-nav .dash-nav-item').forEach(b => b.classList.remove('active-dash'));
    document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));

    btn.classList.add('active-dash');
    document.getElementById(tabId).classList.add('active');
}

// Categories Adding action
function handleCategoryAddSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('newCatName').value.trim();
    const icon = document.getElementById('newCatIcon').value.trim();

    if (!name || !icon) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (CATEGORIES.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        showToast("Create Error", "Category already exists in filters list.", "error");
        return;
    }

    CATEGORIES.push({
        name: name,
        icon: icon,
        slug: slug,
        status: "enabled"
    });

    saveDb('categories', CATEGORIES);
    renderAdminDashboard();

    document.getElementById('newCatName').value = '';
    document.getElementById('newCatIcon').value = '';
    showToast("Category Created", `"${name}" added successfully to shop catalog filters.`, "success");
}

function toggleCategoryStatus(idx) {
    const current = CATEGORIES[idx].status;
    CATEGORIES[idx].status = current === 'enabled' ? 'disabled' : 'enabled';
    saveDb('categories', CATEGORIES);
    renderAdminDashboard();
    showToast("Category Toggled", "Catalog filter visibility updated successfully.", "info");
}

// Product Management Form Popups CRUD actions
function showProductModalForm() {
    document.getElementById('productFormTitle').textContent = "Add New Product";
    document.getElementById('prodFormId').value = '';
    document.getElementById('adminProductForm').reset();
    
    document.getElementById('productFormModal').classList.add('open');
}

function closeProductModalForm() {
    document.getElementById('productFormModal').classList.remove('open');
}

function editProduct(productId) {
    const prod = PRODUCTS.find(p => String(p.id) === String(productId));
    if (!prod) return;

    document.getElementById('productFormTitle').textContent = "Edit Product Details";
    document.getElementById('prodFormId').value = prod.id;
    
    document.getElementById('prodFormTitleInput').value = prod.title;
    document.getElementById('prodFormDescInput').value = prod.description;
    document.getElementById('prodFormShortDescInput').value = prod.shortDescription || '';
    document.getElementById('prodFormCustomLandingUrlInput').value = prod.customLandingUrl || '';
    document.getElementById('prodFormCategoryInput').value = prod.category;
    document.getElementById('prodFormRatingInput').value = prod.rating;
    document.getElementById('prodFormSalePriceInput').value = prod.salePrice;
    document.getElementById('prodFormOriginalPriceInput').value = prod.originalPrice;
    document.getElementById('prodFormThumbnailInput').value = prod.thumbnail;
    document.getElementById('prodFormZipUrlInput').value = prod.downloadUrl;
    document.getElementById('prodFormTagsInput').value = prod.tags;
    document.getElementById('prodFormFeaturedInput').checked = !!prod.featured;
    document.getElementById('prodFormPremiumAssetInput').checked = prod.premiumAsset !== false;

    document.getElementById('productFormModal').classList.add('open');
}

function handleProductFormSubmit(e) {
    e.preventDefault();

    const existingId = document.getElementById('prodFormId').value;
    const title = document.getElementById('prodFormTitleInput').value.trim();
    const desc = document.getElementById('prodFormDescInput').value.trim();
    const shortDesc = document.getElementById('prodFormShortDescInput').value.trim();
    const customLandingUrl = document.getElementById('prodFormCustomLandingUrlInput').value.trim();
    const cat = document.getElementById('prodFormCategoryInput').value;
    const rat = Number(document.getElementById('prodFormRatingInput').value);
    const sale = Number(document.getElementById('prodFormSalePriceInput').value);
    const orig = Number(document.getElementById('prodFormOriginalPriceInput').value);
    const thumb = document.getElementById('prodFormThumbnailInput').value.trim();
    const zip = document.getElementById('prodFormZipUrlInput').value.trim();
    const tags = document.getElementById('prodFormTagsInput').value.trim();
    const featured = document.getElementById('prodFormFeaturedInput') ? document.getElementById('prodFormFeaturedInput').checked : false;
    const premiumAsset = document.getElementById('prodFormPremiumAssetInput') ? document.getElementById('prodFormPremiumAssetInput').checked : false;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (existingId) {
        // EDIT mode - update locally
        PRODUCTS = PRODUCTS.map(p => String(p.id) === String(existingId) ? {
            ...p, title, description: desc, shortDescription: shortDesc, customLandingUrl, category: cat, rating: rat, salePrice: sale, originalPrice: orig, thumbnail: thumb, downloadUrl: zip, tags, featured, premiumAsset
        } : p);
        saveDb('products', PRODUCTS);
        showToast("Product Updated", '"' + title + '" details have been updated successfully!', "success");
        // Sync to API
        apiRequest('/api/products', {
            method: 'PUT',
            body: JSON.stringify({ id: existingId, title, description: desc, shortDescription: shortDesc, customLandingUrl, category: cat, rating: rat, salePrice: sale, originalPrice: orig, thumbnail: thumb, downloadUrl: zip, tags, status: 'enabled', featured, premiumAsset })
        }).then(res => {
            if (res && res.success && res.product) {
                // Update local ID with server ID
                PRODUCTS = PRODUCTS.map(p => String(p.id) === String(existingId) ? { ...p, id: res.product._id || p.id, _id: res.product._id } : p);
                saveDb('products', PRODUCTS);
            }
        });
    } else {
        // ADD mode - save locally with temp ID
        const tempId = 'temp_' + Date.now();
        const newProd = { id: tempId, title, slug, description: desc, shortDescription: shortDesc, customLandingUrl, category: cat, rating: rat, salePrice: sale, originalPrice: orig, thumbnail: thumb, downloadUrl: zip, tags, featured, premiumAsset, reviews: [] };
        PRODUCTS.push(newProd);
        saveDb('products', PRODUCTS);
        showToast("Product Added", '"' + title + '" added to inventory catalog!', "success");
        // Sync to API
        apiRequest('/api/products', {
            method: 'POST',
            body: JSON.stringify({ title, slug, description: desc, shortDescription: shortDesc, customLandingUrl, category: cat, rating: rat, salePrice: sale, originalPrice: orig, thumbnail: thumb, downloadUrl: zip, tags, featured, premiumAsset })
        }).then(res => {
            if (res && res.success && res.product) {
                // Replace temp ID with real MongoDB ID
                PRODUCTS = PRODUCTS.map(p => p.id === tempId ? { ...p, id: res.product._id, _id: res.product._id } : p);
                saveDb('products', PRODUCTS);
            }
        });
    }

    closeProductModalForm();
    renderAdminDashboard();
}

function deleteProduct(productId) {
    if (!confirm("Are you sure you want to permanently delete this product from database inventory?")) return;

    PRODUCTS = PRODUCTS.filter(p => String(p.id) !== String(productId));
    saveDb('products', PRODUCTS);
    renderAdminDashboard();
    showToast("Product Deleted", "Product removed successfully from vault catalog.", "info");
    // Sync to API
    apiRequest('/api/products?id=' + productId, { method: 'DELETE' });
}

// --- 10. AUTH OPERATIONS ENGINE (LOGIN, SIGNUP, LOGOUT) ---
function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();

    // Try API auth first
    apiRequest('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', email, password: pass })
    }).then(res => {
        if (res && res.success && res.user) {
            ACTIVE_USER = res.user;
            saveDb('active_user', ACTIVE_USER);
            // Extract token from response cookie or store user info
            if (res.token) setAuthToken(res.token);
            showToast("Login Success", 'Welcome back, ' + res.user.name + '!', "success");
            document.getElementById('loginForm').reset();
            if (res.user.role === 'admin') { routeTo('admin-dashboard'); } else { routeTo('user-dashboard'); }
            syncNavActions();
        } else {
            // Fallback to local auth
            const user = USERS.find(u => u.email === email && u.password === pass);
            if (user) {
                ACTIVE_USER = user;
                saveDb('active_user', ACTIVE_USER);
                showToast("Login Success", 'Welcome back, ' + user.name + '! (Offline Mode)', "success");
                document.getElementById('loginForm').reset();
                if (user.role === 'admin') { routeTo('admin-dashboard'); } else { routeTo('user-dashboard'); }
                syncNavActions();
            } else {
                showToast("Auth Failed", "Invalid email credentials or password entered. Please try again.", "error");
            }
        }
    }).catch(() => {
        // Offline fallback
        const user = USERS.find(u => u.email === email && u.password === pass);
        if (user) {
            ACTIVE_USER = user;
            saveDb('active_user', ACTIVE_USER);
            showToast("Login Success", 'Welcome back, ' + user.name + '! (Offline)', "success");
            document.getElementById('loginForm').reset();
            if (user.role === 'admin') { routeTo('admin-dashboard'); } else { routeTo('user-dashboard'); }
            syncNavActions();
        } else {
            showToast("Auth Failed", "Invalid email credentials or password entered.", "error");
        }
    });
}

function handleSignupSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const pass = document.getElementById('signupPassword').value.trim();
    const confirmPass = document.getElementById('signupConfirmPassword').value.trim();

    if (pass !== confirmPass) {
        showToast("Password Mismatch", "Passwords do not match. Please verify parameters.", "error");
        return;
    }

    apiRequest('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'signup', name, email, password: pass })
    }).then(res => {
        if (res && res.success && res.user) {
            ACTIVE_USER = res.user;
            saveDb('active_user', ACTIVE_USER);
            if (res.token) setAuthToken(res.token);
            showToast("Account Created", 'Welcome, ' + name + '! Your profile is now secure.', "success");
            document.getElementById('signupForm').reset();
            syncNavActions();
            routeTo('user-dashboard');
        } else {
            // Fallback to local signup
            if (USERS.some(u => u.email === email)) {
                showToast("Email Exists", "This email is already registered. Please login.", "error");
                return;
            }
            const newUser = { name, email, password: pass, role: "user" };
            USERS.push(newUser);
            saveDb('users', USERS);
            ACTIVE_USER = newUser;
            saveDb('active_user', ACTIVE_USER);
            showToast("Account Created", 'Welcome, ' + name + '! (Offline Mode)', "success");
            document.getElementById('signupForm').reset();
            syncNavActions();
            routeTo('user-dashboard');
        }
    }).catch(() => {
        if (USERS.some(u => u.email === email)) {
            showToast("Email Exists", "This email is already registered.", "error");
            return;
        }
        const newUser = { name, email, password: pass, role: "user" };
        USERS.push(newUser);
        saveDb('users', USERS);
        ACTIVE_USER = newUser;
        saveDb('active_user', ACTIVE_USER);
        showToast("Account Created", 'Welcome, ' + name + '! (Offline)', "success");
        document.getElementById('signupForm').reset();
        syncNavActions();
        routeTo('user-dashboard');
    });
}

function handleLogout() {
    removeAuthToken();
    ACTIVE_USER = null;
    saveDb('active_user', null);
    CART = [];
    saveDb('cart', CART);
    
    showToast("Logged Out", "You have successfully signed out of your account locker.", "info");
    routeTo('home');
}

function handleContactForm(e) {
    e.preventDefault();
    showToast("Message Sent", "Thank you! Our customer support team will email you in 1-2 hours.", "success");
    e.target.reset();
}

// --- 11. INITIALIZATION ON DOM CONTENT LOAD ---
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize theme
    initTheme();
    // Helper to dismiss loading overlay
    function dismissLoadingOverlay() {
        setTimeout(() => {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => { overlay.style.display = 'none'; }, 400);
            }
        }, 300);
    }

    try {
    // Load live data from MongoDB API
    await loadDataFromApi();
    } catch (e) {
        console.warn('API initialization failed, continuing with cached data:', e);
    }

    // Initialize custom variables
    document.documentElement.style.setProperty('--logo-height', CMS_CONFIG.logoHeight || '52px');
    
    // Trigger About page rendering from configurations
    const aboutBox = document.getElementById('aboutPageContentBox');
    if (aboutBox) {
        aboutBox.innerHTML = '<h1>' + (CMS_CONFIG.aboutHeading || 'About DigiVault') + '</h1>' + (CMS_CONFIG.aboutContentHTML || '');
    }
    _isInitializing = false;
    console.log('DigiVault: Initialization complete, API saves enabled.');

    // Force loading animation overlay fade out
    dismissLoadingOverlay();

    // Synchronize custom HSL colors inside root stylesheet
    applyCmsTheme();
    
    // Load config variables inside customize drawers FIRST
    loadCmsValuesIntoInputs();

    // Then apply visual branding from loaded config
    applyCmsBranding();
    applyCmsHero();
    applyCmsAnnouncement();
    applyCmsFooter();
    applyCmsPolicies();

    // Sync nav auth state from persisted session
    syncNavActions();

    // Check if resetToken is in query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('resetToken');
    if (resetToken) {
        routeTo('reset-password');
    } else {
        // Render Home defaults
        renderHomeView();
    }

    // Init Lucide Icons bindings
    lucide.createIcons();

    // Launch social proof purchase popups loop
    setTimeout(() => {
        triggerSocialPurchaseAlert();
        setInterval(triggerSocialPurchaseAlert, 18000);
    }, 5000);
});

// --- HERO AUTO-ROTATING PRODUCT SLIDER ENGINE ---
let heroSliderInterval = null;
let activeHeroSlideIdx = 0;

function startHeroSlider() {
    if (heroSliderInterval) clearInterval(heroSliderInterval);
    
    const sliderContainer = document.getElementById('homeHeroSliderContainer');
    if (!sliderContainer) return;
    
    sliderContainer.style.position = 'relative';

    // Fetch products marked as featured
    const featuredProducts = PRODUCTS.filter(p => p.featured);
    if (featuredProducts.length === 0) {
        // Fallback to static hero grid if no product is featured
        sliderContainer.innerHTML = `
            <div class="hero-grid">
                <div class="hero-content">
                    <div class="hero-tag">PREMIUM DIGITAL VAULT</div>
                    <h1>Unlock Your <span class="text-gradient">Creative Potential</span></h1>
                    <p>Access thousands of premium digital assets, courses, and templates designed to elevate your creative projects. The ultimate vault for modern creators.</p>
                    <div class="hero-cta-group">
                        <button class="btn-premium-glow" onclick="routeTo('shop')">
                            <span>Explore Our Creative Vault</span>
                            <i data-lucide="arrow-right"></i>
                        </button>
                        <button class="btn-secondary" onclick="routeTo('about')">Learn More</button>
                    </div>
                </div>
                <div class="hero-visual" style="display:flex; justify-content:center;">
                    <img src="assets/marathi_fonts_bundle_box.png" style="max-width:280px; height:auto; filter:drop-shadow(0 15px 25px rgba(0,0,0,0.5));">
                </div>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const renderSlides = () => {
        sliderContainer.innerHTML = '';
        featuredProducts.forEach((prod, idx) => {
            const isActive = idx === activeHeroSlideIdx;
            const slide = document.createElement('div');
            slide.className = 'hero-grid hero-slide-item';
            slide.style.display = isActive ? 'grid' : 'none';
            slide.style.opacity = isActive ? '1' : '0';
            slide.style.transition = 'opacity 0.5s ease';
            
            // If it has a custom landing URL, redirect there!
            const clickCta = prod.customLandingUrl 
                ? "window.location.href='" + prod.customLandingUrl + "'" 
                : `addToCart('${prod.id}', true)`;
            
            slide.innerHTML = `
                <div class="hero-content" style="text-align:left;">
                    <div class="hero-tag" style="background:rgba(124,58,237,0.1); border:1px solid rgba(124,58,237,0.25); color:#a78bfa; display:inline-block; padding:4px 10px; border-radius:100px; font-size:0.75rem; font-weight:700; text-transform:uppercase; margin-bottom:12px;">🔥 FEATURED VAULT PRODUCT</div>
                    <h1 style="font-size:2.8rem; font-weight:900; line-height:1.2; color:var(--text-white); margin-bottom:12px;">${prod.title}</h1>
                    <p style="font-size:1.05rem; color:var(--text-muted); line-height:1.5; margin-bottom:20px;">${prod.shortDescription || (prod.description.length > 120 ? prod.description.slice(0, 117) + '...' : prod.description)}</p>
                    <div style="background:rgba(255,255,255,0.02); display:inline-flex; align-items:center; gap:12px; padding:6px 14px; border-radius:8px; border:1px solid var(--border-color); margin-bottom:20px;">
                        <span style="font-size:0.82rem; color:var(--text-dim); text-decoration:line-through;">₹${prod.originalPrice.toLocaleString('en-IN')}</span>
                        <span style="font-size:1.1rem; color:#3b82f6; font-weight:800;">₹${prod.salePrice} /-</span>
                        <span style="background:rgba(16,185,129,0.1); color:var(--accent-green); padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:800;">SAVE ${Math.round((1 - prod.salePrice/prod.originalPrice)*100)}%</span>
                    </div>
                    <div class="hero-cta-group" style="display:flex; gap:12px;">
                        <button class="btn-premium-glow" onclick="${clickCta}">
                            <span>⚡ GET THIS DEAL NOW</span>
                            <i data-lucide="shopping-cart"></i>
                        </button>
                        <button class="btn-secondary" onclick="loadProductDetails('${prod.id}')">Learn More</button>
                    </div>
                </div>
                <div class="hero-visual" style="position:relative; display:flex; justify-content:center; align-items:center;">
                    <div style="position:absolute; width:260px; height:260px; background:radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(0,0,0,0) 70%); z-index:1;"></div>
                    <img class="prod-thumbnail" src="${prod.thumbnail}" alt="${prod.title}" style="max-width:280px; height:auto; border-radius:12px; z-index:2; filter:drop-shadow(0 15px 25px rgba(0,0,0,0.5)); transform:perspective(800px) rotateY(-6deg) rotateX(2deg); transition:all 0.4s;" onmouseover="this.style.transform='perspective(800px) rotateY(-2deg) scale(1.02)';" onmouseout="this.style.transform='perspective(800px) rotateY(-6deg) rotateX(2deg)';">
                </div>
            `;
            sliderContainer.appendChild(slide);
        });
        
        // Add sliding dot indicators
        if (featuredProducts.length > 1) {
            const dotStrip = document.createElement('div');
            dotStrip.style.display = 'flex';
            dotStrip.style.justifyContent = 'center';
            dotStrip.style.gap = '8px';
            dotStrip.style.marginTop = '24px';
            dotStrip.style.position = 'relative';
            dotStrip.style.zIndex = '10';
            
            featuredProducts.forEach((_, idx) => {
                const dot = document.createElement('div');
                dot.style.width = '10px';
                dot.style.height = '10px';
                dot.style.borderRadius = '50%';
                dot.style.background = idx === activeHeroSlideIdx ? '#3b82f6' : 'rgba(255,255,255,0.2)';
                dot.style.cursor = 'pointer';
                dot.style.transition = 'background 0.3s';
                dot.onclick = () => {
                    activeHeroSlideIdx = idx;
                    renderSlides();
                };
                dotStrip.appendChild(dot);
            });
            sliderContainer.appendChild(dotStrip);
        }

        // Add manual navigation arrows styled in clean white overlaying the slider
        if (featuredProducts.length > 1) {
            const leftArrow = document.createElement('button');
            leftArrow.className = 'hero-nav-arrow left';
            leftArrow.style.position = 'absolute';
            leftArrow.style.left = '-60px';
            leftArrow.style.top = '50%';
            leftArrow.style.transform = 'translateY(-50%)';
            leftArrow.style.width = '44px';
            leftArrow.style.height = '44px';
            leftArrow.style.borderRadius = '50%';
            leftArrow.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            leftArrow.style.background = 'rgba(255, 255, 255, 0.1)';
            leftArrow.style.color = '#ffffff';
            leftArrow.style.cursor = 'pointer';
            leftArrow.style.display = 'flex';
            leftArrow.style.alignItems = 'center';
            leftArrow.style.justifyContent = 'center';
            leftArrow.style.zIndex = '100';
            leftArrow.style.transition = 'all 0.3s';
            leftArrow.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
            leftArrow.innerHTML = '<i data-lucide="chevron-left" style="width:24px; height:24px; color:#ffffff;"></i>';
            
            leftArrow.onmouseover = () => {
                leftArrow.style.background = 'rgba(255, 255, 255, 0.25)';
                leftArrow.style.transform = 'translateY(-50%) scale(1.08)';
                leftArrow.style.borderColor = 'rgba(255, 255, 255, 0.6)';
            };
            leftArrow.onmouseout = () => {
                leftArrow.style.background = 'rgba(255, 255, 255, 0.1)';
                leftArrow.style.transform = 'translateY(-50%)';
                leftArrow.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            };
            leftArrow.onclick = (e) => {
                e.stopPropagation();
                activeHeroSlideIdx = (activeHeroSlideIdx - 1 + featuredProducts.length) % featuredProducts.length;
                renderSlides();
            };

            const rightArrow = document.createElement('button');
            rightArrow.className = 'hero-nav-arrow right';
            rightArrow.style.position = 'absolute';
            rightArrow.style.right = '-60px';
            rightArrow.style.top = '50%';
            rightArrow.style.transform = 'translateY(-50%)';
            rightArrow.style.width = '44px';
            rightArrow.style.height = '44px';
            rightArrow.style.borderRadius = '50%';
            rightArrow.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            rightArrow.style.background = 'rgba(255, 255, 255, 0.1)';
            rightArrow.style.color = '#ffffff';
            rightArrow.style.cursor = 'pointer';
            rightArrow.style.display = 'flex';
            rightArrow.style.alignItems = 'center';
            rightArrow.style.justifyContent = 'center';
            rightArrow.style.zIndex = '100';
            rightArrow.style.transition = 'all 0.3s';
            rightArrow.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
            rightArrow.innerHTML = '<i data-lucide="chevron-right" style="width:24px; height:24px; color:#ffffff;"></i>';
            
            rightArrow.onmouseover = () => {
                rightArrow.style.background = 'rgba(255, 255, 255, 0.25)';
                rightArrow.style.transform = 'translateY(-50%) scale(1.08)';
                rightArrow.style.borderColor = 'rgba(255, 255, 255, 0.6)';
            };
            rightArrow.onmouseout = () => {
                rightArrow.style.background = 'rgba(255, 255, 255, 0.1)';
                rightArrow.style.transform = 'translateY(-50%)';
                rightArrow.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            };
            rightArrow.onclick = (e) => {
                e.stopPropagation();
                activeHeroSlideIdx = (activeHeroSlideIdx + 1) % featuredProducts.length;
                renderSlides();
            };

            sliderContainer.appendChild(leftArrow);
            sliderContainer.appendChild(rightArrow);
        }
        
        lucide.createIcons();
    };
    
    renderSlides();
    
    // Start auto-slide rotation every 5 seconds
    if (featuredProducts.length > 1) {
        heroSliderInterval = setInterval(() => {
            activeHeroSlideIdx = (activeHeroSlideIdx + 1) % featuredProducts.length;
            renderSlides();
        }, 5000);
    }
}

// --- 20. LIGHT/DARK THEME ENGINE ---
function initTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    const sunIcon = document.querySelector('.theme-icon-sun');
    const moonIcon = document.querySelector('.theme-icon-moon');
    
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'inline-block';
    } else {
        document.body.classList.remove('light-theme');
        if (sunIcon) sunIcon.style.display = 'inline-block';
        if (moonIcon) moonIcon.style.display = 'none';
    }
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    initTheme();
}


// --- 21. SECURE PASSWORD RESET OPERATIONS ---
function handleForgotPasswordSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('forgotPasswordEmail').value.trim();
    
    showToast("Sending...", "Sending password reset request...", "info");
    
    apiRequest('/api/auth/reset', {
        method: 'POST',
        body: JSON.stringify({ action: 'request', email })
    }).then(res => {
        if (res && res.success) {
            showToast("Reset Link Sent", "If this email exists, a secure reset link has been sent.", "success");
            document.getElementById('forgotPasswordForm').reset();
            routeTo('login');
        } else {
            showToast("Error", (res && res.error) || "Failed to send reset link", "error");
        }
    }).catch(err => {
        showToast("Error", "Network connection error", "error");
    });
}

function handleResetPasswordCompletionSubmit(e) {
    e.preventDefault();
    const newPassword = document.getElementById('newPasswordInput').value.trim();
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('resetToken');
    
    if (!token) {
        showToast("Error", "Missing secure token from URL", "error");
        return;
    }
    
    showToast("Updating...", "Updating your password...", "info");
    
    apiRequest('/api/auth/reset', {
        method: 'POST',
        body: JSON.stringify({ action: 'reset', token, newPassword })
    }).then(res => {
        if (res && res.success) {
            showToast("Success", "Password updated successfully! Please log in.", "success");
            document.getElementById('resetPasswordCompletionForm').reset();
            
            // Clean URL query parameters
            const url = new URL(window.location);
            url.searchParams.delete('resetToken');
            window.history.replaceState({}, document.title, url.toString());
            
            routeTo('login');
        } else {
            showToast("Error", (res && res.error) || "Failed to update password", "error");
        }
    }).catch(err => {
        showToast("Error", "Network connection error", "error");
    });
}
