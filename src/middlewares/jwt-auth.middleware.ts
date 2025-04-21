import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, refreshTokens, UserJWTPayload } from '@/libs/jwt-auth.lib';
import checkRoute from '@/middlewares/check-route.middleware';

type AuthStatus =
    | { status: 'authenticated'; payload: UserJWTPayload }
    | { status: 'refreshed'; payload: UserJWTPayload }
    | { status: 'unauthenticated' };

export async function jwtAuthMiddleware(request: NextRequest) {
    const { isPublicRoute } = checkRoute(request);

    // Get authentication status
    const authStatus = await getAuthStatus(request);

    // Handle public routes - redirect authenticated users to home
    if (isPublicRoute && authStatus.status !== 'unauthenticated') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Handle protected routes - redirect unauthenticated users to login
    if (!isPublicRoute && authStatus.status === 'unauthenticated') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow the request to proceed
    return NextResponse.next();
}

async function getAuthStatus(request: NextRequest): Promise<AuthStatus> {
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    // Check access token first
    if (accessToken) {
        const payload = await verifyAccessToken(accessToken);
        if (payload) {
            return { status: 'authenticated', payload };
        }
    }

    // If no access token, try refresh token if available
    if (refreshToken) {
        const newTokens = await refreshTokens();
        if (newTokens) {
            // refreshTokens() already sets the new cookies
            // For the middleware to know the user's identity, we need to get the payload
            const payload = await verifyAccessToken(newTokens.accessToken);
            if (payload) {
                return { status: 'refreshed', payload };
            }
        }
    }

    // No valid tokens
    return { status: 'unauthenticated' };
}
