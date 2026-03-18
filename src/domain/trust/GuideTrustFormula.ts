// ══════════════════════════════════════════════════════════════════════
// Guide Trust Formula — Rating-based trust score for tour guides
//
// Guide trust differs from operator trust:
//   - No legal base or compliance (guides are individuals)
//   - Based on: completion rate, operator ratings, reliability, experience
//
// Components:
//   Base (new guide)             = 30
//   Completion Rate (max 30)     — Tours completed vs total assigned
//   Rating Score (max 25)        — Average operator rating (1-5 → 0-25)
//   Reliability (max 15)         — Punctuality, no-shows, cancellations
// ══════════════════════════════════════════════════════════════════════

const GUIDE_TRUST_MAX = 100;
const GUIDE_BASE = 30;

export interface GuideTrustComponents {
    base: number;                // 30 for all guides
    completionScore: number;     // 0–30
    ratingScore: number;         // 0–25
    reliabilityScore: number;    // 0–15
    penaltyDeduction: number;    // subtracted (cancellations, no-shows)
}

/**
 * Completion Score: how many assigned tours did the guide complete?
 * Requires min 3 tours for meaningful data.
 */
export function getGuideCompletionScore(completedTours: number, totalAssigned: number): number {
    if (totalAssigned < 3) return 15; // Neutral for new guides
    const rate = completedTours / totalAssigned;
    return Math.round(rate * 30);
}

/**
 * Rating Score: average operator rating on 1-5 scale → 0-25 points.
 * Requires min 3 ratings for meaningful data.
 */
export function getGuideRatingScore(avgRating: number | null, totalRatings: number): number {
    if (!avgRating || totalRatings < 3) return 12; // Neutral for new guides
    // Map 1-5 to 0-25: (rating - 1) / 4 * 25
    return Math.round(((avgRating - 1) / 4) * 25);
}

/**
 * Reliability Score: based on negative incidents in last 90 days.
 * Starts at 15, deducts per incident type.
 */
export function getGuideReliabilityScore(noShows: number, lateCancellations: number): number {
    const deduction = (noShows * 5) + (lateCancellations * 3);
    return Math.max(0, 15 - deduction);
}

/**
 * Compute guide trust score from all components.
 */
export function computeGuideTrustScore(components: GuideTrustComponents): number {
    const raw = components.base
        + components.completionScore
        + components.ratingScore
        + components.reliabilityScore
        - components.penaltyDeduction;

    return Math.max(0, Math.min(GUIDE_TRUST_MAX, Math.round(raw)));
}

/**
 * Build guide trust components from stats.
 */
export function buildGuideTrustComponents(params: {
    completedTours: number;
    totalAssigned: number;
    avgRating: number | null;
    totalRatings: number;
    noShows: number;
    lateCancellations: number;
    penaltyDeduction: number;
}): GuideTrustComponents {
    return {
        base: GUIDE_BASE,
        completionScore: getGuideCompletionScore(params.completedTours, params.totalAssigned),
        ratingScore: getGuideRatingScore(params.avgRating, params.totalRatings),
        reliabilityScore: getGuideReliabilityScore(params.noShows, params.lateCancellations),
        penaltyDeduction: params.penaltyDeduction,
    };
}
