'use server';

import { login, logout } from '@/libs/session-auth.lib';
import { redirect } from 'next/navigation';

export async function sessionLoginAction(formData: FormData) {
    await login(formData);
    redirect('/');
}

export async function sessionLogoutAction() {
    await logout();
    redirect('/');
}
