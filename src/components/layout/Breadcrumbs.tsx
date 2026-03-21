'use client';

import Link from 'next/link';
import { usePathname } from '@/navigation';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    admin: 'Admin',
    operator: 'Operator',
    guide: 'Guide',
    tours: 'Tours',
    'my-tours': 'My Tours',
    available: 'Marketplace',
    applications: 'Applications',
    assignments: 'Assignments',
    invites: 'Invitations',
    availability: 'Availability',
    calendar: 'Calendar',
    'standby-requests': 'Standby Requests',
    team: 'Team',
    insights: 'Insights',
    settings: 'Settings',
    profile: 'Profile',
    trust: 'Trust Score',
    contract: 'Contract',
    subscription: 'Subscription',
    verification: 'Verification',
    wallet: 'Wallet',
    earnings: 'Earnings',
    commission: 'Commission',
    finance: 'Finance',
    payments: 'Payments',
    portfolio: 'Portfolio',
    disputes: 'Disputes',
    blacklist: 'Blacklist',
    request: 'Service Requests',
    company: 'Company',
    guides: 'Guides',
    fleet: 'Fleet Tracking',
    'command-center': 'Command Center',
    emergencies: 'Emergencies',
    users: 'Users',
    companies: 'Companies',
    incidents: 'Incidents',
    cancellation: 'Cancellations',
    risk: 'Risk',
    vouchers: 'Vouchers',
    referral: 'Referrals',
    staff: 'Staff',
    admins: 'Admin Management',
    maintenance: 'Maintenance',
    permissions: 'Permissions',
    governance: 'Governance',
    pilot: 'System Health',
    investor: 'Investor',
    demo: 'Demo',
    observer: 'Observer',
    notifications: 'Notifications',
    messages: 'Messages',
    kyc: 'KYC',
    kyb: 'KYB',
    browse: 'Browse',
    create: 'Create',
    edit: 'Edit',
    apply: 'Apply',
    live: 'Live',
    report: 'Report',
    reports: 'Reports',
    manage: 'Manage',
    comparison: 'Comparison',
    transfers: 'Transfers',
    ledger: 'Ledger',
    topups: 'Top-ups',
    withdrawals: 'Withdrawals',
    escrow: 'Escrow',
    revenue: 'Revenue',
    subscriptions: 'Subscriptions',
    omniscience: 'Omniscience',
    'payment-settings': 'Payment Settings',
    bank: 'Bank Settings',
    'god-mode': 'God Mode',
    analytics: 'Analytics',
    feedback: 'Feedback',
    simulation: 'Simulation',
    'platform-intelligence': 'Platform Intelligence',
    account: 'Account',
};

export default function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    // Don't show breadcrumbs on root dashboard pages (only 1-2 segments like /dashboard/guide)
    if (segments.length <= 2) return null;

    // Build crumbs starting from the role-level dashboard
    const roleDashboardIndex = segments[0] === 'dashboard' ? 1 : 0;

    return (
        <nav className="flex items-center gap-1 text-sm mb-4 animate-fade-in" aria-label="Breadcrumb">
            {/* Home / Dashboard link */}
            <Link
                href={`/${segments.slice(0, roleDashboardIndex + 1).join('/')}`}
                className="flex items-center gap-1 text-gray-400 hover:text-lunavia-primary transition-colors shrink-0"
            >
                <Home className="h-3.5 w-3.5" />
            </Link>

            {segments.slice(roleDashboardIndex + 1).map((segment, index) => {
                const actualIndex = roleDashboardIndex + 1 + index;
                const href = `/${segments.slice(0, actualIndex + 1).join('/')}`;
                const isLast = actualIndex === segments.length - 1;

                // Skip UUID-like segments in display but keep in path
                const isUuid = /^[0-9a-f]{8,}$/i.test(segment) || /^c[a-z0-9]{20,}$/i.test(segment);
                const label = isUuid
                    ? '…'
                    : ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

                return (
                    <div key={href} className="flex items-center gap-1">
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                        {isLast ? (
                            <span className="font-medium text-gray-700 truncate max-w-[200px]">{label}</span>
                        ) : (
                            <Link
                                href={href}
                                className="text-gray-400 hover:text-lunavia-primary transition-colors truncate max-w-[150px]"
                            >
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
