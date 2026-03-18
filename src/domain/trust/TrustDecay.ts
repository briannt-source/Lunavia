// ══════════════════════════════════════════════════════════════════════
// Trust Decay — Inactivity-based trust score reduction
// ══════════════════════════════════════════════════════════════════════

const INACTIVITY_THRESHOLD_DAYS = 180; // 6 months
const DECAY_POINTS_PER_PERIOD = 3; // 3 points per period (stronger signal)
const DECAY_PERIOD_DAYS = 30;

/**
 * Compute the trust decay penalty based on last activity timestamp.
 *
 * Rules:
 *   - No decay until 6 months (180 days) of inactivity
 *   - After 6 months: -2 every 30 days
 *   - Max decay capped at 20 points (10 periods)
 *
 * @param lastActivityAt - Last activity timestamp. Null = never active (no decay applied).
 * @returns Decay penalty (always >= 0)
 */
export function computeDecayPenalty(lastActivityAt: Date | null | undefined, createdAt?: Date | null): number {
    // Use lastActivityAt, fall back to createdAt if never active
    const referenceDate = lastActivityAt || createdAt;
    if (!referenceDate) return 0; // No reference date at all — no decay

    const now = new Date();
    const inactiveDays = Math.floor((now.getTime() - referenceDate.getTime()) / (24 * 60 * 60 * 1000));

    if (inactiveDays <= INACTIVITY_THRESHOLD_DAYS) return 0;

    const decayDays = inactiveDays - INACTIVITY_THRESHOLD_DAYS;
    const periods = Math.floor(decayDays / DECAY_PERIOD_DAYS);

    // Cap at ~13 periods (40 points max decay)
    return Math.min(periods * DECAY_POINTS_PER_PERIOD, 40);
}

/**
 * Check if an operator qualifies for decay warning.
 * Warns at 150 days (30 days before decay starts).
 */
export function shouldWarnDecay(lastActivityAt: Date | null | undefined): boolean {
    if (!lastActivityAt) return false;
    const inactiveDays = Math.floor((Date.now() - lastActivityAt.getTime()) / (24 * 60 * 60 * 1000));
    return inactiveDays >= 150 && inactiveDays < INACTIVITY_THRESHOLD_DAYS;
}

/**
 * Get days until decay starts.
 * Returns null if already decaying or no activity recorded.
 */
export function daysUntilDecay(lastActivityAt: Date | null | undefined): number | null {
    if (!lastActivityAt) return null;
    const inactiveDays = Math.floor((Date.now() - lastActivityAt.getTime()) / (24 * 60 * 60 * 1000));
    if (inactiveDays >= INACTIVITY_THRESHOLD_DAYS) return 0;
    return INACTIVITY_THRESHOLD_DAYS - inactiveDays;
}
