// ══════════════════════════════════════════════════════════════════════
// Guide-to-Tour Matching Score
//
// PURPOSE: Scores how well a GUIDE matches a specific TOUR.
// Used by operators to evaluate guide applications.
//
// NOT to be confused with MatchingWeight.ts which scores OPERATORS
// for marketplace ranking (how guides see operators).
// ══════════════════════════════════════════════════════════════════════

import type { ServiceRequest, User, TrustEvent } from '@prisma/client';

export interface MatchingScoreBreakdown {
    trust: number;
    role: number;
    language: number;
    province: number;
    completion: number;
    penalty: number;
    recency: number;
}

export interface MatchingResult {
    score: number;
    breakdown: MatchingScoreBreakdown;
    recommendation: string;
}

/**
 * lib/matching-score.ts
 * 
 * Rule-based scoring for guide-to-tour matching.
 * "Explainable AI" assisted logic for operators.
 */
export function calculateMatchingScore(
    guide: User & { trustEvents?: TrustEvent[] },
    tour: ServiceRequest,
    trustScore: number,
    completedTourCount: number
): MatchingResult {
    const breakdown: MatchingScoreBreakdown = {
        trust: 0,
        role: 0,
        language: 0,
        province: 0,
        completion: 0,
        penalty: 0,
        recency: 0,
    };

    // 1. Trust Score (0-30 points)
    breakdown.trust = Math.round((trustScore / 100) * 30);

    // 2. Role Fit (+10 points)
    // Using guide.plan (cast to any for safety with intersected types)
    const plan = (guide as any).plan;
    if (plan === 'PRO' || plan === 'ELITE') {
        breakdown.role = 10;
    } else if (plan === 'INTERN') {
        breakdown.role = 5;
    }

    // 3. Language Match (+15 points)
    if (tour.language && guide.roleMetadata?.toLowerCase().includes(tour.language.toLowerCase())) {
        breakdown.language = 15;
    }

    // 4. Province Match (+10 points)
    if (tour.province && guide.roleMetadata?.includes(tour.province)) {
        breakdown.province = 10;
    }

    // 5. Completion Rate (+15 points)
    if (completedTourCount > 50) breakdown.completion = 15;
    else if (completedTourCount > 20) breakdown.completion = 10;
    else if (completedTourCount > 5) breakdown.completion = 5;

    // 6. Penalty (-5 to -30 points)
    // Check for negative trust events in analyzed period
    const thresholdDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const penaltyEvents = guide.trustEvents?.filter(e =>
        new Date(e.createdAt) > thresholdDate && e.changeValue < 0
    ) || [];

    breakdown.penalty = penaltyEvents.length * -10;

    // 7. Recency (+5 points)
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const updatedAt = (guide as any).updatedAt || (guide as any).createdAt;
    if (new Date(updatedAt) > last30Days) {
        breakdown.recency = 5;
    }

    const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);

    let recommendation = '';
    if (totalScore > 75) recommendation = 'Highly Recommended: Perfect fit with strong track record.';
    else if (totalScore > 50) recommendation = 'Good Match: Reliable guide with relevant experience.';
    else if (totalScore > 25) recommendation = 'Qualified: Meets basic requirements.';
    else recommendation = 'Lower Match: May require closer supervision or lacks specific experience.';

    return {
        score: Math.max(0, totalScore),
        breakdown,
        recommendation
    };
}
