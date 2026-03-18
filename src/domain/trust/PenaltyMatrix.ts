// ══════════════════════════════════════════════════════════════════════
// Penalty Matrix — Defines trust penalties and recovery rules
// ══════════════════════════════════════════════════════════════════════

// ── Penalty Definitions ──────────────────────────────────────────────

export type PenaltyCategory = 'OPERATIONAL' | 'FINANCIAL' | 'FRAUD';

export interface PenaltyRule {
    category: PenaltyCategory;
    trigger: string;
    basePoints: number;
    description: string;
}

export const PENALTY_RULES: PenaltyRule[] = [
    // Operational
    { category: 'OPERATIONAL', trigger: 'LATE_CANCEL_24H', basePoints: 10, description: 'Late cancellation (<24h before start)' },
    { category: 'OPERATIONAL', trigger: 'LATE_CANCEL_6H', basePoints: 20, description: 'Last-minute cancellation (<6h before start)' },
    { category: 'OPERATIONAL', trigger: 'NO_SHOW', basePoints: 25, description: 'Operator no-show' },
    { category: 'OPERATIONAL', trigger: 'LATE_RETURN', basePoints: 5, description: 'Late tour return / overrun' },
    { category: 'OPERATIONAL', trigger: 'GUIDE_COMPLAINT', basePoints: 8, description: 'Valid guide complaint' },

    // Financial
    { category: 'FINANCIAL', trigger: 'PAYMENT_DISPUTE', basePoints: 15, description: 'Payment dispute filed' },
    { category: 'FINANCIAL', trigger: 'ESCROW_FAILED', basePoints: 10, description: 'Failed escrow / insufficient funds' },
    { category: 'FINANCIAL', trigger: 'LATE_PAYMENT', basePoints: 5, description: 'Late guide payment' },

    // Fraud
    { category: 'FRAUD', trigger: 'FAKE_DOCUMENTS', basePoints: 50, description: 'Fake documentation submitted' },
    { category: 'FRAUD', trigger: 'IDENTITY_MISMATCH', basePoints: 30, description: 'Identity verification mismatch' },
    { category: 'FRAUD', trigger: 'TRUST_FARMING', basePoints: 20, description: 'Detected trust score farming pattern' },
];

/**
 * Get the penalty points for a given trigger.
 * Returns 0 if trigger is not recognized.
 */
export function getPenaltyPoints(trigger: string): number {
    const rule = PENALTY_RULES.find(r => r.trigger === trigger);
    return rule?.basePoints ?? 0;
}

/**
 * Get the penalty category for a given trigger.
 */
export function getPenaltyCategory(trigger: string): PenaltyCategory | null {
    const rule = PENALTY_RULES.find(r => r.trigger === trigger);
    return rule?.category ?? null;
}

/**
 * Apply risk multiplier to penalty points.
 *   GREEN  = 1.0x
 *   YELLOW = 1.5x
 *   RED    = 2.0x
 */
export function applyRiskMultiplier(basePoints: number, riskMultiplier: number): number {
    return Math.round(basePoints * riskMultiplier);
}

// ── Recovery Rules ───────────────────────────────────────────────────

export interface RecoveryRule {
    condition: string;
    bonusPoints: number;
    description: string;
}

export const RECOVERY_RULES: RecoveryRule[] = [
    { condition: 'CLEAN_90_DAYS', bonusPoints: 5, description: '90 consecutive clean days' },
    { condition: 'TOUR_STREAK_5', bonusPoints: 3, description: '5 successful consecutive tours' },
    { condition: 'NO_DISPUTES_60', bonusPoints: 2, description: 'No disputes in 60 days' },
];

/**
 * Calculate recovery bonus from operator stats.
 */
export function calculateRecoveryBonus(params: {
    cleanDays: number;
    consecutiveSuccessfulTours: number;
    daysSinceLastDispute: number;
}): number {
    let bonus = 0;
    if (params.cleanDays >= 90) bonus += 5;
    if (params.consecutiveSuccessfulTours >= 5) bonus += 3;
    if (params.daysSinceLastDispute >= 60) bonus += 2;
    return bonus;
}

/**
 * Calculate total operational penalty from trust events.
 */
export function calculateOperationalPenalty(events: { type: string; changeValue: number }[]): number {
    return events
        .filter(e => ['LATE_CANCELLATION', 'NO_SHOW', 'MANUAL_ADJUSTMENT'].includes(e.type) && e.changeValue < 0)
        .reduce((sum, e) => sum + Math.abs(e.changeValue), 0);
}

/**
 * Calculate total financial penalty from dispute count.
 */
export function calculateFinancialPenalty(disputeCount: number): number {
    return disputeCount * getPenaltyPoints('PAYMENT_DISPUTE');
}
