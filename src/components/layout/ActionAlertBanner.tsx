"use client";

import Link from 'next/link';

type AlertType = 'verification' | 'plan_expired' | 'profile_incomplete' | 'maintenance';

interface ActionAlertBannerProps {
    type: AlertType;
    role?: 'TOUR_OPERATOR' | 'TOUR_GUIDE' | 'ADMIN';
    message?: string;
    className?: string;
}

const ALERT_CONFIG: Record<AlertType, {
    icon: string;
    title: string;
    description: string;
    cta: string;
    href: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    ctaColor: string;
}> = {
    verification: {
        icon: '🛡️',
        title: 'Verification Required',
        description: 'Complete your profile verification to unlock all features.',
        cta: 'Get Verified',
        href: '/dashboard/verification',
        bgColor: 'bg-lunavia-light',
        borderColor: 'border-[#5BA4CF]/30',
        textColor: 'text-indigo-800',
        ctaColor: 'bg-lunavia-primary hover:bg-indigo-700 text-white',
    },
    plan_expired: {
        icon: '⚠️',
        title: 'Plan Expired',
        description: 'Your subscription has expired. Renew to continue using advanced features.',
        cta: 'View Plans',
        href: '/dashboard/account/subscription',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-800',
        ctaColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    profile_incomplete: {
        icon: '📝',
        title: 'Complete Your Profile',
        description: 'Add more details to your profile to improve visibility.',
        cta: 'Edit Profile',
        href: '/dashboard/profile',
        bgColor: 'bg-lunavia-light',
        borderColor: 'border-lunavia-muted/60',
        textColor: 'text-blue-800',
        ctaColor: 'bg-lunavia-primary hover:bg-lunavia-primary-hover text-white',
    },
    maintenance: {
        icon: '🔧',
        title: 'System Maintenance',
        description: 'The platform is currently undergoing maintenance.',
        cta: 'View Status',
        href: '/dashboard/admin/maintenance',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        ctaColor: 'bg-orange-600 hover:bg-orange-700 text-white',
    },
};

/**
 * Unified ActionAlertBanner for all action-required alerts.
 * Displays at top of dashboard pages.
 */
export function ActionAlertBanner({ type, role, message, className = '' }: ActionAlertBannerProps) {
    const config = ALERT_CONFIG[type];

    // Adjust verification href based on role
    let href = config.href;
    if (type === 'verification' && role) {
        href = role === 'TOUR_OPERATOR' ? '/dashboard/operator/verification' : '/dashboard/guide/verification';
    }
    if (type === 'profile_incomplete' && role) {
        href = role === 'TOUR_OPERATOR' ? '/dashboard/operator/profile' : '/dashboard/guide/profile';
    }

    return (
        <div className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-4 ${className}`}>
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                    <span className="text-xl">{config.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${config.textColor}`}>{config.title}</h3>
                    <p className={`mt-0.5 text-sm ${config.textColor} opacity-80`}>
                        {message || config.description}
                    </p>
                </div>
                <Link
                    href={href}
                    className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${config.ctaColor}`}
                >
                    {config.cta}
                </Link>
            </div>
        </div>
    );
}
