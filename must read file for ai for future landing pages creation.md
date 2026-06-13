# DigiVault — Landing Page Architecture Guide

> **For AI Agents & Developers**: Read this before touching anything related to landing pages,
> authentication, payment, or domain URLs. This documents the full system as it stands.

---

## Project Architecture Overview

This is a **dual-layer** Next.js application:

| Layer | What it is | Files |
|-------|-----------|-------|
| **Main SPA** | The full DigiVault store — shop, auth, admin, dashboard | `public/index.html`, `public/script.js`, `public/razorpay-checkout.js` |
| **Landing Pages** | Standalone HTML pages, each targeting one product | `public/*.html` (except index.html) |
| **Backend API** | Next.js serverless API routes | `src/app/api/**` |
| **Shared Modules** | Scripts every landing page must include | `public/site-config.js`, `public/auth-bridge.js` |

The main SPA is served via a Next.js rewrite: `/ → /index.html`.
All landing pages are also served via rewrites in `next.config.js`.

---

## Authentication System

**CRITICAL**: There are two auth storage mechanisms. They must stay in sync.

### How Auth Works
- JWT token stored in `localStorage` key: **`digivault_auth_token`**
- Active user object stored in `localStorage` key: **`active_user`**
- The same JWT is also set as an **HttpOnly cookie** (`digivault_auth_token`) by the server on login/signup
- Cookie is `SameSite=Lax` (NOT Strict) — this is intentional so session persists when navigating from landing pages back to the main app

### Auth Flow (API-backed, NOT localStorage simulation)
```
User fills checkout form
    → authBridge.signupOrLogin() → POST /api/auth (action: signup)
    → If email exists → POST /api/auth (action: login)
    → On success: JWT stored in localStorage + cookie set by server
    → ACTIVE_USER object stored in localStorage
    → Session is now shared with main app (index.html)
```

### What NOT to do
- ❌ Never create users by writing directly to `localStorage('users')` — that creates ghost accounts not in MongoDB
- ❌ Never hardcode domain URLs (localhost, vercel URLs) — always use `NEXT_PUBLIC_SITE_URL` env var or `SITE_CONFIG.siteUrl`
- ❌ Never set `SameSite=Strict` on the auth cookie — breaks cross-page session

---

## Shared Modules (Required for Every Landing Page)

### `public/site-config.js`
Provides the `SITE_CONFIG` global object. Always include FIRST.
```js
SITE_CONFIG.siteUrl      // → 'https://digivault.co.in'
SITE_CONFIG.apiBase      // → '' (same-origin, works on localhost + production)
SITE_CONFIG.brandName    // → 'DigiVault'
SITE_CONFIG.supportEmail // → 'support@digivault.co.in'
SITE_CONFIG.url('/path') // → 'https://digivault.co.in/path'
```

### `public/auth-bridge.js`
Provides the `authBridge` global object. Include AFTER site-config.js.
Uses identical localStorage keys as `script.js` — so sessions are shared.
```js
authBridge.isLoggedIn()                            // → true/false
authBridge.getUser()                               // → { id, name, email, role } or null
authBridge.getToken()                              // → JWT string or null
authBridge.signupOrLogin({ name, email, password }) // → { success, user, isNewUser, error }
authBridge.createOrder(cartItems, couponCode)       // → { success, orderId, amount, keyId, ... }
authBridge.verifyPayment(paymentData)               // → { success, orderId, ... }
authBridge.apiRequest(endpoint, options)            // → fetch() with auto Bearer token
```

---

## How to Create a New Landing Page

### Step 1 — Copy the template
```
public/landing-template.html  →  copy as  →  public/your-page-name.html
```

### Step 2 — Edit the HTML file
Must-haves at the top of `<head>` (in this order):
```html
<script src="site-config.js"></script>   <!-- 1st: always -->
<script src="auth-bridge.js"></script>   <!-- 2nd: always -->
<script src="https://unpkg.com/lucide@latest"></script>
<link rel="stylesheet" href="style.css">
```

The checkout form MUST have these element IDs:
```
id="checkoutForm"         — the <form> tag, onsubmit calls your handler
id="checkoutFirstName"    — text input
id="checkoutLastName"     — text input
id="checkoutEmail"        — email input
id="checkoutPhone"        — text input
id="checkoutPassword"     — password input
id="passwordFieldWrapper" — the <div> wrapping the password field (for hiding when logged in)
```

### Step 3 — Write the checkout logic
Use this exact pattern (copy from `landing-template.html`):

```js
// 1. Pre-fill form if user already logged in (call on page load)
if (authBridge.isLoggedIn()) {
    const user = authBridge.getUser();
    // fill name, email fields
    // hide #passwordFieldWrapper and remove 'required' from #checkoutPassword
}

// 2. Checkout handler
async function handleCheckout() {
    // A. Auth
    if (!authBridge.isLoggedIn()) {
        const res = await authBridge.signupOrLogin({ name, email, password });
        if (!res.success) { showError(res.error); return; }
    }

    // B. Create order (product must exist in MongoDB!)
    const cartItems = [{ id: 'YOUR_PRODUCT_MONGODB_ID' }];
    const order = await authBridge.createOrder(cartItems, null);
    if (!order.success) { showError(order.error); return; }

    // C. Open Razorpay
    new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        order_id: order.orderId,
        handler: async function(response) {
            // D. Verify payment
            const verify = await authBridge.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                cartItems,
                couponCode: null
            });
            if (verify.success) {
                // E. Redirect to main app — session carries over automatically
                window.location.href = 'index.html#user-dashboard';
            }
        }
    }).open();
}
```

### Step 4 — Add the URL rewrite in `next.config.js`
```js
// In the beforeFiles array:
{
  source: '/products/your-page-name',    // URL user sees in browser
  destination: '/your-page-name.html'    // file in /public
}
```

### Step 5 — Create the product in Admin Dashboard
Log in as admin → Admin Portal → Product Management → Add Product:
- Fill title, price, thumbnail, description etc. as normal
- **"Custom Landing URL"** field → enter: `/products/your-page-name`
- Save

### Step 6 — Push to GitHub
Vercel auto-deploys. Page goes live at `digivault.co.in/products/your-page-name`.

---

## How Products Link to Landing Pages (The Magic)

Every product in the database has a `customLandingUrl` field (added to the Mongoose schema in `src/lib/db.js`).

In `public/script.js`, when a user clicks a product card or "Buy Now" button:
```js
// script.js ~line 1463
if (prod && prod.customLandingUrl) {
    window.location.href = prod.customLandingUrl;  // → goes to landing page
    return;
}
// otherwise → opens the generic product detail panel in the SPA
```


### CRITICAL RULE: customLandingUrl must be a URL path, NOT a filename

```js
// CORRECT - uses the Next.js rewrite path
customLandingUrl: "/marathi-fonts"

// WRONG - direct filename, bypasses rewrites, shows ugly Vercel URL
customLandingUrl: "marathi-fonts.html"
```

**Why this matters**: `window.location.href = "marathi-fonts.html"` navigates to the raw
file URL (e.g. `cryo-photon-xxx.vercel.app/marathi-fonts.html`), bypassing your custom
domain rewrite. Always use the rewrite path so the URL stays on `digivault.co.in`.

**This value must be set in TWO places** every time you create a landing page:
1. `public/script.js` - in the `INITIAL_PRODUCTS` seed array (localStorage fallback)
2. **Admin Dashboard -> Edit Product -> Custom Landing URL field** (live MongoDB record)

If you update code but forget the Admin Dashboard step, the live site uses the old
MongoDB value. **Always do both.**

This means:
- The product still shows up in the shop grid normally (thumbnail, price, title)
- It still exists in MongoDB and is tracked in the admin dashboard
- Clicking it redirects to your custom landing page instead of the generic panel
- The landing page handles its own checkout (via `authBridge`) and links back to the same product in the DB

---

## Environment Variables

| Variable | Where Set | Purpose |
|----------|-----------|---------|
| `NEXT_PUBLIC_SITE_URL` | `.env.local` + Vercel Dashboard | Canonical domain for email links (reset, purchase). Value: `https://digivault.co.in` |
| `MONGODB_URI` | `.env.local` + Vercel Dashboard | Database connection |
| `JWT_SECRET` | `.env.local` + Vercel Dashboard | Token signing |
| `RAZORPAY_KEY_ID` | `.env.local` + Vercel Dashboard | Payment gateway (server-side) |
| `RAZORPAY_KEY_SECRET` | `.env.local` + Vercel Dashboard | Payment signature verification |
| `RESEND_API_KEY` | `.env.local` + Vercel Dashboard | Transactional email sending |

> ⚠️ `.env.local` is in `.gitignore` — never push it. All variables must also be added in Vercel Dashboard > Project Settings > Environment Variables.

---

## API Endpoints Reference

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/auth` | POST | Login / Signup | No |
| `/api/auth/reset` | POST | Request / complete password reset | No |
| `/api/products` | GET | Fetch all products | No |
| `/api/products` | POST/PUT/DELETE | CRUD products | Admin JWT |
| `/api/cms` | GET/PUT | CMS config | PUT: Admin JWT |
| `/api/create-order` | POST | Create Razorpay order | User JWT |
| `/api/verify-payment` | POST | Verify payment + fulfill order | User JWT |
| `/api/webhook` | POST | Razorpay webhook (fallback fulfillment) | Webhook secret |
| `/api/orders` | GET | List all orders | Admin JWT |
| `/api/users` | GET | List all users | Admin JWT |
| `/api/analytics` | GET | Sales analytics | Admin JWT |

---

## Email System (Resend)

Email sending is handled in `src/lib/email.js` via the Resend API.

Two functions:
- `sendEmail({ to, subject, html })` — generic sender
- `sendPurchaseEmail({ to, orderId, products, totalPaid })` — purchase confirmation with download links

**Domain**: All emails sent from `support@digivault.co.in` (verified on Resend).

**Links in emails**: Always use `process.env.NEXT_PUBLIC_SITE_URL` — never hardcode localhost or Vercel URLs.

---

## Existing Landing Pages

| URL | File | Product |
|-----|------|---------|
| `digivault.co.in/` | `public/index.html` | Main SPA (all products) |
| `digivault.co.in/marathi-fonts` | `public/marathi-fonts.html` | 300+ Premium Marathi Fonts Pack |

---

## File Structure Reference

```
cryo-photon/
├── public/                        # Static files served directly
│   ├── index.html                 # Main SPA — DO NOT break this
│   ├── script.js                  # Core SPA engine — edit carefully
│   ├── razorpay-checkout.js       # Main app Razorpay checkout (API-backed)
│   ├── style.css                  # Shared styles (used by all pages)
│   ├── site-config.js             # ← Shared: domain/brand config
│   ├── auth-bridge.js             # ← Shared: auth module for landing pages
│   ├── landing-template.html      # ← Starter template for new landing pages
│   ├── marathi-fonts.html         # Landing page: Marathi Fonts Pack
│   └── config.js                  # CMS seed config for index.html
│
├── src/
│   ├── app/
│   │   ├── layout.js              # Root Next.js layout
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── route.js       # Login + Signup (sets SameSite=Lax cookie)
│   │       │   └── reset/route.js # Password reset (uses NEXT_PUBLIC_SITE_URL)
│   │       ├── products/route.js  # Product CRUD
│   │       ├── cms/route.js       # CMS config
│   │       ├── create-order/route.js   # Razorpay order creation
│   │       ├── verify-payment/route.js # Payment verification + order fulfillment
│   │       ├── webhook/route.js        # Razorpay webhook
│   │       ├── orders/route.js         # Admin: list orders
│   │       ├── users/route.js          # Admin: list users
│   │       └── analytics/route.js      # Admin: sales metrics
│   └── lib/
│       ├── auth.js                # JWT + bcrypt helpers
│       ├── db.js                  # Mongoose schemas + connection
│       └── email.js               # Resend email sender
│
├── next.config.js                 # URL rewrites for SPA + landing pages
├── .env.local                     # Secret env vars (NOT in git)
└── LANDING_PAGES.md               # ← This file
```

---

## Quick Checklist for New Landing Pages

```
[ ] Copied landing-template.html to public/your-page.html
[ ] site-config.js included FIRST in <head>
[ ] auth-bridge.js included SECOND in <head>
[ ] Form has correct IDs (checkoutFirstName, checkoutLastName, checkoutEmail, checkoutPhone, checkoutPassword, passwordFieldWrapper, checkoutForm)
[ ] Pre-fill logic added (authBridge.isLoggedIn() check on page load)
[ ] Checkout uses authBridge.signupOrLogin() → authBridge.createOrder() → Razorpay → authBridge.verifyPayment()
[ ] Redirect after payment: window.location.href = 'index.html#user-dashboard'
[ ] Rewrite added in next.config.js: source = '/your-path', destination = '/your-page.html'
[ ] INITIAL_PRODUCTS in script.js updated: customLandingUrl = "/your-path" (NOT "your-page.html")
[ ] Product created in Admin Dashboard: Custom Landing URL = /your-path (same as rewrite source)
[ ] Pushed to GitHub → Vercel redeployed
[ ] NEXT_PUBLIC_SITE_URL set in Vercel Dashboard (if not already)
```

---

## Known Issues & Fixes Applied

| Date | Issue | Root Cause | Fix Applied |
|------|-------|-----------|------------|
| Jun 2026 | Marathi fonts page showed Vercel URL instead of custom domain | customLandingUrl was "marathi-fonts.html" (filename) not "/marathi-fonts" (path). Filename bypasses Next.js rewrite. | Fixed in script.js seed + src/app/api/seed/route.js. MongoDB updated via Admin Dashboard. |
| Jun 2026 | Users logged out after purchasing on landing page | Landing page wrote directly to localStorage instead of calling /api/auth. Different user object shape — main app didn't recognise the session. | Rewrote marathi-fonts.html checkout to use authBridge.signupOrLogin() + real API. |
| Jun 2026 | Password reset emails linked to Vercel URL | reset/route.js used req.headers.get('origin') which returns the Vercel deployment URL. | Changed to process.env.NEXT_PUBLIC_SITE_URL in reset/route.js. |
| Jun 2026 | Purchase confirmation email linked to localhost:3000 | Hardcoded URL in email.js. | Changed to process.env.NEXT_PUBLIC_SITE_URL in email.js. |
| Jun 2026 | Auth cookie blocked on cross-page redirects | SameSite=Strict prevents cookie being sent on navigations from landing pages back to main app. | Changed to SameSite=Lax in src/app/api/auth/route.js. |
| Jun 2026 | Prefill never worked on landing page even after push | auth-bridge.js used USER_KEY = 'active_user' but script.js saveDb() always prefixes 'digivault_' making the real key 'digivault_active_user'. authBridge.isLoggedIn() always returned false because it was reading the wrong localStorage key. | Fixed USER_KEY to 'digivault_active_user' in auth-bridge.js. TOKEN_KEY was already correct as 'digivault_auth_token' (stored directly by setAuthToken without prefix). |
