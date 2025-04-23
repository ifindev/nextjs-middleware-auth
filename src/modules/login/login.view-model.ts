import { useActionState } from 'react';
import { loginAction } from '@/actions/auth.action';

export default function useLoginViewModel() {
    const [loginState, loginFormAction, loginPending] = useActionState(loginAction, null);

    return { loginState, loginFormAction, loginPending };
}
