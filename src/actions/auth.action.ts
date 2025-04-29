'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import authRepository from '@/libs/auth/repository/auth.repository.impl';
import {
    accessTokenCookieOptions,
    COOKIE_NAME,
    refreshTokenCookieOptions,
} from '@/constants/cookie.constant';

export async function getAuthToken() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(COOKIE_NAME.ACCESS_TOKEN)?.value ?? '';
    const refreshToken = cookieStore.get(COOKIE_NAME.REFRESH_TOKEN)?.value ?? '';

    return { accessToken, refreshToken };
}

export async function setAuthToken(accessToken: string, refreshToken: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME.ACCESS_TOKEN, accessToken, accessTokenCookieOptions);
    cookieStore.set(COOKIE_NAME.REFRESH_TOKEN, refreshToken, refreshTokenCookieOptions);
}

export async function loginAction(_prevState: unknown, formData: FormData) {
    try {
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        const { accessToken, refreshToken } = await authRepository.login({
            username,
            password,
        });

        const cookieStore = await cookies();

        cookieStore.set(COOKIE_NAME.ACCESS_TOKEN, accessToken, accessTokenCookieOptions);
        cookieStore.set(COOKIE_NAME.REFRESH_TOKEN, refreshToken, refreshTokenCookieOptions);
    } catch (error) {
        console.error('JWT Login Action Error:', error);
        return {
            message: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            status: 'error',
        };
    }

    redirect('/');
}

export async function logoutAction() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete(COOKIE_NAME.ACCESS_TOKEN);
        cookieStore.delete(COOKIE_NAME.REFRESH_TOKEN);

        await authRepository.logout();

        redirect('/login');
    } catch (error) {
        console.error('JWT Logout Action Error:', error);
        redirect('/');
    }
}
