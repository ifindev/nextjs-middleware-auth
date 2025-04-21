'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
    const pathname = usePathname();
    console.log(pathname);
    return (
        <nav className="flex gap-2">
            <Link href="/" className={`underline ${pathname === '/' && 'text-blue-500'}`}>
                Home
            </Link>
            <Link
                href="/profile"
                className={`underline ${pathname === '/profile' && 'text-blue-500'}`}
            >
                Profile
            </Link>
        </nav>
    );
}
