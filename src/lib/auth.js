import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'digivault_ultra_secure_server_jwt_secret_token_123';

// 1. PASSWORD CRYPTOGRAPHY HELPERS
export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hashed) {
    return bcrypt.compare(password, hashed);
}

// 2. JWT TOKEN ISSUING ENGINE
export function signToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
}

// 3. MIDDLEWARE SESSION PARSER FROM REQUEST COOKIES OR HEADERS
export function getAuthenticatedUser(req) {
    try {
        // A. Extract authorization header bearer
        const authHeader = req.headers.get('authorization');
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        // B. Extract from Cookies if present
        if (!token) {
            const cookieHeader = req.headers.get('cookie') || '';
            const cookies = Object.fromEntries(
                cookieHeader.split(';').map(c => c.trim().split('='))
            );
            token = cookies['digivault_auth_token'];
        }

        if (!token) return null;

        return verifyToken(token);
    } catch (e) {
        return null;
    }
}
