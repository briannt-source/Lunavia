/**
 * @deprecated — Use `@/domain/finance/CommissionService` for commission calculation.
 *
 * This file is retained for backward compatibility only.
 * CommissionService.calculateCommission() is the authoritative source for
 * commission rates, VAT computation, and FeePolicy DB overrides.
 *
 * formatFeeBreakdown() remains useful as a UI formatter.
 */

import { calculateCommission, type CommissionBreakdown } from '@/domain/finance/CommissionService';
import type { UserPlan } from './plans';

export interface FeeStructure {
    grossTourAmount: number;
    platformCommission: number;
    vatOnCommission: number;
    totalPlatformFee: number;
    netGuidePayout: number;
    commissionRate: number;
}

// Spec-compliant commission rates (kept for reference only)
export const COMMISSIONS: Record<string, number> = {
    FREE: 0.02,    // 2%
    PRO: 0.01,     // 1%
    ELITE: 0.005,  // 0.5%
};

/**
 * @deprecated Use CommissionService.calculateCommission() instead.
 * Delegates to CommissionService for consistency.
 */
export function calculateTourFees(grossAmount: number, plan: UserPlan): FeeStructure {
    const result: CommissionBreakdown = calculateCommission(grossAmount, plan);
    return {
        grossTourAmount: result.grossTourAmount,
        platformCommission: result.platformCommission,
        vatOnCommission: result.vatOnCommission,
        totalPlatformFee: result.totalPlatformFee,
        netGuidePayout: result.netGuidePayout,
        commissionRate: result.commissionRate,
    };
}

/**
 * Format fee breakdown for UI display (pre-contract acceptance).
 * This remains the canonical UI formatter.
 */
export function formatFeeBreakdown(fees: FeeStructure): string {
    const fmt = (n: number) => n.toLocaleString('vi-VN');
    const pct = (fees.commissionRate * 100).toFixed(1);
    return [
        `Guide Gross Pay: ${fmt(fees.grossTourAmount)} VND`,
        `Platform Commission (${pct}%): ${fmt(fees.platformCommission)} VND`,
        `VAT (10% on commission): ${fmt(fees.vatOnCommission)} VND`,
        `Guide Net: ${fmt(fees.netGuidePayout)} VND`,
    ].join('\n');
}
