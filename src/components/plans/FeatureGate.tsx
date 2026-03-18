"use client";

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import {
    PlanFeature,
    canAccessFeature,
    getMinPlanForFeature,
    PLAN_CONFIG,
    UserPlan,
    isPlanExpired,
    getEffectivePlan
} from '@/lib/plans';

interface PlanUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: PlanFeature;
    requiredPlan: UserPlan;
    isExpired?: boolean;
}

/**
 * Modal displayed when user tries to access a locked feature
 * Shows feature info and required plan - no payment action
 */
export function PlanUpgradeModal({ isOpen, onClose, feature, requiredPlan, isExpired }: PlanUpgradeModalProps) {
    if (!isOpen) return null;

    const planConfig = PLAN_CONFIG[requiredPlan];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>

                {/* Icon */}
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                    <span className="text-2xl">{isExpired ? '⚠️' : '🔒'}</span>
                </div>

                {/* Content */}
                <h2 className="mb-2 text-center text-xl font-semibold text-gray-900">
                    {isExpired ? 'Plan Expired' : 'Upgrade Required'}
                </h2>
                <p className="mb-6 text-center text-gray-600">
                    {isExpired ? (
                        <>Your plan has expired. Renew to continue using this feature.</>
                    ) : (
                        <>This feature is available on the <span className="font-semibold text-indigo-600">{planConfig.displayName}</span> plan and above.</>
                    )}
                </p>

                {/* Feature info */}
                <div className="mb-6 rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">You&apos;re trying to access:</p>
                    <p className="font-medium text-gray-900">{feature.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Maybe Later
                    </button>
                    <button
                        disabled
                        className="flex-1 cursor-not-allowed rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-500"
                        title="Coming soon"
                    >
                        Request Upgrade
                    </button>
                </div>

                <p className="mt-4 text-center text-xs text-gray-400">
                    {isExpired ? 'Contact support to renew your plan.' : 'Upgrades available. Contact support for assistance.'}
                </p>
            </div>
        </div>
    );
}

interface FeatureGateProps {
    feature: PlanFeature;
    userPlan?: UserPlan;
    planExpiresAt?: Date | null;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Wraps features with plan-based access control
 * Phase 29: Now considers plan expiry
 * Shows children if user has access, otherwise shows locked UI
 */
export function FeatureGate({ feature, userPlan: propPlan, planExpiresAt: propExpiresAt, children, fallback }: FeatureGateProps) {
    const { data: session } = useSession();
    const [showModal, setShowModal] = useState(false);

    // Resolve plan and expiry from props or session
    // Default to FREE if nothing found
    const userPlan = propPlan ?? (session?.user as any)?.plan ?? 'FREE';
    const planExpiresAt = propExpiresAt !== undefined
        ? propExpiresAt
        : (session?.user as any)?.planExpiresAt;

    // Phase 29: Check effective plan considering expiry
    const isExpired = isPlanExpired(userPlan, planExpiresAt);
    const effectivePlan = getEffectivePlan(userPlan, planExpiresAt);
    const hasAccess = canAccessFeature(effectivePlan, feature);

    if (hasAccess) {
        return <>{children}</>;
    }

    const requiredPlan = getMinPlanForFeature(feature);

    // Default fallback: locked overlay
    const lockedFallback = fallback ?? (
        <button
            onClick={() => setShowModal(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left text-gray-500 hover:bg-gray-100 transition-colors"
        >
            <span className="text-lg">{isExpired ? '⚠️' : '🔒'}</span>
            <span className="flex-1">
                {feature.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
            </span>
            {isExpired ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    Expired
                </span>
            ) : (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    {requiredPlan}
                </span>
            )}
        </button>
    );

    return (
        <>
            {lockedFallback}
            <PlanUpgradeModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                feature={feature}
                requiredPlan={requiredPlan}
                isExpired={isExpired}
            />
        </>
    );
}

/**
 * Simple locked badge for inline use
 */
export function LockedBadge({ plan, isExpired }: { plan: UserPlan; isExpired?: boolean }) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${isExpired
            ? 'bg-amber-100 text-amber-600'
            : 'bg-gray-100 text-gray-600'
            }`}>
            <span>{isExpired ? '⚠️' : '🔒'}</span>
            <span>{isExpired ? 'Expired' : plan}</span>
        </span>
    );
}
