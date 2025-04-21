import { publicRoutes } from '@/constants/route.constant';
import { NextRequest } from 'next/server';

export default function checkRoute(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path);
    const isProtectedRoute = !isPublicRoute;

    return { isPublicRoute, isProtectedRoute };
}
