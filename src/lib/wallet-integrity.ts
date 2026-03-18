// ══════════════════════════════════════════════════════════════════════
// Wallet Integrity — Ledger vs Column Balance Verification
// ══════════════════════════════════════════════════════════════════════

import { prisma } from '@/lib/prisma';
import { getWalletBalance } from '@/lib/ledger';

export interface WalletIntegrityResult {
    walletId: string;
    operatorId: string;
    ledgerBalance: number;
    columnBalance: number;
    drift: number;
    healthy: boolean;
}

/**
 * Compare ledger-derived balance against stored wallet column balance.
 * Logs discrepancy to AuditLog if drift detected.
 *
 * @returns Integrity result with drift amount
 */
export async function verifyWalletIntegrity(walletId: string): Promise<WalletIntegrityResult> {
    const result = await prisma.$transaction(async (tx) => {
        const wallet = await tx.operatorWallet.findUnique({
            where: { id: walletId },
        });

        if (!wallet) {
            throw new Error('WALLET_NOT_FOUND');
        }

        const ledgerBalance = await getWalletBalance(tx, walletId);
        const columnBalance = wallet.availableBalance;
        const drift = Math.abs(ledgerBalance - columnBalance);
        const healthy = drift === 0;

        return {
            walletId,
            operatorId: wallet.operatorId,
            ledgerBalance,
            columnBalance,
            drift,
            healthy,
        };
    });

    // Log discrepancy if detected (outside transaction — best effort)
    if (!result.healthy) {
        try {
            await prisma.auditLog.create({
                data: {
                    userId: result.operatorId,
                    action: 'WALLET_INTEGRITY_DRIFT',
                    targetId: result.walletId,
                    targetType: 'OPERATOR_WALLET',
                    meta: JSON.stringify({
                        ledgerBalance: result.ledgerBalance,
                        columnBalance: result.columnBalance,
                        drift: result.drift,
                        detectedAt: new Date().toISOString(),
                    }),
                },
            });
            console.error(
                `WALLET INTEGRITY DRIFT: wallet=${result.walletId} ` +
                `ledger=${result.ledgerBalance} column=${result.columnBalance} ` +
                `drift=${result.drift}`
            );
        } catch {
            // Best-effort
        }
    }

    return result;
}

/**
 * Verify integrity of ALL wallets. Returns only drifted wallets.
 */
export async function verifyAllWalletIntegrity(): Promise<WalletIntegrityResult[]> {
    const wallets = await prisma.operatorWallet.findMany({
        select: { id: true },
    });

    const results: WalletIntegrityResult[] = [];
    for (const wallet of wallets) {
        try {
            const result = await verifyWalletIntegrity(wallet.id);
            if (!result.healthy) {
                results.push(result);
            }
        } catch {
            // Skip wallets that error
        }
    }

    return results;
}
