'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { VerificationBadge } from '@/components/common/VerificationBadge';
import { isUserVerified } from '@/lib/verification';

function roleRoute(role: string): string {
    switch (role) {
        case 'TOUR_OPERATOR': return 'operator';
        case 'TOUR_GUIDE': return 'guide';
        case 'ADMIN':
        case 'SUPER_ADMIN':
        case 'OPS':
        case 'CS':
        case 'FINANCE':
            return 'admin';
        default: return 'guide';
    }
}

export default function AccountMenu() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const user = session?.user as any;
    const initials = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';
    const isVerified = isUserVerified(user);
    const route = roleRoute(user?.role || '');

    const roleLabels: Record<string, string> = {
        TOUR_OPERATOR: 'Operator',
        TOUR_GUIDE: 'Guide',
        ADMIN: 'Admin',
        SUPER_ADMIN: 'Super Admin',
        OPS: 'Operations',
        CS: 'Customer Service',
        FINANCE: 'Finance',
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 transition"
            >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 overflow-hidden">
                    {user?.image ? (
                        <img src={user.image} alt="User" className="h-full w-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>
                {isVerified && (
                    <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 bg-white rounded-full p-0.5">
                        <VerificationBadge size="sm" />
                    </div>
                )}
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-3">
                        <div className="flex items-center gap-1.5">
                            <div className="truncate text-sm font-medium text-gray-900 max-w-[150px]">
                                {user?.name || user?.email || 'User'}
                            </div>
                            {isVerified && <VerificationBadge size="sm" />}
                        </div>
                        <div className="truncate text-xs text-gray-500">
                            {roleLabels[user?.role] || user?.role}
                        </div>
                    </div>

                    <div className="py-1">
                        <Link
                            href={`/dashboard/${route}/profile`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                            <span>👤</span>
                            Profile
                        </Link>
                        <Link
                            href={`/dashboard/${route}/settings`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                            <span>⚙️</span>
                            Settings
                        </Link>
                    </div>

                    <div className="border-t border-gray-100 py-1">
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                            <span>🚪</span>
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

