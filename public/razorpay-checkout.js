// Razorpay Checkout Integration
// Dynamically loads the Razorpay script and overrides the checkout submission

(function() {
    // 1. Inject Razorpay standard checkout script
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.head.appendChild(script);
    }

    // 2. Override the global handleRazorpayCheckout function
    window.handleRazorpayCheckout = async function(e) {
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

            // Create a processing spinner overlay
            showToast("Authenticating Profile", "Setting up your digital dashboard locker...", "info");

            const signupRes = await apiRequest('/api/auth', {
                method: 'POST',
                body: JSON.stringify({ action: 'signup', name: firstName + ' ' + lastName, email, password })
            });

            if (signupRes && signupRes.success) {
                ACTIVE_USER = signupRes.user;
                saveDb('active_user', ACTIVE_USER);
                if (signupRes.token) setAuthToken(signupRes.token);
                syncNavActions();
            } else {
                // Try logging in
                const loginRes = await apiRequest('/api/auth', {
                    method: 'POST',
                    body: JSON.stringify({ action: 'login', email, password })
                });

                if (loginRes && loginRes.success) {
                    ACTIVE_USER = loginRes.user;
                    saveDb('active_user', ACTIVE_USER);
                    if (loginRes.token) setAuthToken(loginRes.token);
                    syncNavActions();
                } else {
                    showToast("Auth Error", "Authentication failed. Incorrect password or invalid email.", "error");
                    return;
                }
            }
        } else {
            // Update phone locally
            currentUser.phone = phone;
            saveDb('users', USERS);
            ACTIVE_USER = currentUser;
            saveDb('active_user', ACTIVE_USER);
        }

        showToast("Connecting Razorpay", "Initializing secure order payload...", "info");

        // 3. Request Razorpay Order from API
        const couponCode = APPLIED_COUPON ? APPLIED_COUPON.code : null;
        const orderPayload = await apiRequest('/api/create-order', {
            method: 'POST',
            body: JSON.stringify({ cartItems: CART, couponCode })
        });

        if (!orderPayload || !orderPayload.success) {
            showToast("Checkout Error", orderPayload ? orderPayload.error : "Failed to create order.", "error");
            return;
        }

        const keyId = orderPayload.keyId || '';

        // 4. Open Razorpay Checkout modal
        const options = {
            key: keyId,
            amount: orderPayload.amount,
            currency: orderPayload.currency,
            name: 'DigiVault Premium Store',
            description: 'Digital Vault Assets Bundle Checkout',
            order_id: orderPayload.orderId,
            prefill: {
                name: firstName + ' ' + lastName,
                email: email,
                contact: phone
            },
            theme: {
                color: '#8b5cf6'
            },
            handler: async function(response) {
                // Show a processing overlay
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
                        <div style="font-size:2.2rem; font-weight:800; color:#8b5cf6; margin-bottom:12px; letter-spacing:0.5px;">DigiVault</div>
                        <div style="border: 3px solid transparent; border-top-color: #8b5cf6; border-radius: 50%; width: 40px; height: 40px; margin: 20px auto; animation: spin 1s linear infinite;"></div>
                        <h4 style="font-size: 1.1rem; margin-bottom: 8px; font-weight: 700;">Verifying Your Payment</h4>
                        <p style="font-size: 0.8rem; color: var(--text-dim); line-height: 1.5; margin-bottom: 12px;">Securing your digital purchase keys... Please wait.</p>
                    </div>
                    <style>
                        @keyframes spin { to { transform: rotate(360deg); } }
                    </style>
                `;
                document.body.appendChild(processingOverlay);

                // Send payment details for signature verification
                const verifyRes = await apiRequest('/api/verify-payment', {
                    method: 'POST',
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        cartItems: CART,
                        couponCode
                    })
                });

                document.body.removeChild(processingOverlay);

                if (verifyRes && verifyRes.success) {
                    showToast("Payment Successful", "Order has been processed and delivered to your locker!", "success");

                    // Update local database order tracking
                    const newOrder = {
                        orderId: response.razorpay_order_id,
                        userEmail: email,
                        products: CART.map(item => ({ id: item.id, title: item.title, downloadUrl: item.downloadUrl })),
                        totalPaid: Math.round(orderPayload.amount / 100),
                        gateway: 'Razorpay Live',
                        date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
                        status: 'Paid'
                    };

                    ORDERS.push(newOrder);
                    saveDb('orders', ORDERS);

                    // Add items to local user purchases
                    if (ACTIVE_USER) {
                        if (!ACTIVE_USER.purchases) ACTIVE_USER.purchases = [];
                        CART.forEach(item => {
                            if (!ACTIVE_USER.purchases.includes(item.id)) {
                                ACTIVE_USER.purchases.push(item.id);
                            }
                        });
                        saveDb('active_user', ACTIVE_USER);
                    }

                    // Clear shopping cart
                    CART = [];
                    saveDb('cart', CART);
                    APPLIED_COUPON = null;
                    syncNavActions();

                    // Close checkout modal and redirect to dashboard
                    closeCheckoutGatewayModal();
                    routeTo('user-dashboard');
                } else {
                    showToast("Verification Error", verifyRes ? verifyRes.error : "Failed to verify transaction.", "error");
                }
            },
            modal: {
                ondismiss: function() {
                    showToast("Checkout Cancelled", "Payment process was cancelled by user.", "info");
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };
})();
