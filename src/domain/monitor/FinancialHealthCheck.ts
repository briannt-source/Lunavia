/**
 * FinancialHealthCheck — Background Financial Drift Monitor
 *
 * Detection-only layer. NEVER mutates financial state.
 * Checks: wallet-ledger drift, commission-revenue integrity,
 *         stuck escrows, trust cap violations, negative balances.
 */

import { prisma } from '@/lib/prisma';
import { getTrustMax } from '@/domain/operator/OperatorGovernance';

// ── Types ────────────────────────────────────────────────────────────

type Severity = 'INFO' | 'WARNING' | 'CRITICAL';

interface HealthFinding {
    type: string;
    severity: Severity;
    message: string;
    metadata?: Record<string, unknown>;
}

interface HealthCheckResult {
    runAt: string;
    findings: HealthFinding[];
    summary: {
        critical: number;
        warning: number;
        info: number;
        total: number;
    };
}

// ── Helper: persist finding to SystemHealthLog ───────────────────────

async function logFinding(f: HealthFinding): Promise<void> {
    await (prisma as any).systemHealthLog.create({
        data: {
            type: f.type,
            severity: f.severity,
            message: f.message,
            metadata: f.metadata ?? null,
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// CHECK A — Wallet-Ledger Drift
// ══════════════════════════════════════════════════════════════════════

async function checkWalletLedgerDrift(): Promise<HealthFinding[]> {
    const findings: HealthFinding[] = [];

    const wallets = await prisma.wallet.findMany({
        select: {
            id: true,
            operatorId: true,
            availableBalance: true,
            pendingBalance: true,
        },
    });

    for (const wallet of wallets) {
        // Sum all ledger entries for this wallet
        const ledgerAgg = await (prisma as any).escrowLedgerEntry.aggregate({
            where: { walletId: wallet.id },
            _sum: { debit: true, credit: true },
        });

        const totalDebits = ledgerAgg._sum.debit ?? 0;
        const totalCredits = ledgerAgg._sum.credit ?? 0;
        const ledgerNet = totalCredits - totalDebits;
        const walletTotal = wallet.availableBalance + wallet.pendingBalance;

        const drift = Math.abs(walletTotal - ledgerNet);
        if (drift > 0.01) {
            findings.push({
                type: 'WALLET_LEDGER_DRIFT',
                severity: 'CRITICAL',
                message: `Wallet ${wallet.id} (operator: ${wallet.operatorId}): balance=${walletTotal}, ledger net=${ledgerNet}, drift=${drift.toFixed(2)}`,
                metadata: {
                    walletId: wallet.id,
                    operatorId: wallet.operatorId,
                    availableBalance: wallet.availableBalance,
                    pendingBalance: wallet.pendingBalance,
                    ledgerCredits: totalCredits,
                    ledgerDebits: totalDebits,
                    drift,
                },
            });
        }
    }

    return findings;
}

// ══════════════════════════════════════════════════════════════════════
// CHECK B — Commission-Revenue Integrity
// ══════════════════════════════════════════════════════════════════════

async function checkCommissionRevenueIntegrity(): Promise<HealthFinding[]> {
    const findings: HealthFinding[] = [];

    const commissionAgg = await (prisma as any).commissionRecord.aggregate({
        _sum: { commissionAmount: true },
    });

    const revenueAgg = await (prisma as any).platformRevenueLedger.aggregate({
        where: { type: 'COMMISSION_FEE' },
        _sum: { amount: true },
    });

    const commissionTotal = commissionAgg._sum.commissionAmount ?? 0;
    const revenueTotal = revenueAgg._sum.amount ?? 0;
    const mismatch = Math.abs(commissionTotal - revenueTotal);

    if (mismatch > 0.01) {
        findings.push({
            type: 'COMMISSION_REVENUE_MISMATCH',
            severity: 'CRITICAL',
            message: `Commission total (${commissionTotal}) != Revenue ledger total (${revenueTotal}), mismatch=${mismatch.toFixed(2)}`,
            metadata: { commissionTotal, revenueTotal, mismatch },
        });
    }

    return findings;
}

// ══════════════════════════════════════════════════════════════════════
// CHECK C — Stuck Escrow (HELD > 48h)
// ══════════════════════════════════════════════════════════════════════

async function checkStuckEscrows(): Promise<HealthFinding[]> {
    const findings: HealthFinding[] = [];
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const stuck = await prisma.tour.findMany({
        where: {
            escrowStatus: 'HELD',
            updatedAt: { lt: cutoff },
        },
        select: {
            id: true,
            title: true,
            operatorId: true,
            updatedAt: true,
            escrowStatus: true,
        },
    });

    for (const tour of stuck) {
        const hoursStuck = Math.floor(
            (Date.now() - new Date(tour.updatedAt).getTime()) / (1000 * 60 * 60)
        );

        findings.push({
            type: 'STUCK_ESCROW',
            severity: 'WARNING',
            message: `Tour "${tour.title}" (${tour.id}): escrow HELD for ${hoursStuck}h (>48h threshold)`,
            metadata: {
                tourId: tour.id,
                operatorId: tour.operatorId,
                hoursStuck,
                updatedAt: tour.updatedAt,
            },
        });
    }

    return findings;
}

// ══════════════════════════════════════════════════════════════════════
// CHECK D — Trust Cap Violations
// ══════════════════════════════════════════════════════════════════════

async function checkTrustCapViolations(): Promise<HealthFinding[]> {
    const findings: HealthFinding[] = [];

    const users = await prisma.user.findMany({
        where: { trustScore: { gt: 0 } },
        select: {
            id: true,
            name: true,
            trustScore: true,
            operatorCategory: true,
            role: true,
        },
    });

    for (const user of users) {
        const max = getTrustMax(user.operatorCategory);
        if (user.trustScore > max) {
            findings.push({
                type: 'TRUST_CAP_VIOLATION',
                severity: 'WARNING',
                message: `User ${user.id} (${user.name || 'unnamed'}): trustScore=${user.trustScore} exceeds cap=${max} for category=${user.operatorCategory || 'none'}`,
                metadata: {
                    userId: user.id,
                    trustScore: user.trustScore,
                    cap: max,
                    category: user.operatorCategory,
                    role: user.role,
                },
            });
        }
    }

    return findings;
}

// ══════════════════════════════════════════════════════════════════════
// CHECK E — Negative Balance
// ══════════════════════════════════════════════════════════════════════

async function checkNegativeBalances(): Promise<HealthFinding[]> {
    const findings: HealthFinding[] = [];

    const negativeWallets = await prisma.wallet.findMany({
        where: {
            OR: [
                { availableBalance: { lt: 0 } },
                { pendingBalance: { lt: 0 } },
            ],
        },
        select: {
            id: true,
            operatorId: true,
            availableBalance: true,
            pendingBalance: true,
        },
    });

    for (const wallet of negativeWallets) {
        findings.push({
            type: 'NEGATIVE_BALANCE',
            severity: 'CRITICAL',
            message: `Wallet ${wallet.id} (operator: ${wallet.operatorId}): available=${wallet.availableBalance}, pending=${wallet.pendingBalance}`,
            metadata: {
                walletId: wallet.id,
                operatorId: wallet.operatorId,
                availableBalance: wallet.availableBalance,
                pendingBalance: wallet.pendingBalance,
            },
        });
    }

    return findings;
}

// ══════════════════════════════════════════════════════════════════════
// MAIN — Run all checks
// ══════════════════════════════════════════════════════════════════════

export async function runFinancialHealthCheck(): Promise<HealthCheckResult> {
    console.log('[FINANCIAL_HEALTH_CHECK] Starting...');

    const allFindings: HealthFinding[] = [];

    // Run all checks in parallel
    const [drift, commission, stuck, trustCap, negative] = await Promise.all([
        checkWalletLedgerDrift().catch((e) => {
            console.error('[HEALTH_CHECK] Wallet-Ledger drift check failed:', e);
            return [] as HealthFinding[];
        }),
        checkCommissionRevenueIntegrity().catch((e) => {
            console.error('[HEALTH_CHECK] Commission-Revenue check failed:', e);
            return [] as HealthFinding[];
        }),
        checkStuckEscrows().catch((e) => {
            console.error('[HEALTH_CHECK] Stuck escrow check failed:', e);
            return [] as HealthFinding[];
        }),
        checkTrustCapViolations().catch((e) => {
            console.error('[HEALTH_CHECK] Trust cap check failed:', e);
            return [] as HealthFinding[];
        }),
        checkNegativeBalances().catch((e) => {
            console.error('[HEALTH_CHECK] Negative balance check failed:', e);
            return [] as HealthFinding[];
        }),
    ]);

    allFindings.push(...drift, ...commission, ...stuck, ...trustCap, ...negative);

    // Persist all findings to SystemHealthLog
    await Promise.all(allFindings.map(logFinding));

    const summary = {
        critical: allFindings.filter((f) => f.severity === 'CRITICAL').length,
        warning: allFindings.filter((f) => f.severity === 'WARNING').length,
        info: allFindings.filter((f) => f.severity === 'INFO').length,
        total: allFindings.length,
    };

    console.log('[FINANCIAL_HEALTH_CHECK] Complete', summary);

    return {
        runAt: new Date().toISOString(),
        findings: allFindings,
        summary,
    };
}
