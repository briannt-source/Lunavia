"use client";
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Fragment } from 'react';

export default function InternalHeader() {
    const { data: session } = useSession();
    const user = session?.user as any;
    const role = user?.role || 'INTERNAL';

    return (
        <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin" className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900 tracking-tight">Lunavia</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                        {role}
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                {user && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 hidden sm:inline-block">
                            {user.name || user.email}
                        </span>
                        <Link
                            href="/dashboard/admin/profile"
                            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                        >
                            Profile
                        </Link>
                    </div>
                )}
                <div className="h-4 w-px bg-gray-300 mx-2"></div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-sm font-medium text-red-600 hover:text-red-700 transition ps-2"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}
