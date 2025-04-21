'use server';

import { login, logout } from '@/libs/jwt-auth.lib';
import { redirect } from 'next/navigation';

export async function jwtLoginAction(formData: FormData) {
    await login(formData);
    redirect('/');
}

export async function jwtLogoutAction() {
    await logout();
    redirect('/');
}
