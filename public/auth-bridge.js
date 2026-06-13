/**
 * DigiVault Auth Bridge
 * =====================
 * Shared authentication module for standalone HTML landing pages.
 * Uses the EXACT same localStorage keys and API endpoints as the main app (script.js),
 * so sessions are shared seamlessly across index.html and all landing pages.
 *
 * Usage:
 *   1. Include site-config.js first
 *   2. Include this file: <script src="auth-bridge.js"></script>
 *   3. Use `authBridge.*` methods in your page scripts
 *
 * Key Design Rules:
 *   - Auth token key: 'digivault_auth_token'   (matches script.js getAuthToken())
 *   - Active user key: 'active_user'            (matches script.js saveDb('active_user'))
 *   - All API calls use Bearer token in Authorization header (matches script.js apiRequest())
 */
const authBridge = (() => {

    const TOKEN_KEY = 'digivault_auth_token';
    const USER_KEY  = 'digivault_active_user'; // Matches script.js saveDb('active_user') which prefixes 'digivault_'

    // ── Token helpers ──────────────────────────────────────────────────────────
    function getToken() {
        return localStorage.getItem(TOKEN_KEY) || null;
    }

    function setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    }

    function removeToken() {
        localStorage.removeItem(TOKEN_KEY);
    }

    // ── User helpers ───────────────────────────────────────────────────────────
    function getUser() {
        try {
            return JSON.parse(localStorage.getItem(USER_KEY)) || null;
        } catch { return null; }
    }

    function setUser(user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    function isLoggedIn() {
        return !!(getToken() && getUser());
    }

    // ── Fetch wrapper ──────────────────────────────────────────────────────────
    async function apiRequest(endpoint, options = {}) {
        const token = getToken();
        const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const res = await fetch((SITE_CONFIG.apiBase || '') + endpoint, {
                ...options,
                headers,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return await res.json();
        } catch (err) {
            console.warn('[authBridge] API request failed:', endpoint, err);
            return null;
        }
    }

    // ── Auth: signup or login ──────────────────────────────────────────────────
    /**
     * Attempt signup first. If the email already exists in the DB, attempt login.
     * Stores token + user to localStorage using the same keys as script.js.
     *
     * @param {object} params - { name, email, password }
     * @returns {{ success, user, isNewUser, error }}
     */
    async function signupOrLogin({ name, email, password }) {
        // 1. Try signup
        const signupRes = await apiRequest('/api/auth', {
            method: 'POST',
            body: JSON.stringify({ action: 'signup', name, email, password })
        });

        if (signupRes && signupRes.success && signupRes.user) {
            if (signupRes.token) setToken(signupRes.token);
            setUser(signupRes.user);
            return { success: true, user: signupRes.user, isNewUser: true };
        }

        // 2. If email already registered, fallback to login
        if (signupRes && signupRes.error && signupRes.error.toLowerCase().includes('already registered')) {
            const loginRes = await apiRequest('/api/auth', {
                method: 'POST',
                body: JSON.stringify({ action: 'login', email, password })
            });

            if (loginRes && loginRes.success && loginRes.user) {
                if (loginRes.token) setToken(loginRes.token);
                setUser(loginRes.user);
                return { success: true, user: loginRes.user, isNewUser: false };
            }

            return {
                success: false,
                error: loginRes ? loginRes.error : 'Login failed. Please check your password.'
            };
        }

        return {
            success: false,
            error: signupRes ? signupRes.error : 'Could not reach server. Please try again.'
        };
    }

    // ── Orders ─────────────────────────────────────────────────────────────────
    /**
     * Create a Razorpay order via the backend API.
     * Returns { success, orderId, amount, currency, keyId } or { success: false, error }
     */
    async function createOrder(cartItems, couponCode) {
        const res = await apiRequest('/api/create-order', {
            method: 'POST',
            body: JSON.stringify({ cartItems, couponCode: couponCode || null })
        });
        return res;
    }

    /**
     * Verify Razorpay payment signature via the backend API.
     * @param {object} paymentData - { razorpay_order_id, razorpay_payment_id, razorpay_signature, cartItems, couponCode }
     */
    async function verifyPayment(paymentData) {
        const res = await apiRequest('/api/verify-payment', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
        return res;
    }

    // Public API
    return {
        getToken,
        setToken,
        removeToken,
        getUser,
        setUser,
        isLoggedIn,
        apiRequest,
        signupOrLogin,
        createOrder,
        verifyPayment
    };
})();
