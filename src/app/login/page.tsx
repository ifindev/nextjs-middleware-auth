import { jwtLoginAction } from '@/actions/jwt-auth.action';

export default async function LoginPage() {
    return (
        <section className="flex flex-col items-center justify-center h-screen">
            <form action={jwtLoginAction} className="flex flex-col gap-2">
                <label htmlFor="email">Email</label>
                <input
                    className="border border-gray-200 rounded-md p-2"
                    type="email"
                    name="email"
                    required
                />
                <label htmlFor="password">Password</label>
                <input
                    className="border border-gray-200 rounded-md p-2"
                    type="password"
                    name="password"
                    required
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
                    Login
                </button>
            </form>
        </section>
    );
}
