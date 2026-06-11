/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        // ── Main SPA (DigiVault store/dashboard) ─────────────────────────────
        {
          source: '/',
          destination: '/index.html',
        },
        // ── Standalone Landing Pages ──────────────────────────────────────────
        // Each landing page is a self-contained HTML file in /public.
        // To add a new landing page:
        //   1. Create public/your-page.html
        //   2. Include <script src="site-config.js"></script> FIRST in <head>
        //   3. Include <script src="auth-bridge.js"></script> after site-config
        //   4. Use authBridge.signupOrLogin(), authBridge.createOrder(),
        //      and authBridge.verifyPayment() for the checkout flow
        //   5. Add a rewrite entry below and redeploy
        {
          source: '/marathi-fonts',
          destination: '/marathi-fonts.html',
        },
        // Example for a future landing page:
        // {
        //   source: '/hindi-ebooks',
        //   destination: '/hindi-ebooks.html',
        // },
      ]
    };
  }
};

module.exports = nextConfig;
