// ══════════════════════════════════════════════════════════════════════
// Boost Service — Temporary matching weight multiplier system
// ══════════════════════════════════════════════════════════════════════

import { prisma } from '@/lib/prisma';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { debitWallet, syncWalletBalances } from '@/lib/ledger';
import { EscrowLedgerType } from '@prisma/client';
import { hasLayer } from '@/domain/system-mode/system-mode';

export type BoostDuration = 3 | 7 | 14; // days

// ── Boost Pricing (VND) ─────────────────────────────────────────────
const BOOST_PRICES: Record<BoostDuration, number> = {
    3: 150_000,
    7: 300_000,
    14: 500_000,
};

const BOOST_MULTIPLIER: Record<BoostDuration, number> = {
    3: 1.3,
    7: 1.5,
    14: 1.8,
};

// ── Abuse Guard Constants ───────────────────────────────────────────
const BOOST_COOLDOWN_HOURS = 24;
const BOOST_MONTHLY_CAP = 2;
const BOOST_MIN_TRUST_SCORE = 20;

export interface BoostPurchaseResult {
    success: boolean;
    boostId?: string;
    error?: string;
    amountPaid?: number;
    startAt?: Date;
    endAt?: Date;
    multiplier?: number;
}

/**
 * Purchase a boost for an operator.
 * Uses double-entry ledger for financial integrity.
 *
 * Guardrails:
 * - 24h cooldown between purchases
 * - Max 2 boosts per calendar month
 * - Cannot purchase if active boost exists
 * - Minimum trustScore ≥ 20
 */
export async function purchaseBoost(
    operatorId: string,
    duration: BoostDuration,
    requestId?: string,
): Promise<BoostPurchaseResult> {
    const price = BOOST_PRICES[duration];
    const multiplier = BOOST_MULTIPLIER[duration];

    if (!price || !multiplier) {
        return { success: false, error: `Invalid boost duration: ${duration}` };
    }

    // ── ALL guardrails + purchase inside single transaction ──────────
    return executeSimpleMutation({
        entityName: 'BoostEntry',
        actorId: operatorId,
        actorRole: 'OPERATOR',
        auditAction: 'BOOST_PURCHASED',
        metadata: { duration, price, multiplier },
        atomicMutation: async (tx) => {
            // 0. BOOST_ENABLED layer check (inlined — uses tx client)
            const opInfo = await (tx as any).user.findUnique({
                where: { id: operatorId },
                select: { systemMode: true, enabledLayers: true, trustScore: true },
            });
            if (!opInfo) {
                return { success: false, error: 'Operator not found' } as BoostPurchaseResult;
            }
            const modeInfo = { systemMode: opInfo.systemMode, enabledLayers: opInfo.enabledLayers };
            if (!hasLayer(modeInfo, 'BOOST_ENABLED')) {
                return { success: false, error: 'Boost is not available for your current operator mode.' } as BoostPurchaseResult;
            }

            // 1. Trust score minimum
            if (opInfo.trustScore < BOOST_MIN_TRUST_SCORE) {
                await logBoostAttempt(operatorId, duration, 'BLOCKED_LOW_TRUST');
                return { success: false, error: `Minimum trust score of ${BOOST_MIN_TRUST_SCORE} required to purchase boosts.` } as BoostPurchaseResult;
            }

            // 2. Active boost check
            const now = new Date();
            const activeBoost = await (tx as any).boostEntry.findFirst({
                where: {
                    operatorId,
                    status: 'ACTIVE',
                    startAt: { lte: now },
                    endAt: { gte: now },
                },
            });
            if (activeBoost) {
                await logBoostAttempt(operatorId, duration, 'BLOCKED_ACTIVE_BOOST');
                return { success: false, error: 'You already have an active boost. Wait for it to expire.' } as BoostPurchaseResult;
            }

            // 3. Cooldown check (24h since last purchase)
            const cooldownThreshold = new Date(Date.now() - BOOST_COOLDOWN_HOURS * 60 * 60 * 1000);
            const recentPurchase = await (tx as any).boostEntry.findFirst({
                where: {
                    operatorId,
                    createdAt: { gte: cooldownThreshold },
                },
                orderBy: { createdAt: 'desc' },
            });
            if (recentPurchase) {
                await logBoostAttempt(operatorId, duration, 'BLOCKED_COOLDOWN');
                return { success: false, error: `Please wait ${BOOST_COOLDOWN_HOURS}h between boost purchases.` } as BoostPurchaseResult;
            }

            // 4. Monthly cap check (max 2 per calendar month)
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthlyCount = await (tx as any).boostEntry.count({
                where: {
                    operatorId,
                    createdAt: { gte: monthStart },
                },
            });
            if (monthlyCount >= BOOST_MONTHLY_CAP) {
                await logBoostAttempt(operatorId, duration, 'BLOCKED_MONTHLY_CAP');
                return { success: false, error: `Maximum ${BOOST_MONTHLY_CAP} boosts per calendar month.` } as BoostPurchaseResult;
            }

            // 5. Find wallet
            const wallet = await tx.operatorWallet.findUnique({
                where: { operatorId },
            });

            if (!wallet) {
                return { success: false, error: 'Wallet not found' } as BoostPurchaseResult;
            }

            // 6. Debit via ledger (validates balance, creates immutable entry)
            await debitWallet(tx, {
                walletId: wallet.id,
                type: EscrowLedgerType.BOOST_PURCHASE,
                amount: price,
                metadata: { duration, multiplier, requestId: requestId || null },
            });

            // 7. Sync legacy balance columns
            await syncWalletBalances(tx, wallet.id);

            // 8. Create boost entry
            const startAt = new Date();
            const endAt = new Date(startAt.getTime() + duration * 24 * 60 * 60 * 1000);

            const boost = await tx.boostEntry.create({
                data: {
                    operatorId,
                    requestId: requestId || null,
                    startAt,
                    endAt,
                    multiplier,
                    amountPaid: price,
                    status: 'ACTIVE',
                },
            });

            return {
                success: true,
                boostId: boost.id,
                amountPaid: price,
                startAt,
                endAt,
                multiplier,
            } as BoostPurchaseResult;
        },
    });
}

/**
 * Log boost purchase attempt to AuditLog (for monitoring).
 */
async function logBoostAttempt(operatorId: string, duration: BoostDuration, reason: string): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                userId: operatorId,
                action: 'BOOST_ATTEMPT_BLOCKED',
                targetType: 'BOOST_ENTRY',
                meta: JSON.stringify({ duration, reason }),
            },
        });
    } catch {
        // Best-effort logging
    }
}

/**
 * Get active boosts for an operator.
 */
export async function getActiveBoosts(operatorId: string) {
    const now = new Date();
    return prisma.boostEntry.findMany({
        where: {
            operatorId,
            status: 'ACTIVE',
            startAt: { lte: now },
            endAt: { gte: now },
        },
        orderBy: { endAt: 'desc' },
    });
}

/**
 * Apply boost multiplier to a base matching weight.
 * Uses the highest active multiplier (boosts don't stack additively).
 */
export async function applyBoostMultiplier(
    operatorId: string,
    baseWeight: number,
): Promise<{ weight: number; boosted: boolean; multiplier: number }> {
    const boosts = await getActiveBoosts(operatorId);

    if (boosts.length === 0) {
        return { weight: baseWeight, boosted: false, multiplier: 1.0 };
    }

    // Use highest multiplier — never stack
    const maxMultiplier = Math.max(...boosts.map((b: { multiplier: number }) => b.multiplier));
    return {
        weight: Math.round(baseWeight * maxMultiplier * 100) / 100,
        boosted: true,
        multiplier: maxMultiplier,
    };
}

/**
 * Expire old boosts (cron/batch job).
 */
export async function expireOldBoosts(): Promise<number> {
    const now = new Date();
    const result = await prisma.boostEntry.updateMany({
        where: {
            status: 'ACTIVE',
            endAt: { lt: now },
        },
        data: { status: 'EXPIRED' },
    });
    return result.count;
}

/**
 * Get boost pricing for display.
 */
export function getBoostPricing(): Array<{
    duration: BoostDuration;
    price: number;
    multiplier: number;
}> {
    return ([3, 7, 14] as BoostDuration[]).map(duration => ({
        duration,
        price: BOOST_PRICES[duration],
        multiplier: BOOST_MULTIPLIER[duration],
    }));
}
