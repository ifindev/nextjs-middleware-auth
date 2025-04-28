'use client';

import { User } from '@/libs/auth/models/user.model';
import authRepository from '@/libs/auth/repository/auth.repository.impl';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        authRepository.getUser().then(setUser);
    }, []);

    return (
        <pre className="border border-gray-200 rounded-md p-2 w-full text-xs text-wrap">
            {JSON.stringify(user, null, 2)}
        </pre>
    );
}
