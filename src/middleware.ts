import { NextRequest } from 'next/server';
import { jwtAuthMiddleware } from './middlewares/jwt-auth.middleware';
// import { sessionAuthMiddleware } from './middlewares/session-auth';

export async function middleware(request: NextRequest) {
    // CAN SWITCH BETWEEN JWT AND SESSION AUTH
    // BUT, CHANGE THE LOGIN & LOGOUT METHOD IN LOGIN PAGE
    // AND LOGOUT IN THE HOME PAGE
    return jwtAuthMiddleware(request);
    // return sessionAuthMiddleware(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
