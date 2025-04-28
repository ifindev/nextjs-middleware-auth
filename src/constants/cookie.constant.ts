import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const COOKIE_NAME = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
};

export const accessTokenCookieOptions: Partial<ResponseCookie> = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 10, // 10 seconds => JUST FOR DEMO PURPOSES. SHOULD BE COMMUNICATED WITH THE BACKEND TEAM.
};

export const refreshTokenCookieOptions: Partial<ResponseCookie> = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60, // 30 seconds => JUST FOR DEMO PURPOSES. SHOULD BE COMMUNICATED WITH THE BACKEND TEAM.
};
