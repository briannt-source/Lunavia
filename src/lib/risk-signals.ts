/**
 * Client-safe risk signal computation.
 * 
 * These are DISPLAY-LEVEL functions — pure computation, no database access.
 * They can be safely imported in 'use client' components.
 *
 * ⚠️  DO NOT import from '@/domain/risk/RiskEngine' here.
 *     RiskEngine imports Prisma which cannot run in the browser.
 */

import type { TrustEvent } from '@prisma/client';

export type DisplayRiskLevel = 'STABLE' | 'LATE_RISK' | 'PAYMENT_RISK' | 'HIGH_NOSHOW' | 'OPERATOR_DISPUTE_HEAVY' | 'OPERATOR_NOSHOW_HEAVY';
export type RiskLevel = DisplayRiskLevel;

export interface RiskSignalResult {
    level: DisplayRiskLevel;
    color: string;
    message: string;
    score: number;
}

/**
 * Compute display risk flags for users based on recent trust events.
 * For UI display only — soft alerts for operational awareness.
 */
export function calculateRiskSignal(
    trustEvents: TrustEvent[],
    days: number = 30
): RiskSignalResult {
    const thresholdDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentEvents = trustEvents.filter(e => new Date(e.createdAt) > thresholdDate);

    const noShowCount = recentEvents.filter(e => e.type === 'NO_SHOW' || e.type === 'LATE_CANCELLATION').length;
    const lateReturnCount = recentEvents.filter(e => e.type === 'LATE_ARRIVAL').length;
    const disputeCount = recentEvents.filter(e => e.type === 'DISPUTE_FILED').length;

    if (noShowCount >= 2) {
        return { level: 'HIGH_NOSHOW', color: 'text-red-600 border-red-200 bg-red-50', message: 'High No-Show Risk: Multiple absences detected recently.', score: 100 };
    }
    if (lateReturnCount >= 2) {
        return { level: 'LATE_RISK', color: 'text-orange-600 border-orange-200 bg-orange-50', message: 'Late Completion Risk: Frequent delays in tour returns.', score: 60 };
    }
    if (disputeCount >= 2) {
        return { level: 'PAYMENT_RISK', color: 'text-yellow-600 border-yellow-200 bg-yellow-50', message: 'Payment Risk: Involved in multiple payment disputes.', score: 40 };
    }

    return { level: 'STABLE', color: 'text-green-600 border-green-200 bg-green-50', message: 'Stable: Reliable performance history.', score: 0 };
}

/**
 * Calculate risk signals for an Operator based on their tour history.
 */
export function calculateOperatorRiskSignal(stats: {
    totalTours: number;
    noShowCount: number;
    lateReturnCount: number;
    disputeCount: number;
}): RiskSignalResult {
    if (stats.totalTours === 0) {
        return { level: 'STABLE', color: 'text-gray-600 border-gray-200 bg-gray-50', message: 'No history yet.', score: 0 };
    }

    const noShowRate = stats.noShowCount / stats.totalTours;
    const disputeRate = stats.disputeCount / stats.totalTours;

    if (noShowRate > 0.1 && stats.totalTours >= 5) {
        return { level: 'OPERATOR_NOSHOW_HEAVY', color: 'text-red-600 border-red-200 bg-red-50', message: `Structural No-Show Risk: ${(noShowRate * 100).toFixed(1)}% of tours failed due to no-shows.`, score: 90 };
    }
    if (disputeRate > 0.2 && stats.totalTours >= 5) {
        return { level: 'OPERATOR_DISPUTE_HEAVY', color: 'text-orange-600 border-orange-200 bg-orange-50', message: `Dispute Friction: ${(disputeRate * 100).toFixed(1)}% of tours involve payment disputes.`, score: 70 };
    }

    return { level: 'STABLE', color: 'text-green-600 border-green-200 bg-green-50', message: 'Stable: Healthy operational metrics.', score: 0 };
}
