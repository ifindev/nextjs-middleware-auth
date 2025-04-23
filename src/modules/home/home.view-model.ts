'use client';

import { useActionState } from 'react';
import { logoutAction } from '@/actions/auth.action';

export default function useHomeViewModel() {
    const [logoutState, logoutFormAction, logoutPending] = useActionState(logoutAction, null);

    return { logoutState, logoutFormAction, logoutPending };
}
