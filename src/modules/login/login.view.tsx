'use client';

import useLoginViewModel from './login.view-model';

export default function LoginView() {
    const { loginFormAction, loginPending, loginState } = useLoginViewModel();

    return (
        <section className="flex flex-col items-center justify-center h-screen">
            <form action={loginFormAction} className="flex flex-col gap-2">
                <label htmlFor="email">Username</label>
                <input
                    className="border border-gray-200 rounded-md p-2"
                    type="text"
                    name="username"
                    required
                    placeholder="Enter your username"
                />
                <label htmlFor="password">Password</label>
                <input
                    className="border border-gray-200 rounded-md p-2"
                    type="password"
                    name="password"
                    required
                    placeholder="Enter your password"
                />
                <button
                    disabled={loginPending}
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded-md"
                >
                    Login
                </button>
                {loginState?.message && <p className="text-red-500">{loginState.message}</p>}
            </form>
        </section>
    );
}
