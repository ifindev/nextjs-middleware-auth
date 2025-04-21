import { updateSession } from '@/libs/session-auth.lib';
import { NextRequest, NextResponse } from 'next/server';
import checkRoute from '@/middlewares/check-route.middleware';

/**
 * Session-based authentication middleware
 * Protects routes based on session state and redirects users accordingly
 */
export async function sessionAuthMiddleware(request: NextRequest) {
    // Determine route type using the utility
    const { isPublicRoute, isProtectedRoute } = checkRoute(request);

    try {
        // Verify and update session
        const session = await updateSession(request);

        // Handle public routes - redirect authenticated users to home
        if (isPublicRoute && session) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Handle protected routes - redirect unauthenticated users to login
        if (isProtectedRoute && !session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Allow the request to proceed
        return NextResponse.next();
    } catch (error) {
        // If session validation fails, treat as unauthenticated
        if (isProtectedRoute) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }
}
