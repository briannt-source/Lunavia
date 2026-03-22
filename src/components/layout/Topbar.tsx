'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import GlobalSearch from './GlobalSearch';
import AccountMenu from './AccountMenu';
import { NotificationCenter } from '@/components/dashboard/NotificationCenter';

interface Props {
    role?: string;
    onToggleSidebar?: () => void;
    sidebarOpen?: boolean;
}

export default function Topbar({ role, onToggleSidebar, sidebarOpen }: Props) {
    const { data: session } = useSession();
    const userRole = role || (session?.user as any)?.role;

    const primaryActions: Record<string, { label: string; href: string; icon: string }> = {
        TOUR_OPERATOR: { label: 'New Tour', href: '/dashboard/operator/tours/new', icon: '+' },
        TOUR_GUIDE: { label: 'Browse', href: '/dashboard/guide/available', icon: '🔍' },
        ADMIN: { label: 'Review', href: '/dashboard/admin/verification', icon: '📋' },
        SUPER_ADMIN: { label: 'Review', href: '/dashboard/admin/verification', icon: '📋' },
        OPS: { label: 'Review', href: '/dashboard/admin/verification', icon: '📋' },
        CS: { label: 'Incidents', href: '/dashboard/admin/incidents', icon: '🚨' },
        FINANCE: null as any,
    };

    const action = userRole ? primaryActions[userRole] : null;

    return (
        <header className="topbar sticky top-0 z-40 flex items-center justify-between gap-4 px-5"
            style={{ height: 'var(--topbar-height)' }}>
            {/* Left: Hamburger + Search */}
            <div className="flex items-center gap-3">
                {/* Mobile hamburger */}
                <button
                    onClick={onToggleSidebar}
                    className="flex lg:hidden items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                    aria-label="Toggle sidebar"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        {sidebarOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        )}
                    </svg>
                </button>
                <GlobalSearch />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* Primary Action */}
                {action && (
                    <Link
                        href={action.href}
                        className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                        style={{ background: 'rgb(var(--color-primary))' }}
                    >
                        <span className="text-xs">{action.icon}</span>
                        <span className="hidden sm:inline">{action.label}</span>
                    </Link>
                )}

                {/* Notifications */}
                <NotificationCenter />

                {/* Account */}
                <AccountMenu />
            </div>
        </header>
    );
}
