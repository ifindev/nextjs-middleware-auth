import { getUserFromCookies } from '@/libs/jwt-auth.lib';

export default async function ProfilePage() {
    const user = await getUserFromCookies();
    return (
        <pre className="border border-gray-200 rounded-md p-2 w-full text-xs text-wrap">
            {JSON.stringify(user, null, 2)}
        </pre>
    );
}
