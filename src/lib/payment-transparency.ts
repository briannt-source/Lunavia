/**
 * Payment Transparency Utilities
 *
 * Calculates and displays the exact money flow for both operators and guides.
 * Shows clear breakdown: what you pay → what escrow holds → what guide receives → Lunavia's fee.
 */

import { getGuidePlatformFeeRate, type UserPlan } from '@/lib/plans';

export interface PaymentBreakdown {
  /** What the operator pays into escrow */
  operatorPays: number;
  /** Lunavia's commission from operator side */
  operatorCommission: number;
  /** Commission rate applied (e.g. 0.05 = 5%) */
  operatorCommissionRate: number;
  /** What the guide receives before platform fee */
  guideGross: number;
  /** Lunavia's platform fee from guide's payout */
  guidePlatformFee: number;
  /** Platform fee rate (e.g. 0.05 = 5%) */
  guidePlatformFeeRate: number;
  /** Final amount guide takes home */
  guideNet: number;
  /** Total Lunavia revenue (operator commission + guide platform fee) */
  lunaviaRevenue: number;
  /** Currency */
  currency: string;
}

/**
 * Calculate full payment breakdown for a tour assignment.
 *
 * @param tourPayout - Total amount operator pays for the guide role
 * @param operatorCommissionRate - Operator's commission rate (from plan, e.g. 0.05)
 * @param guidePlan - Guide's current plan (determines platform fee)
 * @param isInHouse - If true, operator commission = 0% (in-house guide with verified contract)
 * @param currency - Currency code (default: VND)
 */
export function calculatePaymentBreakdown(
  tourPayout: number,
  operatorCommissionRate: number,
  guidePlan: UserPlan = 'GUIDE_FREE',
  isInHouse: boolean = false,
  currency: string = 'VND',
): PaymentBreakdown {
  // In-house guides with verified contract: 0% commission on both sides
  const effectiveOperatorRate = isInHouse ? 0 : operatorCommissionRate;
  const effectiveGuideRate = isInHouse ? 0 : getGuidePlatformFeeRate(guidePlan);

  const operatorCommission = Math.round(tourPayout * effectiveOperatorRate);
  const guideGross = tourPayout; // Guide gets full payout from escrow
  const guidePlatformFee = Math.round(guideGross * effectiveGuideRate);
  const guideNet = guideGross - guidePlatformFee;

  return {
    operatorPays: tourPayout + operatorCommission, // Payout + commission
    operatorCommission,
    operatorCommissionRate: effectiveOperatorRate,
    guideGross,
    guidePlatformFee,
    guidePlatformFeeRate: effectiveGuideRate,
    guideNet,
    lunaviaRevenue: operatorCommission + guidePlatformFee,
    currency,
  };
}

/**
 * Format VND amount for display.
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format amount for any currency.
 */
export function formatCurrency(amount: number, currency: string = 'VND'): string {
  const config: Record<string, { locale: string; currency: string }> = {
    VND: { locale: 'vi-VN', currency: 'VND' },
    USD: { locale: 'en-US', currency: 'USD' },
    THB: { locale: 'th-TH', currency: 'THB' },
  };

  const c = config[currency] || config.VND;
  return new Intl.NumberFormat(c.locale, {
    style: 'currency',
    currency: c.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display.
 */
export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(rate % 0.01 === 0 ? 0 : 1)}%`;
}
