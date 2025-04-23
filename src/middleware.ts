import { NextRequest } from 'next/server';
import authMiddleware from './middlewares/auth.middleware';

export async function middleware(request: NextRequest) {
    return authMiddleware(request);
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
