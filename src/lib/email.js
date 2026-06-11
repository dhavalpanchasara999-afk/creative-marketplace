export async function sendEmail({ to, subject, html }) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
        console.warn('[EMAIL WARNING] RESEND_API_KEY is not defined. Email simulation mode active.');
        console.log(`[SIMULATED EMAIL] To: ${to}\nSubject: ${subject}\nContent:\n${html}`);
        return { success: true, simulated: true };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'DigiVault <support@digivault.co.in>',
                to: [to],
                subject: subject,
                html: html
            })
        });

        const data = await response.json();
        if (response.ok) {
            console.log(`[Resend Email Success] Email sent to ${to}. ID: ${data.id}`);
            return { success: true, id: data.id };
        } else {
            console.error('[Resend Email Error]', data);
            return { success: false, error: data };
        }
    } catch (e) {
        console.error('[Resend Email Exception]', e);
        return { success: false, error: e.message };
    }
}

export async function sendPurchaseEmail({ to, orderId, products, totalPaid }) {
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://digivault.co.in';

    const productsListHtml = products.map(p => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 12px 0; color: #ffffff; font-weight: 600;">${p.title}</td>
            <td style="padding: 12px 0; text-align: right;"><a href="${p.downloadUrl}" style="color: #3b82f6; text-decoration: none; font-weight: 700;">Download</a></td>
        </tr>
    `).join('');

    const htmlContent = `
        <div style="font-family: 'Outfit', 'Inter', sans-serif; background: #06070a; color: #f3f4f6; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.06);">
            <div style="text-align: center; margin-bottom: 30px;">
                <span style="font-size: 1.5rem; font-weight: 900; letter-spacing: 1px; color: #ffffff; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">DIGIVAULT</span>
            </div>
            
            <h2 style="color: #ffffff; font-size: 1.6rem; margin-bottom: 10px; text-align: center;">Order Confirmed!</h2>
            <p style="color: #9ca3af; font-size: 0.95rem; text-align: center; margin-bottom: 30px;">
                Thank you for your purchase. Your invoice ID is <strong>#${orderId}</strong>. Below are your download links.
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <th style="padding: 8px 0; text-align: left; color: #6b7280; font-size: 0.85rem; text-transform: uppercase;">Product</th>
                        <th style="padding: 8px 0; text-align: right; color: #6b7280; font-size: 0.85rem; text-transform: uppercase;">Link</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsListHtml}
                </tbody>
            </table>
            
            <div style="background: rgba(255,255,255,0.02); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 30px; display: flex; justify-content: space-between;">
                <span style="color: #9ca3af;">Total Paid</span>
                <strong style="color: #3b82f6; font-size: 1.1rem;">&#8377;${totalPaid}</strong>
            </div>
            
            <div style="text-align: center;">
                <a href="${SITE_URL}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 0.95rem; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);">
                    Go to Dashboard Locker
                </a>
            </div>
            
            <p style="color: #6b7280; font-size: 0.8rem; text-align: center; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 20px;">
                Need help? Contact support@digivault.co.in
            </p>
        </div>
    `;

    return sendEmail({
        to,
        subject: `Your DigiVault Digital Purchase [Order #${orderId}]`,
        html: htmlContent
    });
}
