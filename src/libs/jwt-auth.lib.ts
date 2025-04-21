import { SignJWT, jwtVerify, JWTPayload as JoseJWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Types
export interface UserJWTPayload extends JoseJWTPayload {
    userId: string;
    email: string;
    name: string;
}

// Constants
const ACCESS_TOKEN_EXPIRY = '10s';
const REFRESH_TOKEN_EXPIRY = '30s';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
};

// Keys
const accessTokenKey = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
const refreshTokenKey = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

// Token Generation
export async function generateTokens(payload: UserJWTPayload) {
    const accessToken = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_EXPIRY)
        .sign(accessTokenKey);

    const refreshToken = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(REFRESH_TOKEN_EXPIRY)
        .sign(refreshTokenKey);

    return { accessToken, refreshToken };
}

// Token Verification
export async function verifyAccessToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, accessTokenKey, {
            algorithms: ['HS256'],
        });
        return payload as UserJWTPayload;
    } catch (error) {
        return null;
    }
}

export async function verifyRefreshToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, refreshTokenKey, {
            algorithms: ['HS256'],
        });
        return payload as UserJWTPayload;
    } catch (error) {
        return null;
    }
}

// Cookie Management
export async function setAuthCookies(accessToken: string, refreshToken: string) {
    const cookieStore = await cookies();

    cookieStore.set('access_token', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60, // 15 minutes
    });

    cookieStore.set('refresh_token', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });
}

export async function clearAuthCookies() {
    const cookieStore = await cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
}

// Auth Actions
export async function login(formData: FormData) {
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // TODO: Implement proper user validation
    const user: UserJWTPayload = {
        userId: '1',
        email: email as string,
        name: 'Test User',
    };

    const { accessToken, refreshToken } = await generateTokens(user);
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({ success: true });
}

export async function logout() {
    await clearAuthCookies();
    return NextResponse.json({ success: true });
}

// Token Refresh
export async function refreshTokens() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
        return null;
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
        return null;
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(payload);
    await setAuthCookies(accessToken, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
}

// API Route Protection
export async function protectApiRoute(request: NextRequest) {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.next();
}

// get user from cookies
export async function getUserFromCookies() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        return null;
    }

    const payload = await verifyAccessToken(accessToken);
    return payload as UserJWTPayload;
}
