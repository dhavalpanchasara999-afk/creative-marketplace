/**
 * DigiVault Site Configuration
 * =============================
 * Central config for all HTML landing pages.
 * Include this file FIRST in any landing page <head>.
 *
 * Usage: <script src="site-config.js"></script>
 */
const SITE_CONFIG = {
    // Production domain — must match NEXT_PUBLIC_SITE_URL in .env.local and Vercel env vars
    siteUrl: 'https://digivault.co.in',

    // Base path for API calls — empty string = same origin (works on both localhost and production)
    apiBase: '',

    // Brand info
    brandName: 'DigiVault',
    supportEmail: 'support@digivault.co.in',

    // Helper: resolve a path relative to the main app root
    // e.g. SITE_CONFIG.url('/') → 'https://digivault.co.in/'
    url(path) {
        return this.siteUrl + (path || '');
    }
};
