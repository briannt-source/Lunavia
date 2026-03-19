// ══════════════════════════════════════════════════════════════════════
// Risk Engine — SINGLE SOURCE OF TRUTH for risk computation
//
// All risk scoring, signal logging, and detection rules consolidated here.
// lib/risk.ts and lib/risk-signals.ts re-export from this module.
// ══════════════════════════════════════════════════════════════════════

import { prisma } from '@/lib/prisma';
import type { TrustEvent } from '@prisma/client';

// ── Canonical Types ─────────────────────────────────────────────────

export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED';
export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskType =
    | 'WITHDRAW_FREQUENCY'
    | 'LOGIN_BRUTE_FORCE'
    | 'ADMIN_MASS_APPROVAL'
    | 'RAPID_TOUR_CREATION'
    | 'SUSPICIOUS_AMOUNT'
    | 'ANOMALY';

// ── Display-level risk (for UI components) ──────────────────────────

export type DisplayRiskLevel = 'STABLE' | 'LATE_RISK' | 'PAYMENT_RISK' | 'HIGH_NOSHOW' | 'OPERATOR_DISPUTE_HEAVY' | 'OPERATOR_NOSHOW_HEAVY';

export interface RiskSignalResult {
    level: DisplayRiskLevel;
    color: string;
    message: string;
    score: number;
}

// ── Score Components ────────────────────────────────────────────────

export interface RiskComponents {
    incidentWeight: number;
    financialDisputeWeight: number;
    operationalPatternWeight: number;
    fraudSignalWeight: number;
    recoveryWeight: number;
}

// ── Weights ─────────────────────────────────────────────────────────

const INCIDENT_WEIGHT_PER = 8;
const DISPUTE_WEIGHT_PER = 10;
const LATE_CANCEL_WEIGHT = 5;
const NOSHOW_WEIGHT = 12;
const FRAUD_SIGNAL_WEIGHT = { LOW: 2, MEDIUM: 5, HIGH: 15, CRITICAL: 25 } as const;
const RECOVERY_PER_CLEAN_MONTH = 3;

// ══════════════════════════════════════════════════════════════════════
// CORE RISK COMPUTATION
// ══════════════════════════════════════════════════════════════════════

/**
 * Compute raw risk score from components. Clamped to 0–100.
 */
export function computeRiskScore(components: RiskComponents): number {
    const raw = components.incidentWeight
        + components.financialDisputeWeight
        + components.operationalPatternWeight
        + components.fraudSignalWeight
        - components.recoveryWeight;
    return Math.max(0, Math.min(100, raw));
}

/**
 * Map risk score to risk level.
 *   GREEN  = 0–30 | YELLOW = 31–60 | RED = 61+
 */
export function getRiskLevel(score: number): RiskLevel {
    if (score >= 61) return 'RED';
    if (score >= 31) return 'YELLOW';
    return 'GREEN';
}

/**
 * Get the penalty multiplier for trust operations based on risk level.
 */
export function getRiskPenaltyMultiplier(riskLevel: RiskLevel): number {
    if (riskLevel === 'RED') return 2.0;
    if (riskLevel === 'YELLOW') return 1.5;
    return 1.0;
}

// ══════════════════════════════════════════════════════════════════════
// FULL RISK EVALUATION (DB-backed)
// ══════════════════════════════════════════════════════════════════════

/**
 * Evaluate full risk profile for an operator from DB.
 * Aggregates incidents, disputes, cancellations, and risk signals.
 */
export async function evaluateOperatorRisk(userId: string): Promise<{
    score: number;
    level: RiskLevel;
    components: RiskComponents;
}> {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const [incidentCount, disputeCount, trustEvents, riskSignals, cleanMonths] = await Promise.all([
        prisma.incident.count({
            where: {
                request: { operatorId: userId },
                createdAt: { gte: ninetyDaysAgo },
            },
        }),
        prisma.conflict.count({
            where: {
                OR: [{ filedById: userId }, { receivedById: userId }],
                createdAt: { gte: ninetyDaysAgo },
            },
        }),
        prisma.trustRecord.findMany({
            where: {
                userId,
                createdAt: { gte: ninetyDaysAgo },
                type: { in: ['LATE_CANCELLATION', 'NO_SHOW', 'MANUAL_ADJUSTMENT'] },
            },
            select: { type: true, delta: true },
        }),
        (prisma as any).riskSignal.findMany({
            where: {
                userId,
                createdAt: { gte: ninetyDaysAgo },
            },
            select: { severity: true },
        }),
        computeCleanMonths(userId),
    ]);

    const lateCancels = trustEvents.filter(e => e.type === 'LATE_CANCELLATION' || (e.type === 'MANUAL_ADJUSTMENT' && e.delta < -5)).length;
    const noShows = trustEvents.filter(e => e.type === 'NO_SHOW').length;
    const operationalPatternWeight = (lateCancels * LATE_CANCEL_WEIGHT) + (noShows * NOSHOW_WEIGHT);

    const fraudSignalWeight = riskSignals.reduce((sum: number, s: { severity: string }) => {
        const weight = FRAUD_SIGNAL_WEIGHT[s.severity as keyof typeof FRAUD_SIGNAL_WEIGHT] || 0;
        return sum + weight;
    }, 0);

    const components: RiskComponents = {
        incidentWeight: incidentCount * INCIDENT_WEIGHT_PER,
        financialDisputeWeight: disputeCount * DISPUTE_WEIGHT_PER,
        operationalPatternWeight,
        fraudSignalWeight,
        recoveryWeight: cleanMonths * RECOVERY_PER_CLEAN_MONTH,
    };

    const score = computeRiskScore(components);
    return { score, level: getRiskLevel(score), components };
}

async function computeCleanMonths(userId: string): Promise<number> {
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const negativeEvents = await prisma.trustRecord.findMany({
        where: {
            userId,
            delta: { lt: 0 },
            createdAt: { gte: sixMonthsAgo },
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
    });

    if (negativeEvents.length === 0) return 6;
    const lastNegative = negativeEvents[0].createdAt;
    const daysSince = Math.floor((Date.now() - lastNegative.getTime()) / (24 * 60 * 60 * 1000));
    return Math.floor(daysSince / 30);
}

/**
 * Persist updated risk score and compliance level to the user record.
 */
export async function persistRiskEvaluation(
    userId: string,
    riskScore: number,
    complianceLevel: string
): Promise<void> {
    await (prisma as any).user.update({
        where: { id: userId },
        data: { riskScore, complianceLevel },
    });
}

// ══════════════════════════════════════════════════════════════════════
// SIGNAL LOGGING (absorbed from lib/risk.ts)
// ══════════════════════════════════════════════════════════════════════

/**
 * Log a risk signal. Best-effort, never fails the main operation.
 */
export async function logRiskSignal(params: {
    userId?: string;
    type: RiskType;
    severity: RiskSeverity;
    metadata?: Record<string, unknown>;
}): Promise<void> {
    try {
        await (prisma as any).riskSignal.create({
            data: {
                userId: params.userId || null,
                type: params.type,
                severity: params.severity,
                metadata: params.metadata || null,
            },
        });
    } catch (error) {
        console.error('Risk signal logging failed:', error);
    }
}

// ══════════════════════════════════════════════════════════════════════
// DETECTION RULES (absorbed from lib/risk.ts)
// ══════════════════════════════════════════════════════════════════════

/** Check withdraw frequency: 5+ withdrawals in 1 hour → HIGH */
export async function checkWithdrawFrequency(userId: string): Promise<void> {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const count = await prisma.withdrawalRequest.count({
            where: { operatorId: userId, createdAt: { gte: oneHourAgo } },
        });
        if (count >= 5) {
            await logRiskSignal({ userId, type: 'WITHDRAW_FREQUENCY', severity: 'HIGH', metadata: { count, windowMinutes: 60 } });
        }
    } catch { /* best-effort */ }
}

/** Check admin mass approvals: 20+ approvals in 5 minutes → MEDIUM */
export async function checkAdminMassApproval(adminId: string): Promise<void> {
    try {
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        const count = await prisma.auditLog.count({
            where: {
                userId: adminId,
                action: { in: ['TOPUP_APPROVED', 'WITHDRAWAL_APPROVED', 'ESCROW_RELEASED', 'VERIFICATION_APPROVED'] },
                createdAt: { gte: fiveMinAgo },
            },
        });
        if (count >= 20) {
            await logRiskSignal({ userId: adminId, type: 'ADMIN_MASS_APPROVAL', severity: 'MEDIUM', metadata: { count, windowMinutes: 5 } });
        }
    } catch { /* best-effort */ }
}

/** Check rapid tour creation: 10+ tours in 10 minutes → MEDIUM */
export async function checkRapidTourCreation(operatorId: string): Promise<void> {
    try {
        const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
        const count = await prisma.tour.count({
            where: { operatorId, createdAt: { gte: tenMinAgo } },
        });
        if (count >= 10) {
            await logRiskSignal({ userId: operatorId, type: 'RAPID_TOUR_CREATION', severity: 'MEDIUM', metadata: { count, windowMinutes: 10 } });
        }
    } catch { /* best-effort */ }
}

/** Check for suspiciously large amounts */
export async function checkSuspiciousAmount(userId: string, amount: number, action: string): Promise<void> {
    try {
        if (amount > 100_000_000) {
            await logRiskSignal({ userId, type: 'SUSPICIOUS_AMOUNT', severity: 'HIGH', metadata: { amount, action } });
        }
    } catch { /* best-effort */ }
}

// ══════════════════════════════════════════════════════════════════════
// DISPLAY-LEVEL RISK SIGNALS (absorbed from lib/risk-signals.ts)
// ══════════════════════════════════════════════════════════════════════

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
