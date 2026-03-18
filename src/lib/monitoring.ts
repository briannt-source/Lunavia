// ══════════════════════════════════════════════════════════════════════
// Monitoring Helpers — Internal-Run Safety Checks
//
// Exposes operational health queries for the admin dashboard.
// These are READ-ONLY queries with no side effects.
// ══════════════════════════════════════════════════════════════════════

import { prisma } from '@/lib/prisma';
import { getWalletBalance } from '@/lib/ledger';

// ── Types ───────────────────────────────────────────────────────────

export interface LedgerDriftCase {
    walletId: string;
    operatorId: string;
    ledgerBalance: number;
    columnBalance: number;
    drift: number;
}

export interface HighBoostFrequencyCase {
    operatorId: string;
    boostCount: number;
    period: string;
}

export interface StaleRiskCase {
    userId: string;
    riskScore: number;
    lastUpdated: Date | null;
    daysSinceUpdate: number;
}

// ══════════════════════════════════════════════════════════════════════
// MONITORING QUERIES
// ══════════════════════════════════════════════════════════════════════

/**
 * Find wallets where ledger SUM ≠ column balance.
 * Critical for detecting financial integrity issues.
 */
export async function getLedgerDriftCases(): Promise<LedgerDriftCase[]> {
    const wallets = await prisma.operatorWallet.findMany({
        select: { id: true, operatorId: true, availableBalance: true },
    });

    const driftCases: LedgerDriftCase[] = [];

    for (const wallet of wallets) {
        try {
            const ledgerBalance = await prisma.$transaction(async (tx) => {
                return getWalletBalance(tx, wallet.id);
            });
            const drift = Math.abs(ledgerBalance - wallet.availableBalance);

            if (drift > 0.01) { // Allow floating point tolerance
                driftCases.push({
                    walletId: wallet.id,
                    operatorId: wallet.operatorId,
                    ledgerBalance,
                    columnBalance: wallet.availableBalance,
                    drift,
                });
            }
        } catch {
            // Skip errored wallets
        }
    }

    return driftCases;
}

/**
 * Find operators with > 2 boosts in the last 30 days.
 * Flags potential abuse even if per-operator guards passed.
 */
export async function getHighBoostFrequency(): Promise<HighBoostFrequencyCase[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const boosts = await (prisma as any).boostEntry.groupBy({
        by: ['operatorId'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: true,
        having: { operatorId: { _count: { gt: 2 } } },
    });

    return boosts.map((b: { operatorId: string; _count: number }) => ({
        operatorId: b.operatorId,
        boostCount: b._count,
        period: '30d',
    }));
}

/**
 * Find operators whose risk score hasn't been updated in 90+ days.
 * These may have outdated risk profiles.
 */
export async function getStaleRiskCases(): Promise<StaleRiskCase[]> {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const staleUsers = await (prisma as any).user.findMany({
        where: {
            role: { name: 'TOUR_OPERATOR' },
            OR: [
                { updatedAt: { lt: ninetyDaysAgo } },
            ],
        },
        select: {
            id: true,
            riskScore: true,
            updatedAt: true,
        },
    });

    return staleUsers.map((u: any) => ({
        userId: u.id,
        riskScore: u.riskScore ?? 0,
        lastUpdated: u.updatedAt,
        daysSinceUpdate: Math.floor((Date.now() - u.updatedAt.getTime()) / (24 * 60 * 60 * 1000)),
    }));
}
