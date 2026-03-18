// ══════════════════════════════════════════════════════════════════════
// Platform Revenue Ledger — Lunavia's Own Revenue
// ══════════════════════════════════════════════════════════════════════
//
// This is PLATFORM MONEY (revenue). Not client escrow.
//
// RULES:
// - NEVER update or delete a PlatformRevenueLedger entry
// - All revenue recording is append-only
// - Revenue = SUM(CREDIT) - SUM(DEBIT)
// - Escrow money MUST NOT appear here
// ══════════════════════════════════════════════════════════════════════

import { PrismaClient, LedgerDirection, RevenueLedgerType } from '@prisma/client';

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

// ============================================
// REVENUE RECORDING (append-only)
// ============================================

interface RevenueParams {
    type: RevenueLedgerType;
    amount: number;
    referenceId?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Record revenue credit (income for Lunavia).
 * Types: SUBSCRIPTION_FEE, COMMISSION_FEE, BOOST_FEE, PENALTY_FEE
 */
export async function recordRevenue(tx: TxClient, params: RevenueParams) {
    if (params.amount <= 0) {
        throw new Error('REVENUE_INVALID_AMOUNT');
    }

    return (tx as any).platformRevenueLedger.create({
        data: {
            direction: LedgerDirection.CREDIT,
            type: params.type,
            amount: params.amount,
            referenceId: params.referenceId || null,
            metadata: params.metadata || null,
        },
    });
}

/**
 * Record a revenue adjustment (debit — e.g. refund to platform).
 */
export async function recordAdjustment(tx: TxClient, params: RevenueParams) {
    if (params.amount <= 0) {
        throw new Error('REVENUE_INVALID_AMOUNT');
    }

    return (tx as any).platformRevenueLedger.create({
        data: {
            direction: LedgerDirection.DEBIT,
            type: params.type,
            amount: params.amount,
            referenceId: params.referenceId || null,
            metadata: params.metadata || null,
        },
    });
}

// ============================================
// REVENUE QUERIES
// ============================================

interface RevenueSummary {
    totalRevenue: number;
    byType: Record<string, number>;
}

/**
 * Get revenue summary, optionally filtered by date range.
 */
export async function getRevenueSummary(
    dateFrom?: Date,
    dateTo?: Date,
): Promise<RevenueSummary> {
    const { prisma } = await import('@/lib/prisma');

    const where: any = {};
    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = dateFrom;
        if (dateTo) where.createdAt.lte = dateTo;
    }

    const entries = await prisma.platformRevenueLedger.groupBy({
        by: ['type', 'direction'],
        where,
        _sum: { amount: true },
    });

    const byType: Record<string, number> = {};
    let totalRevenue = 0;

    for (const entry of entries) {
        const amount = entry._sum.amount || 0;
        const signed = entry.direction === LedgerDirection.CREDIT ? amount : -amount;

        byType[entry.type] = (byType[entry.type] || 0) + signed;
        totalRevenue += signed;
    }

    return { totalRevenue, byType };
}

/**
 * Get total subscriptions revenue.
 */
export async function getSubscriptionRevenue(dateFrom?: Date, dateTo?: Date): Promise<number> {
    const summary = await getRevenueSummary(dateFrom, dateTo);
    return summary.byType[RevenueLedgerType.SUBSCRIPTION_FEE] || 0;
}

/**
 * Get total commission revenue.
 */
export async function getCommissionRevenue(dateFrom?: Date, dateTo?: Date): Promise<number> {
    const summary = await getRevenueSummary(dateFrom, dateTo);
    return summary.byType[RevenueLedgerType.COMMISSION_FEE] || 0;
}

export { RevenueLedgerType, LedgerDirection } from '@prisma/client';
