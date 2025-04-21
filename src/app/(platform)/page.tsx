import { jwtLogoutAction } from '@/actions/jwt-auth.action';

export default async function Home() {
    return (
        <div className="flex flex-col gap-2">
            <form action={jwtLogoutAction} className="flex gap-2">
                <button type="submit" className="bg-red-500 text-white p-2 rounded-md w-full">
                    Logout
                </button>
            </form>
        </div>
    );
}
