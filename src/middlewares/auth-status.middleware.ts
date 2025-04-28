import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import {
    COOKIE_NAME,
    accessTokenCookieOptions,
    refreshTokenCookieOptions,
} from '@/constants/cookie.constant';
import { isTokenExpired } from '@/utils/jwt.util';
import authRepository from '@/libs/auth/repository/auth.repository.impl';

type AuthStatus = { status: 'authenticated' } | { status: 'unauthenticated' };

export default async function getAuthStatus(request: NextRequest): Promise<AuthStatus> {
    const accessToken = request.cookies.get(COOKIE_NAME.ACCESS_TOKEN)?.value;
    const refreshToken = request.cookies.get(COOKIE_NAME.REFRESH_TOKEN)?.value;
    const cookieStore = await cookies();

    if (accessToken && !isTokenExpired(accessToken)) {
        return { status: 'authenticated' };
    }

    if (!refreshToken) {
        return { status: 'unauthenticated' };
    }

    if (isTokenExpired(refreshToken)) {
        return { status: 'unauthenticated' };
    }

    try {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await authRepository.refreshToken();

        cookieStore.set(COOKIE_NAME.ACCESS_TOKEN, newAccessToken, accessTokenCookieOptions);
        cookieStore.set(COOKIE_NAME.REFRESH_TOKEN, newRefreshToken, refreshTokenCookieOptions);

        return { status: 'authenticated' };
    } catch (error) {
        cookieStore.delete(COOKIE_NAME.ACCESS_TOKEN);
        cookieStore.delete(COOKIE_NAME.REFRESH_TOKEN);

        console.error('Token refresh failed:', error);
        return { status: 'unauthenticated' };
    }
}
