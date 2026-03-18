"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DomainCounts {
    verificationPending: number;
    paymentPending: number;
    incidentOpen: number;
    cancellationReview: number;
    riskAlerts: number;
}

const DOMAIN_CARDS = [
    {
        key: 'verificationPending' as keyof DomainCounts,
        label: 'Verification',
        icon: '📋',
        href: '/dashboard/admin/verification',
        color: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
    },
    {
        key: 'paymentPending' as keyof DomainCounts,
        label: 'Payments',
        icon: '💰',
        href: '/dashboard/admin/payments',
        color: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800' },
    },
    {
        key: 'incidentOpen' as keyof DomainCounts,
        label: 'Incidents',
        icon: '🚨',
        href: '/dashboard/admin/incidents',
        color: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-800' },
    },
    {
        key: 'cancellationReview' as keyof DomainCounts,
        label: 'Cancellations',
        icon: '🚫',
        href: '/dashboard/admin/cancellation',
        color: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800' },
    },
    {
        key: 'riskAlerts' as keyof DomainCounts,
        label: 'Risk Alerts',
        icon: '🛡️',
        href: '/dashboard/admin/risk',
        color: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800' },
    },
];

export default function DomainCountsSummary() {
    const [counts, setCounts] = useState<DomainCounts | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch('/api/admin/admin-counts')
            .then(r => r.json())
            .then(setCounts)
            .catch(() => setError(true));
    }, []);

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                Failed to load domain counts
            </div>
        );
    }

    if (!counts) {
        return (
            <div className="grid grid-cols-5 gap-3">
                {DOMAIN_CARDS.map(c => (
                    <div key={c.key} className="h-20 rounded-lg bg-gray-100 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Domain Queues</h2>
            <div className="grid grid-cols-5 gap-3">
                {DOMAIN_CARDS.map(card => {
                    const count = counts[card.key];
                    return (
                        <Link
                            key={card.key}
                            href={card.href}
                            className={`rounded-xl border ${card.color.border} ${card.color.bg} p-4 hover:shadow-md transition-shadow`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-lg">{card.icon}</span>
                                {count > 0 && (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.color.badge}`}>
                                        {count}
                                    </span>
                                )}
                            </div>
                            <div className={`text-2xl font-bold ${card.color.text}`}>{count}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
