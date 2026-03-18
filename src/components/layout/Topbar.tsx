'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import GlobalSearch from './GlobalSearch';
import AccountMenu from './AccountMenu';
import { NotificationCenter } from '@/components/dashboard/NotificationCenter';
// Governance rule: Lunavia uses light mode only to ensure clarity and operational consistency.
// ThemeToggle removed.
import DensityToggle from '@/components/density/DensityToggle';

interface Props {
    role?: string;
}

export default function Topbar({ role }: Props) {
    const { data: session } = useSession();
    const userRole = role || (session?.user as any)?.role;

    // Primary action config per role
    const primaryActions: Record<string, { label: string; href: string; icon: string }> = {
        TOUR_OPERATOR: {
            label: 'New Request',
            href: '/dashboard/operator/tours/new',
            icon: '+',
        },
        TOUR_GUIDE: {
            label: 'Browse Tours',
            href: '/dashboard/guide/available',
            icon: '🔍',
        },
        ADMIN: {
            label: 'Review Queue',
            href: '/dashboard/admin/verification',
            icon: '📋',
        },
        SUPER_ADMIN: {
            label: 'Review Queue',
            href: '/dashboard/admin/verification',
            icon: '📋',
        },
        OPS: {
            label: 'Review Queue',
            href: '/dashboard/admin/verification',
            icon: '📋',
        },
        CS: {
            label: 'Incidents',
            href: '/dashboard/admin/incidents',
            icon: '🚨',
        },
        FINANCE: null as any, // Finance is read-only
    };

    const action = userRole ? primaryActions[userRole] : null;

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-6">
            {/* Left: Search */}
            <div className="flex items-center gap-6">
                <GlobalSearch />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {/* Primary Action Button */}
                {action && (
                    <Link
                        href={action.href}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                        <span>{action.icon}</span>
                        <span className="hidden sm:inline">{action.label}</span>
                    </Link>
                )}

                {/* Density toggle (theme toggle removed - light mode only) */}
                <div className="hidden md:flex items-center gap-1 border-l border-gray-200 pl-3">
                    <DensityToggle />
                </div>

                {/* Notifications */}
                <div className="border-l border-gray-200 pl-3">
                    <NotificationCenter />
                </div>

                {/* Account Menu */}
                <AccountMenu />
            </div>
        </header>
    );
}

