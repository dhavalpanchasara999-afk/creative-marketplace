import { NextResponse } from 'next/server';
import { connectToDatabase, User } from '..\..\..\lib/db';
import { hashPassword, comparePassword, signToken, getAuthenticatedUser } from '..\..\..\lib/auth';

// 1. GET PROFILE ROUTE - Resolves current user details
export async function GET(req) {
    try {
        await connectToDatabase();
        const sessionUser = getAuthenticatedUser(req);
        
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized Session' }, { status: 401 });
        }

        const user = await User.findById(sessionUser.id).select('-password');
        if (!user) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// 2. POST AUTHENTICATION ROUTE - Handles both Login and Signup actions
export async function POST(req) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { action, name, email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password parameters are required' }, { status: 400 });
        }

        // A. SIGNUP FLOW
        if (action === 'signup') {
            if (!name) {
                return NextResponse.json({ error: 'Full Name is required for registration' }, { status: 400 });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return NextResponse.json({ error: 'This email is already registered.' }, { status: 400 });
            }

            const hashedPassword = await hashPassword(password);
            
            // Check if this is the very first user registering (make them an Admin automatically)
            const userCount = await User.countDocuments();
            const role = userCount === 0 ? 'admin' : 'user';

            const newUser = await User.create({
                name,
                email,
                password: hashedPassword,
                role
            });

            const token = signToken(newUser);
            const response = NextResponse.json({
                success: true,
                message: 'Account registered successfully!',
                user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
            });

            // Set secure httponly cookie header
            response.headers.set(
                'Set-Cookie',
                `digivault_auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
            );

            return response;
        }

        // B. LOGIN FLOW
        if (action === 'login') {
            const user = await User.findOne({ email });
            if (!user) {
                return NextResponse.json({ error: 'Invalid email address or password credentials' }, { status: 400 });
            }

            const isValid = await comparePassword(password, user.password);
            if (!isValid) {
                return NextResponse.json({ error: 'Invalid email address or password credentials' }, { status: 400 });
            }

            const token = signToken(user);
            const response = NextResponse.json({
                success: true,
                message: 'Welcome back to DigiVault!',
                user: { id: user._id, name: user.name, email: user.email, role: user.role }
            });

            response.headers.set(
                'Set-Cookie',
                `digivault_auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
            );

            return response;
        }

        return NextResponse.json({ error: 'Invalid auth action. Must be login or signup.' }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
