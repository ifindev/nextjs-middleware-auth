import { NextRequest, NextResponse } from 'next/server';

import checkRoute from '@/middlewares/check-route.middleware';
import getAuthStatus from '@/middlewares/auth-status.middleware';

export default async function authMiddleware(request: NextRequest) {
    const { isPublicRoute } = checkRoute(request);

    const authStatus = await getAuthStatus(request);

    // Handle public routes - redirect authenticated users to home
    if (isPublicRoute && authStatus.status === 'authenticated') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Handle protected routes - redirect unauthenticated users to login
    if (!isPublicRoute && authStatus.status === 'unauthenticated') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow the request to proceed
    return NextResponse.next();
}
