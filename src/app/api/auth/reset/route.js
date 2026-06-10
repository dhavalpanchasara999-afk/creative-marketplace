import { NextResponse } from 'next/server';
import { connectToDatabase, User } from '../../../../lib/db';
import { hashPassword } from '../../../../lib/auth';
import { sendEmail } from '../../../../lib/email';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'digivault_ultra_secure_server_jwt_secret_token_123';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { action, email, token, newPassword } = body;

        if (action === 'request') {
            if (!email) {
                return NextResponse.json({ error: 'Email is required' }, { status: 400 });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return NextResponse.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
            }

            const resetToken = jwt.sign(
                { id: user._id, email: user.email, purpose: 'reset-password' },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            const origin = req.headers.get('origin') || 'http://localhost:3000';
            const resetLink = `${origin}/?resetToken=${resetToken}`;

            const htmlContent = `
                <div style="font-family: 'Outfit', 'Inter', sans-serif; background: #06070a; color: #f3f4f6; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.06);">
                    <h2 style="color: #ffffff; font-size: 1.8rem; margin-bottom: 20px;">Reset Your Password</h2>
                    <p style="color: #9ca3af; font-size: 1rem; line-height: 1.6; margin-bottom: 24px;">
                        We received a request to reset the password for your DigiVault account. Click the button below to choose a new password. This link is valid for 1 hour.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #6b7280; font-size: 0.85rem; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 20px;">
                        If you did not request this, you can safely ignore this email.
                    </p>
                </div>
            `;

            await sendEmail({
                to: email,
                subject: 'Reset your DigiVault password',
                html: htmlContent
            });

            return NextResponse.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
        }

        if (action === 'reset') {
            if (!token || !newPassword) {
                return NextResponse.json({ error: 'Token and new password parameters are required' }, { status: 400 });
            }

            let decoded;
            try {
                decoded = jwt.verify(token, JWT_SECRET);
            } catch (err) {
                return NextResponse.json({ error: 'Invalid or expired password reset token' }, { status: 400 });
            }

            if (decoded.purpose !== 'reset-password') {
                return NextResponse.json({ error: 'Invalid token purpose' }, { status: 400 });
            }

            const user = await User.findById(decoded.id);
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const hashedPassword = await hashPassword(newPassword);
            user.password = hashedPassword;
            await user.save();

            return NextResponse.json({ success: true, message: 'Password reset successfully!' });
        }

        return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
