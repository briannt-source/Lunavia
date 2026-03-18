"use client";

import { useState } from 'react';
import Link from 'next/link';
import { UserPlan, PLAN_CONFIG, getMaxActiveTours } from '@/lib/plans';
import { PaymentRequestModal } from '@/components/payments/PaymentRequestModal';

interface PlanCardProps {
    currentPlan: UserPlan;
    activeTours?: number;
    role: 'operator' | 'guide';
}

/**
 * Displays user's current plan and usage in dashboard
 */
export function PlanCard({ currentPlan, activeTours = 0, role }: PlanCardProps) {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const planConfig = PLAN_CONFIG[currentPlan];
    const maxTours = getMaxActiveTours(currentPlan);

    return (
        <>
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Current Plan</p>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900">{planConfig.displayName}</span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${currentPlan === 'ELITE'
                                ? 'bg-amber-100 text-amber-800'
                                : currentPlan === 'PRO'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                {currentPlan}
                            </span>
                        </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-xl">
                        {currentPlan === 'ELITE' ? '👑' : currentPlan === 'PRO' ? '⭐' : '🌱'}
                    </div>
                </div>

                {/* Usage stats for operators */}
                {role === 'operator' && (
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Active Tours</span>
                            <span className="font-medium text-gray-900">
                                {activeTours} / {maxTours === null ? '∞' : maxTours}
                            </span>
                        </div>
                        {maxTours !== null && (
                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className={`h-full rounded-full transition-all ${activeTours >= maxTours ? 'bg-red-500' : 'bg-indigo-500'
                                        }`}
                                    style={{ width: `${Math.min((activeTours / maxTours) * 100, 100)}%` }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Visibility tier for guides */}
                {role === 'guide' && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Visibility Tier</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${currentPlan === 'ELITE'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-600'
                                }`}>
                                {currentPlan === 'ELITE' ? 'Priority' : 'Standard'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Upgrade CTA */}
                {currentPlan !== 'ELITE' && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                        >
                            Upgrade Plan
                        </button>
                        <p className="mt-2 text-center text-xs text-gray-400">
                            <Link href="/dashboard/account/subscription" className="text-indigo-600 hover:underline">View all plans</Link>
                        </p>
                    </div>
                )}
            </div>

            {/* Upgrade Modal */}
            <PaymentRequestModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                currentPlan={currentPlan}
            />
        </>
    );
}

/**
 * Compact plan badge for headers/sidebars
 */
export function PlanBadge({ plan }: { plan: UserPlan }) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${plan === 'ELITE'
            ? 'bg-amber-100 text-amber-800'
            : plan === 'PRO'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
            {plan === 'ELITE' ? '👑' : plan === 'PRO' ? '⭐' : '🌱'}
            <span>{PLAN_CONFIG[plan].displayName}</span>
        </span>
    );
}

