import { PrismaClient, LedgerDirection, EscrowLedgerType } from '@prisma/client';

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

/**
 * Escrow Ledger — Source of Truth for Operator Wallet Balances
 *
 * This is CLIENT MONEY (liability). Not platform revenue.
 *
 * RULES:
 * - NEVER update or delete an EscrowLedgerEntry
 * - Balance = SUM(CREDIT) - SUM(DEBIT)
 * - All escrow mutations MUST go through this module
 * - All calls require a Prisma interactive transaction client
 */

// ============================================
// BALANCE QUERIES
// ============================================

/**
 * Get the total balance for a wallet by summing escrow ledger entries.
 * Balance = SUM(CREDIT amounts) - SUM(DEBIT amounts)
 */
export async function getWalletBalance(
    tx: TxClient,
    walletId: string
): Promise<number> {
    const result = await (tx as any).escrowLedgerEntry.groupBy({
        by: ['direction'],
        where: { walletId },
        _sum: { amount: true },
    });

    let credits = 0;
    let debit = 0;
    for (const row of result) {
        if (row.direction === LedgerDirection.CREDIT) {
            credits = row._sum.amount || 0;
        } else if (row.direction === LedgerDirection.DEBIT) {
            debit = row._sum.amount || 0;
        }
    }

    return credits - debit;
}

/**
 * Get available balance (total minus pending escrow holds).
 * Escrow holds that have been released/refunded are already offset by
 * corresponding ESCROW_RELEASE/ESCROW_REFUND entries.
 */
export async function getAvailableBalance(
    tx: TxClient,
    walletId: string
): Promise<number> {
    return getWalletBalance(tx, walletId);
}

/**
 * Get a breakdown of balances (available, pending escrow, total deposited).
 */
export async function getWalletBreakdown(
    tx: TxClient,
    walletId: string
): Promise<{ availableBalance: number; pendingBalance: number; totalDeposited: number }> {
    const [balance, pendingEscrow, totalDeposited] = await Promise.all([
        getWalletBalance(tx, walletId),
        getPendingEscrow(tx, walletId),
        getTotalDeposited(tx, walletId),
    ]);

    return {
        availableBalance: balance,
        pendingBalance: pendingEscrow,
        totalDeposited,
    };
}

async function getPendingEscrow(tx: TxClient, walletId: string): Promise<number> {
    const holds = await (tx as any).escrowLedgerEntry.aggregate({
        where: { walletId, type: EscrowLedgerType.ESCROW_HOLD, direction: LedgerDirection.DEBIT },
        _sum: { amount: true },
    });
    const releases = await (tx as any).escrowLedgerEntry.aggregate({
        where: {
            walletId,
            type: { in: [EscrowLedgerType.ESCROW_RELEASE, EscrowLedgerType.ESCROW_REFUND] },
            direction: LedgerDirection.CREDIT,
        },
        _sum: { amount: true },
    });

    return (holds._sum.amount || 0) - (releases._sum.amount || 0);
}

async function getTotalDeposited(tx: TxClient, walletId: string): Promise<number> {
    const result = await (tx as any).escrowLedgerEntry.aggregate({
        where: { walletId, type: EscrowLedgerType.ESCROW_TOPUP, direction: LedgerDirection.CREDIT },
        _sum: { amount: true },
    });
    return result._sum.amount || 0;
}

// ============================================
// ESCROW LEDGER MUTATIONS (append-only)
// ============================================

interface EscrowLedgerParams {
    walletId: string;
    type: EscrowLedgerType;
    amount: number;
    referenceId?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Credit (add money to) an escrow wallet via an immutable ledger entry.
 */
export async function creditWallet(tx: TxClient, params: EscrowLedgerParams) {
    if (params.amount <= 0) {
        throw new Error('LEDGER_INVALID_AMOUNT');
    }

    return (tx as any).escrowLedgerEntry.create({
        data: {
            walletId: params.walletId,
            direction: LedgerDirection.CREDIT,
            type: params.type,
            amount: params.amount,
            referenceId: params.referenceId || null,
            metadata: params.metadata || null,
        },
    });
}

/**
 * Debit (remove money from) an escrow wallet via an immutable ledger entry.
 * Validates sufficient balance before proceeding.
 */
export async function debitWallet(tx: TxClient, params: EscrowLedgerParams) {
    if (params.amount <= 0) {
        throw new Error('LEDGER_INVALID_AMOUNT');
    }

    const balance = await getWalletBalance(tx, params.walletId);
    if (balance < params.amount) {
        throw new Error('INSUFFICIENT_BALANCE');
    }

    return (tx as any).escrowLedgerEntry.create({
        data: {
            walletId: params.walletId,
            direction: LedgerDirection.DEBIT,
            type: params.type,
            amount: params.amount,
            referenceId: params.referenceId || null,
            metadata: params.metadata || null,
        },
    });
}

/**
 * Sync the legacy mutable balance columns on OperatorWallet
 * to match the escrow ledger-derived values.
 * Called after every escrow ledger mutation for backward compatibility.
 */
export async function syncWalletBalances(tx: TxClient, walletId: string) {
    const breakdown = await getWalletBreakdown(tx, walletId);

    return (tx as any).operatorWallet.update({
        where: { id: walletId },
        data: {
            availableBalance: breakdown.availableBalance,
            pendingBalance: breakdown.pendingBalance,
            totalDeposited: breakdown.totalDeposited,
        },
    });
}

// Re-export for backward compatibility
export { EscrowLedgerType, LedgerDirection } from '@prisma/client';
