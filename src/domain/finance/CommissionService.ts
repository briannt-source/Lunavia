// ══════════════════════════════════════════════════════════════════════
// Commission Service — Tax-safe platform commission calculation
// ══════════════════════════════════════════════════════════════════════

import { prisma } from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';
import type { UserPlan } from '@/lib/plans';
import { shouldApplyCommission as systemModeShouldApplyCommission } from '@/domain/system-mode/system-mode';
import { recordRevenue, RevenueLedgerType } from '@/lib/revenue-ledger';

// ── Default Commission Rates ─────────────────────────────────────────
// Operations plans have 0% commission (no escrow).
// Enterprise rate is negotiated — defaults to ELITE rate as fallback.
const DEFAULT_COMMISSION_RATES: Record<string, number> = {
    FREE: 0.05,          // 5%  — Marketplace
    PRO: 0.03,           // 3%  — Marketplace
    ELITE: 0.015,        // 1.5% — Marketplace
    OPS_STARTER: 0,      // 0%  — Operations (no escrow)
    OPS_BUSINESS: 0,     // 0%  — Operations (no escrow)
    ENTERPRISE: 0.015,   // 1.5% — Default fallback, actual rate negotiated
};

const VAT_RATE = 0.10; // 10% VAT on commission only
const DEFAULT_CHARGEBACK_FEE_VND = 200_000; // 200,000 VND flat

export interface CommissionBreakdown {
    grossTourAmount: number;
    commissionRate: number;
    platformCommission: number;
    vatOnCommission: number;       // Platform's tax obligation (NOT deducted from guide)
    totalPlatformFee: number;      // Amount deducted from guide = commission only
    platformTaxObligation: number; // VAT the platform must remit to tax authority
    netGuidePayout: number;        // gross - commission (guide does NOT pay VAT)
    chargebackFee: number | null;
}

/**
 * Calculate commission breakdown for a tour payout.
 *
 * Revenue = Commission only.
 * VAT applied only on commission.
 * Escrow money is NOT counted as revenue.
 */
export function calculateCommission(
    grossTourAmount: number,
    plan: UserPlan | string,
): CommissionBreakdown {
    const rate = DEFAULT_COMMISSION_RATES[plan] ?? DEFAULT_COMMISSION_RATES.FREE;
    const platformCommission = Math.round(grossTourAmount * rate);
    const vatOnCommission = Math.round(platformCommission * VAT_RATE);
    // Guide pays only the commission. VAT is the platform's tax obligation.
    const totalPlatformFee = platformCommission;
    const netGuidePayout = grossTourAmount - platformCommission;

    return {
        grossTourAmount,
        commissionRate: rate,
        platformCommission,
        vatOnCommission,
        totalPlatformFee,
        platformTaxObligation: vatOnCommission,
        netGuidePayout,
        chargebackFee: null,
    };
}

/**
 * Calculate commission using FeePolicy overrides from DB.
 * Falls back to default rates if no active policy matches.
 */
export async function calculateCommissionWithPolicy(
    grossTourAmount: number,
    plan: UserPlan | string,
): Promise<CommissionBreakdown> {
    const now = new Date();

    // Check for active FeePolicy override
    const policy = await prisma.feePolicy.findFirst({
        where: {
            type: 'PLATFORM_COMMISSION',
            enabled: true,
            validFrom: { lte: now },
            AND: [
                {
                    OR: [
                        { validUntil: null },
                        { validUntil: { gte: now } },
                    ],
                },
                {
                    OR: [
                        { planType: plan },
                        { planType: null },
                    ],
                },
            ],
        },
        orderBy: [
            { planType: 'desc' }, // Plan-specific policies first
            { validFrom: 'desc' },
        ],
    });

    const rate = policy?.ratePercent ?? DEFAULT_COMMISSION_RATES[plan] ?? DEFAULT_COMMISSION_RATES.FREE;
    const platformCommission = Math.round(grossTourAmount * rate);
    const vatOnCommission = Math.round(platformCommission * VAT_RATE);
    const totalPlatformFee = platformCommission;
    const netGuidePayout = grossTourAmount - platformCommission;

    return {
        grossTourAmount,
        commissionRate: rate,
        platformCommission,
        vatOnCommission,
        totalPlatformFee,
        platformTaxObligation: vatOnCommission,
        netGuidePayout,
        chargebackFee: null,
    };
}

/**
 * Check if commission is currently enabled.
 * Respects COMMISSION_ENABLED and COMMISSION_PROMO_END_DATE SystemConfig.
 */
export async function isCommissionEnabled(): Promise<boolean> {
    const config = await prisma.systemConfig.findFirst({
        where: { key: 'COMMISSION_ENABLED' },
    });

    if (!config) return true; // Default: enabled

    if (config.value === 'false') {
        // Check if promo period has ended — if so, commission should be enabled
        // Note: actual config mutation should be done by admin/cron, not here
        const promoEnd = await prisma.systemConfig.findFirst({
            where: { key: 'COMMISSION_PROMO_END_DATE' },
        });

        if (promoEnd?.value) {
            const endDate = new Date(promoEnd.value);
            if (new Date() > endDate) {
                // Promo expired — commission should be enabled
                // Log for visibility but do NOT mutate config in a read path
                console.info('[CommissionService] Promo period expired, commission should be enabled. Run admin sync.');
                return true;
            }
        }
        return false;
    }

    return true;
}

/**
 * Get the chargeback handling fee.
 * Only applied if operator is at fault.
 */
export async function getChargebackFee(): Promise<number> {
    const config = await prisma.systemConfig.findFirst({
        where: { key: 'CHARGEBACK_FEE_VND' },
    });
    return config ? parseInt(config.value, 10) : DEFAULT_CHARGEBACK_FEE_VND;
}

/**
 * Format commission breakdown for UI display.
 */
export function formatCommissionBreakdown(breakdown: CommissionBreakdown): string {
    const fmt = (n: number) => n.toLocaleString('vi-VN');
    return [
        `Guide Gross Pay: ${fmt(breakdown.grossTourAmount)} VND`,
        `Platform Commission (${(breakdown.commissionRate * 100).toFixed(1)}%): ${fmt(breakdown.platformCommission)} VND`,
        `VAT (10% on commission): ${fmt(breakdown.vatOnCommission)} VND`,
        `Guide Net: ${fmt(breakdown.netGuidePayout)} VND`,
    ].join('\n');
}

// ── SystemMode-Aware Commission Check ────────────────────────────────

/**
 * Full commission guard: checks operator's SystemMode layers + assignment type.
 *
 * Returns zero-commission breakdown when:
 * - Assignment is INHOUSE (internal guide)
 * - Operator lacks COMMISSION_ENABLED layer
 * - Commission is globally disabled via SystemConfig
 *
 * Otherwise delegates to calculateCommissionWithPolicy().
 */
export async function calculateCommissionForOperator(
    grossTourAmount: number,
    plan: UserPlan | string,
    operatorId: string,
    guideMode: string | null | undefined,
): Promise<CommissionBreakdown> {
    // Check SystemMode layer + assignment type
    const shouldApply = await systemModeShouldApplyCommission(operatorId, guideMode);
    if (!shouldApply) {
        return {
            grossTourAmount,
            commissionRate: 0,
            platformCommission: 0,
            vatOnCommission: 0,
            totalPlatformFee: 0,
            platformTaxObligation: 0,
            netGuidePayout: grossTourAmount,
            chargebackFee: null,
        };
    }

    // Check global commission toggle
    const globalEnabled = await isCommissionEnabled();
    if (!globalEnabled) {
        return {
            grossTourAmount,
            commissionRate: 0,
            platformCommission: 0,
            vatOnCommission: 0,
            totalPlatformFee: 0,
            platformTaxObligation: 0,
            netGuidePayout: grossTourAmount,
            chargebackFee: null,
        };
    }

    return calculateCommissionWithPolicy(grossTourAmount, plan);
}

// ── Persist Commission Record + Revenue Ledger ──────────────────────

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

/**
 * Persist a commission record, credit the revenue ledger, and generate an invoice.
 * Must be called inside a Prisma $transaction.
 *
 * Flow:
 * 1. Create CommissionRecord with full VAT breakdown
 * 2. Credit PlatformRevenueLedger with COMMISSION_FEE (net revenue = commission - VAT)
 * 3. Generate Invoice for the commission
 */
export async function persistCommission(
    tx: TxClient,
    tourId: string,
    operatorId: string,
    guideId: string | null,
    breakdown: CommissionBreakdown,
) {
    if (breakdown.platformCommission <= 0) return null;

    // 1. CommissionRecord — full VAT breakdown
    const record = await (tx as any).commissionRecord.create({
        data: {
            tourId,
            operatorId,
            guideId,
            grossAmount: breakdown.grossTourAmount,
            commissionRate: breakdown.commissionRate,
            commissionAmount: breakdown.platformCommission,
            vatRate: VAT_RATE,
            vatAmount: breakdown.vatOnCommission,
            netRevenue: breakdown.platformCommission - breakdown.vatOnCommission,
            netGuidePayout: breakdown.netGuidePayout,
            chargebackFee: breakdown.chargebackFee,
        },
    });

    // 2. Credit PlatformRevenueLedger — only platform's net revenue
    await recordRevenue(tx, {
        type: RevenueLedgerType.COMMISSION_FEE,
        amount: breakdown.platformCommission,
        referenceId: tourId,
        metadata: {
            commissionRecordId: record.id,
            vatAmount: breakdown.vatOnCommission,
            commissionRate: breakdown.commissionRate,
        },
    });

    // 3. Generate Invoice
    const invoiceNumber = `INV-COM-${crypto.randomUUID().slice(0, 12).toUpperCase()}`;
    await (tx as any).invoice.create({
        data: {
            invoiceNumber,
            userId: operatorId,
            type: 'COMMISSION',
            grossAmount: breakdown.platformCommission,
            vatRate: VAT_RATE,
            vatAmount: breakdown.vatOnCommission,
            netAmount: breakdown.platformCommission - breakdown.vatOnCommission,
            currency: 'VND',
            status: 'ISSUED',
            metadata: { tourId, commissionRecordId: record.id },
        },
    });

    return record;
}
