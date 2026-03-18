"use client";

import Link from 'next/link';
import { UserPlan, PLAN_CONFIG, formatPlanExpiryDate } from '@/lib/plans';

interface PlanExpiredBannerProps {
    storedPlan: UserPlan;
    expiresAt: Date | null;
    className?: string;
}

/**
 * Banner displayed when user's paid plan has expired
 * Shows upgrade CTA and expiry date
 */
export function PlanExpiredBanner({ storedPlan, expiresAt, className = '' }: PlanExpiredBannerProps) {
    if (storedPlan === 'FREE' || !expiresAt) return null;

    const now = new Date();
    const expiredDate = new Date(expiresAt);

    if (expiredDate > now) return null; // Not expired yet

    const planName = PLAN_CONFIG[storedPlan].displayName;

    return (
        <div className={`rounded-xl border border-amber-200 bg-amber-50 p-4 ${className}`}>
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <span className="text-xl">⚠️</span>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-amber-800">
                        Your {planName} Plan Has Expired
                    </h3>
                    <p className="mt-1 text-sm text-amber-700">
                        Your plan expired on {formatPlanExpiryDate(expiresAt)}.
                        Some features are now limited. Renew to continue using advanced features.
                    </p>
                    <div className="mt-3 flex gap-3">
                        <Link
                            href="/pricing"
                            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
                        >
                            Request Upgrade
                        </Link>
                        <Link
                            href="/pricing"
                            className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                            View Plans
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Compact expired notice for sidebar/header use
 */
export function PlanExpiredNotice({ storedPlan, expiresAt }: { storedPlan: UserPlan; expiresAt: Date | null }) {
    if (storedPlan === 'FREE' || !expiresAt) return null;

    const expiredDate = new Date(expiresAt);
    if (expiredDate > new Date()) return null;

    return (
        <div className="rounded-lg bg-amber-100 px-3 py-2 text-xs text-amber-800">
            <div className="font-medium">Plan Expired</div>
            <Link href="/pricing" className="text-amber-600 underline hover:no-underline">
                Renew now
            </Link>
        </div>
    );
}
