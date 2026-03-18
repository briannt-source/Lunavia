// ══════════════════════════════════════════════════════════════════════
// Matching Weight — Operator prioritization in guide marketplace
//
// PURPOSE: Scores OPERATORS for marketplace ranking.
// Used by guides to see which operators are most trustworthy/reliable.
//
// NOT to be confused with matching-score.ts which scores GUIDES
// for specific tour matching (how operators evaluate guide applications).
// ══════════════════════════════════════════════════════════════════════

/**
 * Compute matching weight for marketplace sorting.
 *
 * Weight = TrustScore × 0.4
 *        + ComplianceWeight × 0.2
 *        − RiskWeight × 0.2
 *        + PerformanceWeight × 0.2
 *
 * Licensed operators get NO artificial bonus.
 * Only structural advantages via ComplianceLevel.
 */

const COMPLIANCE_WEIGHT: Record<string, number> = {
    GOLD: 20,
    STANDARD: 10,
    PROBATION: 0,
};

export function computeMatchingWeight(params: {
    trustScore: number;
    complianceLevel: string;
    riskScore: number;
    performanceRate: number; // 0–1 (completion rate)
}): number {
    const { trustScore, complianceLevel, riskScore, performanceRate } = params;

    const complianceW = COMPLIANCE_WEIGHT[complianceLevel] ?? 10;
    const riskW = riskScore / 5; // Normalize: 0-100 → 0-20

    const weight = (trustScore * 0.4)
        + (complianceW * 0.2)
        - (riskW * 0.2)
        + (performanceRate * 100 * 0.2); // performanceRate 0-1 → 0-20

    return Math.round(weight * 100) / 100;
}

/**
 * Compare function for sorting operators by matching weight (descending).
 */
export function compareByMatchingWeight(
    a: { trustScore: number; complianceLevel: string; riskScore: number; completedTours: number; totalTours: number },
    b: { trustScore: number; complianceLevel: string; riskScore: number; completedTours: number; totalTours: number }
): number {
    const rateA = a.totalTours > 0 ? a.completedTours / a.totalTours : 0.5;
    const rateB = b.totalTours > 0 ? b.completedTours / b.totalTours : 0.5;

    const wA = computeMatchingWeight({
        trustScore: a.trustScore,
        complianceLevel: a.complianceLevel,
        riskScore: a.riskScore,
        performanceRate: rateA,
    });
    const wB = computeMatchingWeight({
        trustScore: b.trustScore,
        complianceLevel: b.complianceLevel,
        riskScore: b.riskScore,
        performanceRate: rateB,
    });

    return wB - wA; // Descending
}
