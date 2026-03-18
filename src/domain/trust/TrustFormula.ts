// ══════════════════════════════════════════════════════════════════════
// Trust Formula — Component-based trust score computation
// ══════════════════════════════════════════════════════════════════════

import { getTrustMax, type OperatorCategory } from '../operator/OperatorGovernance';

export interface TrustComponents {
    legalBase: number;            // LICENSED=30, AGENCY=20, SOLE=10
    complianceScore: number;      // from compliance level (0–20)
    performanceScore: number;     // completion rate (0–25)
    financialBehavior: number;    // payment history (0–15)
    operationalPenalty: number;   // late cancellations, no-shows (subtracted)
    financialPenalty: number;     // disputes, payment issues (subtracted)
    riskPenalty: number;          // risk-based penalty multiplier (subtracted)
}

// ── Legal Base Points ────────────────────────────────────────────────
const LEGAL_BASE: Record<OperatorCategory, number> = {
    LICENSED: 30,
    TRAVEL_AGENCY: 20,
    SOLE: 10,
};

/**
 * Get legal base points for an operator category.
 */
export function getLegalBase(category: string | null | undefined): number {
    if (category && category in LEGAL_BASE) {
        return LEGAL_BASE[category as OperatorCategory];
    }
    return LEGAL_BASE.SOLE;
}

// ── Compliance Score ─────────────────────────────────────────────────
const COMPLIANCE_SCORE: Record<string, number> = {
    GOLD: 20,
    STANDARD: 10,
    PROBATION: 0,
};

export function getComplianceScore(level: string): number {
    return COMPLIANCE_SCORE[level] ?? 10;
}

// ── Performance Score ────────────────────────────────────────────────
/**
 * Performance score based on completion rate.
 * Max 25 points. Requires minimum 3 tours for meaningful data.
 */
export function getPerformanceScore(completedTours: number, totalTours: number): number {
    if (totalTours < 3) return 12; // Neutral for new operators
    const rate = completedTours / totalTours;
    return Math.round(rate * 25);
}

// ── Financial Behavior Score ─────────────────────────────────────────
/**
 * Financial behavior score based on payment history.
 * Max 15 points. Clean payment history = full points.
 */
export function getFinancialBehaviorScore(totalPayments: number, disputeCount: number): number {
    if (totalPayments === 0) return 8; // Neutral for new operators
    const cleanRate = 1 - (disputeCount / totalPayments);
    return Math.round(Math.max(0, cleanRate) * 15);
}

// ── Compute Full Trust Score ─────────────────────────────────────────
/**
 * Compute the final trust score from all components.
 *
 * RawTrust = LegalBase + ComplianceScore + PerformanceScore + FinancialBehavior
 *          - OperationalPenalty - FinancialPenalty - RiskPenalty
 *
 * FinalTrust = min(RawTrust, trustMax)
 */
export function computeTrustScore(
    components: TrustComponents,
    category: string | null | undefined
): number {
    // Cap individual penalties to prevent single-event zeroing
    const cappedOperational = Math.min(components.operationalPenalty, 30);
    const cappedFinancial = Math.min(components.financialPenalty, 30);
    const cappedRisk = Math.min(components.riskPenalty, 30);
    // Cap total penalty to prevent a single bad day from zeroing an established operator
    const totalPenalty = Math.min(cappedOperational + cappedFinancial + cappedRisk, 40);

    const raw = components.legalBase
        + components.complianceScore
        + components.performanceScore
        + components.financialBehavior
        - totalPenalty;

    const trustMax = getTrustMax(category);
    return Math.max(0, Math.min(trustMax, Math.round(raw)));
}

/**
 * Build trust components from operator stats.
 * Convenience function for common usage patterns.
 */
export function buildTrustComponents(params: {
    category: string | null | undefined;
    complianceLevel: string;
    completedTours: number;
    totalTours: number;
    totalPayments: number;
    disputeCount: number;
    operationalPenalty: number;
    financialPenalty: number;
    riskPenalty: number;
}): TrustComponents {
    return {
        legalBase: getLegalBase(params.category),
        complianceScore: getComplianceScore(params.complianceLevel),
        performanceScore: getPerformanceScore(params.completedTours, params.totalTours),
        financialBehavior: getFinancialBehaviorScore(params.totalPayments, params.disputeCount),
        operationalPenalty: params.operationalPenalty,
        financialPenalty: params.financialPenalty,
        riskPenalty: params.riskPenalty,
    };
}
