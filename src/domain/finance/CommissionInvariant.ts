/**
 * Commission Transparency Invariant
 *
 * Enforces:
 *   1. Commission rate never exceeds configured cap (default 15%)
 *   2. All required transparency fields are present
 *   3. Net payout = gross - commission (no rounding drift)
 *
 * Constitution v2: Operators must always see gross, commission %, net, and ledger ref.
 */

// Maximum commission rate cap — Constitution v2 governed
const MAX_COMMISSION_RATE = 0.15; // 15%

export interface CommissionInvariantInput {
    grossAmount: number;
    commissionRate: number;
    commissionAmount: number;
    netPayout: number;
    ledgerRefId: string;
}

/**
 * Assert commission transparency invariants.
 * Throws COMMISSION_INVARIANT_VIOLATION if any rule is broken.
 */
export function assertCommissionTransparency(input: CommissionInvariantInput): void {
    const { grossAmount, commissionRate, commissionAmount, netPayout, ledgerRefId } = input;

    // 1. Commission rate must not exceed cap
    if (commissionRate > MAX_COMMISSION_RATE) {
        throw new Error(
            `COMMISSION_INVARIANT_VIOLATION: Commission rate ${(commissionRate * 100).toFixed(1)}% ` +
            `exceeds maximum cap of ${(MAX_COMMISSION_RATE * 100).toFixed(1)}%.`
        );
    }

    // 2. Commission rate must be non-negative
    if (commissionRate < 0) {
        throw new Error(
            `COMMISSION_INVARIANT_VIOLATION: Commission rate cannot be negative (${commissionRate}).`
        );
    }

    // 3. Net payout must equal gross minus commission (within floating-point tolerance)
    const expectedNet = grossAmount - commissionAmount;
    const drift = Math.abs(netPayout - expectedNet);
    if (drift > 0.01) {
        throw new Error(
            `COMMISSION_INVARIANT_VIOLATION: Net payout (${netPayout}) does not match ` +
            `grossAmount (${grossAmount}) - commissionAmount (${commissionAmount}) = ${expectedNet}. ` +
            `Drift: ${drift.toFixed(2)}.`
        );
    }

    // 4. All amounts must be non-negative
    if (grossAmount < 0 || commissionAmount < 0 || netPayout < 0) {
        throw new Error(
            `COMMISSION_INVARIANT_VIOLATION: All amounts must be non-negative. ` +
            `gross=${grossAmount}, commission=${commissionAmount}, net=${netPayout}.`
        );
    }

    // 5. Ledger reference must be present
    if (!ledgerRefId || ledgerRefId.trim().length === 0) {
        throw new Error(
            `COMMISSION_INVARIANT_VIOLATION: Ledger reference ID is required for transparency.`
        );
    }
}

/**
 * Get the maximum allowed commission rate.
 * Can be extended to read from SystemConfig for per-operator overrides.
 */
export function getMaxCommissionRate(): number {
    return MAX_COMMISSION_RATE;
}
