'use client';

import Link from 'next/link';
import { usePathname } from '@/navigation';

const ROUTE_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    admin: 'Admin',
    operator: 'Operator',
    guide: 'Guide',
    tours: 'Tours',
    team: 'Team',
    insights: 'Insights',
    settings: 'Settings',
    profile: 'Profile',
    users: 'Users',
    verification: 'Verification',
    incidents: 'Incidents',
    cancellation: 'Cancellations',
    payments: 'Payments',
    vouchers: 'Vouchers',
    referral: 'Referrals',
    staff: 'Staff',
    maintenance: 'Maintenance',
    permissions: 'Permissions',
    pilot: 'System Health',
    investor: 'Investor',
    demo: 'Demo',
};

export default function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    // If on root dashboard, don't show breadcrumb or just show Dashboard
    if (segments.length === 0) return null;

    return (
        <nav className="hidden md:flex items-center text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
                Lunavia
            </Link>
            {segments.map((segment, index) => {
                const href = `/${segments.slice(0, index + 1).join('/')}`;
                const isLast = index === segments.length - 1;
                const label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

                return (
                    <div key={href} className="flex items-center">
                        <span className="mx-2 text-gray-400">/</span>
                        {isLast ? (
                            <span className="font-medium text-gray-900">{label}</span>
                        ) : (
                            <Link href={href} className="hover:text-gray-900 transition-colors">
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
