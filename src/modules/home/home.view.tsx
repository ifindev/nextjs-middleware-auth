'use client';

import useHomeViewModel from './home.view-model';

export default function HomeView() {
    const { logoutState, logoutFormAction, logoutPending } = useHomeViewModel();

    return (
        <div className="flex flex-col gap-2">
            <form action={logoutFormAction} className="flex gap-2">
                <button
                    disabled={logoutPending}
                    type="submit"
                    className="bg-red-500 text-white p-2 rounded-md w-full"
                >
                    {logoutPending ? 'Logging out...' : 'Logout'}
                </button>
            </form>
            <pre>{JSON.stringify(logoutState, null, 2)}</pre>
        </div>
    );
}
