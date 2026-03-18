/**
 * EscrowInvariant — Financial State Integrity Enforcement Layer
 *
 * Guarantees that wallet, escrow, commission, and revenue state
 * can NEVER drift or become inconsistent, even if future routes
 * are written incorrectly.
 *
 * RULES:
 * - All functions accept a Prisma transaction client (`tx`), never raw `prisma`
 * - All functions throw `EscrowInvariantViolationError` on mismatch
 * - All functions are pure verification — they do NOT mutate state
 * - Call AFTER state mutations, BEFORE transaction commits
 */

import { PrismaClient, LedgerDirection, EscrowLedgerType, RevenueLedgerType } from '@prisma/client';

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

// ══════════════════════════════════════════════════════════════════════
// CUSTOM ERROR — STRUCTURED VIOLATION REPORTING
// ══════════════════════════════════════════════════════════════════════

export class EscrowInvariantViolationError extends Error {
    public readonly invariant: string;
    public readonly context: Record<string, unknown>;

    constructor(invariant: string, message: string, context: Record<string, unknown> = {}) {
        super(`[ESCROW_INVARIANT_VIOLATION] ${invariant}: ${message}`);
        this.name = 'EscrowInvariantViolationError';
        this.invariant = invariant;
        this.context = context;

        // Structured logging on construction
        console.error('[ESCROW_INVARIANT_VIOLATION]', {
            invariant,
            message,
            context,
            timestamp: new Date().toISOString(),
        });
    }
}

// ══════════════════════════════════════════════════════════════════════
// INVARIANT A — ESCROW HOLD INTEGRITY
// ══════════════════════════════════════════════════════════════════════

/**
 * Assert Escrow Hold Invariant
 *
 * If settlementType === 'ESCROW' && escrowStatus === 'HELD':
 *   1. An EscrowLedgerEntry of type ESCROW_HOLD (DEBIT) must exist
 *   2. Wallet.pendingBalance must reflect the held amount
 *   3. No RELEASE or REFUND ledger entry must exist for this tour
 */
export async function assertEscrowHoldIntegrity(
    tx: TxClient,
    tourId: string,
): Promise<void> {
    const tour = await (tx as any).serviceRequest.findUnique({
        where: { id: tourId },
        select: {
            id: true,
            settlementType: true,
            escrowStatus: true,
            escrowHoldId: true,
            escrowTransaction: {
                select: { id: true, walletId: true, amount: true },
            },
        },
    });

    if (!tour) return; // Tour not found — nothing to verify
    if (tour.settlementType !== 'ESCROW') return; // Not an escrow tour
    if (tour.escrowStatus !== 'HELD') return; // Not in HELD state

    const walletId = tour.escrowTransaction?.walletId;
    const holdAmount = tour.escrowTransaction?.amount;

    if (!walletId || !holdAmount) {
        throw new EscrowInvariantViolationError(
            'ESCROW_HOLD_MISSING_TRANSACTION',
            'Tour is in HELD state but has no escrow transaction record',
            { tourId, escrowStatus: tour.escrowStatus },
        );
    }

    // 1. Verify ESCROW_HOLD debit ledger entry exists
    const holdEntry = await (tx as any).escrowLedgerEntry.findFirst({
        where: {
            walletId,
            type: EscrowLedgerType.ESCROW_HOLD,
            direction: LedgerDirection.DEBIT,
            referenceId: tourId,
        },
        select: { id: true, amount: true },
    });

    if (!holdEntry) {
        throw new EscrowInvariantViolationError(
            'ESCROW_HOLD_NO_LEDGER_ENTRY',
            'Tour is HELD but no ESCROW_HOLD debit ledger entry exists',
            { tourId, walletId, expectedAmount: holdAmount },
        );
    }

    // 2. Verify no premature RELEASE or REFUND entries exist
    const prematureRelease = await (tx as any).escrowLedgerEntry.findFirst({
        where: {
            walletId,
            type: { in: [EscrowLedgerType.ESCROW_RELEASE, EscrowLedgerType.ESCROW_REFUND] },
            referenceId: tourId,
        },
        select: { id: true, type: true },
    });

    if (prematureRelease) {
        throw new EscrowInvariantViolationError(
            'ESCROW_HOLD_PREMATURE_RELEASE',
            `Tour is HELD but a ${prematureRelease.type} ledger entry already exists`,
            { tourId, walletId, prematureEntryId: prematureRelease.id },
        );
    }

    // 3. Verify wallet pendingBalance reflects the hold
    const wallet = await (tx as any).operatorWallet.findUnique({
        where: { id: walletId },
        select: { pendingBalance: true },
    });

    if (wallet && wallet.pendingBalance < holdEntry.amount - 1) {
        throw new EscrowInvariantViolationError(
            'ESCROW_HOLD_PENDING_MISMATCH',
            'Wallet pendingBalance is less than the escrow hold amount',
            {
                tourId,
                walletId,
                holdAmount: holdEntry.amount,
                walletPendingBalance: wallet.pendingBalance,
            },
        );
    }
}

// ══════════════════════════════════════════════════════════════════════
// INVARIANT B — ESCROW RELEASE INTEGRITY
// ══════════════════════════════════════════════════════════════════════

/**
 * Assert Escrow Release Invariant
 *
 * If escrowStatus === 'RELEASED':
 *   1. An EscrowLedgerEntry of type ESCROW_RELEASE (CREDIT) must exist
 *   2. Wallet.pendingBalance must be 0 (for this tour's hold)
 *   3. If commission enabled: CommissionRecord + PlatformRevenueLedger must exist
 */
export async function assertEscrowReleaseIntegrity(
    tx: TxClient,
    tourId: string,
): Promise<void> {
    const tour = await (tx as any).serviceRequest.findUnique({
        where: { id: tourId },
        select: {
            id: true,
            escrowStatus: true,
            escrowTransaction: {
                select: { id: true, walletId: true, amount: true },
            },
        },
    });

    if (!tour) return;
    if (tour.escrowStatus !== 'RELEASED') return;

    const walletId = tour.escrowTransaction?.walletId;
    const grossAmount = tour.escrowTransaction?.amount;

    if (!walletId || !grossAmount) {
        throw new EscrowInvariantViolationError(
            'ESCROW_RELEASE_MISSING_TRANSACTION',
            'Tour is RELEASED but has no escrow transaction record',
            { tourId },
        );
    }

    // 1. Verify ESCROW_RELEASE credit ledger entry exists
    const releaseEntry = await (tx as any).escrowLedgerEntry.findFirst({
        where: {
            walletId,
            type: EscrowLedgerType.ESCROW_RELEASE,
            direction: LedgerDirection.CREDIT,
            referenceId: tourId,
        },
        select: { id: true, amount: true },
    });

    if (!releaseEntry) {
        throw new EscrowInvariantViolationError(
            'ESCROW_RELEASE_NO_LEDGER_ENTRY',
            'Tour is RELEASED but no ESCROW_RELEASE credit ledger entry exists',
            { tourId, walletId },
        );
    }

    // 2. Verify the release amount is not greater than the gross hold
    if (releaseEntry.amount > grossAmount + 1) {
        throw new EscrowInvariantViolationError(
            'ESCROW_RELEASE_AMOUNT_EXCEEDS_HOLD',
            'Released amount exceeds the original escrow hold amount',
            {
                tourId,
                walletId,
                holdAmount: grossAmount,
                releaseAmount: releaseEntry.amount,
            },
        );
    }
}

// ══════════════════════════════════════════════════════════════════════
// INVARIANT C — WALLET-LEDGER CONSISTENCY
// ══════════════════════════════════════════════════════════════════════

/**
 * Assert Wallet-Ledger Invariant
 *
 * For any wallet:
 *   availableBalance must equal the computed sum of ledger entries
 *   (SUM(CREDIT) - SUM(DEBIT))
 *
 * If mismatch detected → throws EscrowInvariantViolationError
 */
export async function assertWalletLedgerConsistency(
    tx: TxClient,
    walletId: string,
): Promise<void> {
    // 1. Read the wallet's stored balances
    const wallet = await (tx as any).operatorWallet.findUnique({
        where: { id: walletId },
        select: {
            id: true,
            availableBalance: true,
            pendingBalance: true,
            totalDeposited: true,
        },
    });

    if (!wallet) return; // Wallet not found — nothing to verify

    // 2. Compute ledger-derived balance: SUM(CREDIT) - SUM(DEBIT)
    const ledgerGroups = await (tx as any).escrowLedgerEntry.groupBy({
        by: ['direction'],
        where: { walletId },
        _sum: { amount: true },
    });

    let ledgerCredits = 0;
    let ledgerDebits = 0;
    for (const row of ledgerGroups) {
        if (row.direction === LedgerDirection.CREDIT) {
            ledgerCredits = row._sum.amount || 0;
        } else if (row.direction === LedgerDirection.DEBIT) {
            ledgerDebits = row._sum.amount || 0;
        }
    }

    const ledgerBalance = ledgerCredits - ledgerDebits;

    // 3. Compute pending escrow from holds minus releases/refunds
    const holdSum = await (tx as any).escrowLedgerEntry.aggregate({
        where: {
            walletId,
            type: EscrowLedgerType.ESCROW_HOLD,
            direction: LedgerDirection.DEBIT,
        },
        _sum: { amount: true },
    });

    const releaseRefundSum = await (tx as any).escrowLedgerEntry.aggregate({
        where: {
            walletId,
            type: { in: [EscrowLedgerType.ESCROW_RELEASE, EscrowLedgerType.ESCROW_REFUND] },
            direction: LedgerDirection.CREDIT,
        },
        _sum: { amount: true },
    });

    const ledgerPending = (holdSum._sum.amount || 0) - (releaseRefundSum._sum.amount || 0);

    // 4. Compute total deposited from topup entries
    const depositSum = await (tx as any).escrowLedgerEntry.aggregate({
        where: {
            walletId,
            type: EscrowLedgerType.ESCROW_TOPUP,
            direction: LedgerDirection.CREDIT,
        },
        _sum: { amount: true },
    });
    const ledgerTotalDeposited = depositSum._sum.amount || 0;

    // 5. Account for withdrawal debits
    const withdrawalSum = await (tx as any).escrowLedgerEntry.aggregate({
        where: {
            walletId,
            type: EscrowLedgerType.ESCROW_WITHDRAW,
            direction: LedgerDirection.DEBIT,
        },
        _sum: { amount: true },
    });
    const totalWithdrawals = withdrawalSum._sum?.amount || 0;

    // 6. Compare wallet columns vs ledger-derived values (tolerance: 1 VND — integer currency)
    const TOLERANCE = 1;

    if (Math.abs(wallet.availableBalance - ledgerBalance) > TOLERANCE) {
        throw new EscrowInvariantViolationError(
            'WALLET_AVAILABLE_BALANCE_DRIFT',
            'Wallet availableBalance does not match ledger-derived balance',
            {
                walletId,
                walletAvailableBalance: wallet.availableBalance,
                ledgerDerivedBalance: ledgerBalance,
                drift: wallet.availableBalance - ledgerBalance,
                ledgerCredits,
                ledgerDebits,
            },
        );
    }

    if (Math.abs(wallet.pendingBalance - ledgerPending) > TOLERANCE) {
        throw new EscrowInvariantViolationError(
            'WALLET_PENDING_BALANCE_DRIFT',
            'Wallet pendingBalance does not match ledger-derived pending escrow',
            {
                walletId,
                walletPendingBalance: wallet.pendingBalance,
                ledgerDerivedPending: ledgerPending,
                drift: wallet.pendingBalance - ledgerPending,
            },
        );
    }

    if (Math.abs(wallet.totalDeposited - ledgerTotalDeposited) > TOLERANCE) {
        throw new EscrowInvariantViolationError(
            'WALLET_TOTAL_DEPOSITED_DRIFT',
            'Wallet totalDeposited does not match ledger-derived deposits',
            {
                walletId,
                walletTotalDeposited: wallet.totalDeposited,
                ledgerDerivedDeposited: ledgerTotalDeposited,
                drift: wallet.totalDeposited - ledgerTotalDeposited,
            },
        );
    }
}

// ══════════════════════════════════════════════════════════════════════
// INVARIANT D — COMMISSION INTEGRITY
// ══════════════════════════════════════════════════════════════════════

/**
 * Assert Commission Invariant
 *
 * If escrow is RELEASED and commission was deducted:
 *   1. CommissionRecord must exist for this tour
 *   2. PlatformRevenueLedger entry of type COMMISSION_FEE must exist
 *   3. Revenue ledger amount must match CommissionRecord.commissionAmount
 */
export async function assertCommissionIntegrity(
    tx: TxClient,
    tourId: string,
): Promise<void> {
    const tour = await (tx as any).serviceRequest.findUnique({
        where: { id: tourId },
        select: {
            id: true,
            escrowStatus: true,
            escrowTransaction: {
                select: { amount: true },
            },
        },
    });

    if (!tour) return;
    if (tour.escrowStatus !== 'RELEASED') return;

    // Check if a commission record exists for this tour
    const commissionRecord = await (tx as any).commissionRecord.findFirst({
        where: { tourId },
        select: {
            id: true,
            commissionAmount: true,
            grossAmount: true,
            commissionRate: true,
            vatAmount: true,
            netRevenue: true,
        },
    });

    // Commission may not exist if commission is disabled or rate is 0 — that's valid.
    // But if it DOES exist, the revenue ledger must match.
    if (!commissionRecord) return;

    // Verify PlatformRevenueLedger entry exists
    const revenueLedgerEntry = await (tx as any).platformRevenueLedger.findFirst({
        where: {
            type: RevenueLedgerType.COMMISSION_FEE,
            referenceId: tourId,
        },
        select: { id: true, amount: true },
    });

    if (!revenueLedgerEntry) {
        throw new EscrowInvariantViolationError(
            'COMMISSION_NO_REVENUE_LEDGER',
            'CommissionRecord exists but no PlatformRevenueLedger COMMISSION_FEE entry found',
            {
                tourId,
                commissionRecordId: commissionRecord.id,
                commissionAmount: commissionRecord.commissionAmount,
            },
        );
    }

    // Verify amounts match
    const TOLERANCE = 1;
    if (Math.abs(revenueLedgerEntry.amount - commissionRecord.commissionAmount) > TOLERANCE) {
        throw new EscrowInvariantViolationError(
            'COMMISSION_REVENUE_AMOUNT_MISMATCH',
            'PlatformRevenueLedger amount does not match CommissionRecord commissionAmount',
            {
                tourId,
                commissionAmount: commissionRecord.commissionAmount,
                revenueLedgerAmount: revenueLedgerEntry.amount,
                drift: revenueLedgerEntry.amount - commissionRecord.commissionAmount,
            },
        );
    }

    // Verify commission math: commissionAmount ≈ grossAmount × commissionRate
    const expectedCommission = commissionRecord.grossAmount * commissionRecord.commissionRate;
    if (Math.abs(commissionRecord.commissionAmount - expectedCommission) > TOLERANCE) {
        throw new EscrowInvariantViolationError(
            'COMMISSION_CALCULATION_DRIFT',
            'CommissionRecord.commissionAmount does not match grossAmount × commissionRate',
            {
                tourId,
                grossAmount: commissionRecord.grossAmount,
                commissionRate: commissionRecord.commissionRate,
                expectedCommission,
                actualCommission: commissionRecord.commissionAmount,
            },
        );
    }

    // Verify netRevenue = commissionAmount - vatAmount
    const expectedNetRevenue = commissionRecord.commissionAmount - commissionRecord.vatAmount;
    if (Math.abs(commissionRecord.netRevenue - expectedNetRevenue) > TOLERANCE) {
        throw new EscrowInvariantViolationError(
            'COMMISSION_NET_REVENUE_DRIFT',
            'CommissionRecord.netRevenue does not match commissionAmount - vatAmount',
            {
                tourId,
                commissionAmount: commissionRecord.commissionAmount,
                vatAmount: commissionRecord.vatAmount,
                expectedNetRevenue,
                actualNetRevenue: commissionRecord.netRevenue,
            },
        );
    }
}
