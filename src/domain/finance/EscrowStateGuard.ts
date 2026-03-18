/**
 * EscrowStateGuard — Pre-Mutation Financial State Transition Guards
 *
 * Prevents illegal financial state transitions BEFORE any ledger
 * mutation occurs. Complements EscrowInvariant (post-mutation verification).
 *
 * RULES:
 * - All functions accept a Prisma transaction client (`tx`), never raw `prisma`
 * - All functions throw `EscrowStateViolationError` if transition is illegal
 * - All functions are pure checks — they do NOT mutate state
 * - Call BEFORE any ledger/wallet mutation inside the transaction
 */

import { PrismaClient } from '@prisma/client';

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

// ══════════════════════════════════════════════════════════════════════
// CUSTOM ERROR
// ══════════════════════════════════════════════════════════════════════

export class EscrowStateViolationError extends Error {
    public readonly guard: string;
    public readonly context: Record<string, unknown>;

    constructor(guard: string, message: string, context: Record<string, unknown> = {}) {
        super(`[ESCROW_STATE_VIOLATION] ${guard}: ${message}`);
        this.name = 'EscrowStateViolationError';
        this.guard = guard;
        this.context = context;

        console.error('[ESCROW_STATE_VIOLATION]', {
            guard,
            message,
            context,
            timestamp: new Date().toISOString(),
        });
    }
}

// ══════════════════════════════════════════════════════════════════════
// GUARD A — CAN HOLD ESCROW (Publish)
// ══════════════════════════════════════════════════════════════════════

/**
 * Assert that escrow can be held for this tour.
 *
 * Allowed only if:
 * - settlementType === 'ESCROW'
 * - escrowStatus is null (no existing hold)
 * - No existing ESCROW_HOLD ledger entry for this tour
 */
export async function assertCanHoldEscrow(
    tx: TxClient,
    tourId: string,
): Promise<void> {
    const tour = await (tx as any).serviceRequest.findUnique({
        where: { id: tourId },
        select: {
            id: true,
            status: true,
            settlementType: true,
            escrowStatus: true,
            escrowHoldId: true,
        },
    });

    if (!tour) {
        throw new EscrowStateViolationError(
            'HOLD_TOUR_NOT_FOUND',
            'Cannot hold escrow: tour does not exist',
            { tourId },
        );
    }

    // settlementType is set to 'ESCROW' by the mutation AFTER this guard runs,
    // so accept null (not yet set) or 'ESCROW' (already set, e.g. retry).
    // Block only incompatible types like 'INTERNAL'.
    if (tour.settlementType !== null && tour.settlementType !== 'ESCROW') {
        throw new EscrowStateViolationError(
            'HOLD_NOT_ESCROW_SETTLEMENT',
            `Cannot hold escrow: settlementType is '${tour.settlementType}', expected null or 'ESCROW'`,
            { tourId, settlementType: tour.settlementType },
        );
    }

    if (tour.escrowStatus !== null && tour.escrowStatus !== undefined) {
        throw new EscrowStateViolationError(
            'HOLD_ALREADY_EXISTS',
            `Cannot hold escrow: escrowStatus is already '${tour.escrowStatus}'`,
            { tourId, escrowStatus: tour.escrowStatus },
        );
    }

    if (tour.escrowHoldId) {
        throw new EscrowStateViolationError(
            'HOLD_DUPLICATE_TRANSACTION',
            'Cannot hold escrow: an escrow hold transaction already exists',
            { tourId, escrowHoldId: tour.escrowHoldId },
        );
    }
}

// ══════════════════════════════════════════════════════════════════════
// GUARD B — CAN RELEASE ESCROW
// ══════════════════════════════════════════════════════════════════════

/**
 * Assert that escrow can be released for this tour.
 *
 * Allowed only if:
 * - serviceRequest.status in ['COMPLETED', 'CLOSED']
 * - escrowStatus === 'HELD'
 * - settlementType === 'ESCROW'
 * - No open (unresolved) Conflicts exist
 */
export async function assertCanReleaseEscrow(
    tx: TxClient,
    tourId: string,
): Promise<void> {
    const tour = await (tx as any).serviceRequest.findUnique({
        where: { id: tourId },
        select: {
            id: true,
            status: true,
            settlementType: true,
            escrowStatus: true,
        },
    });

    if (!tour) {
        throw new EscrowStateViolationError(
            'RELEASE_TOUR_NOT_FOUND',
            'Cannot release escrow: tour does not exist',
            { tourId },
        );
    }

    if (tour.settlementType !== 'ESCROW') {
        throw new EscrowStateViolationError(
            'RELEASE_NOT_ESCROW_SETTLEMENT',
            `Cannot release: settlementType is '${tour.settlementType}', expected 'ESCROW'`,
            { tourId, settlementType: tour.settlementType },
        );
    }

    if (tour.escrowStatus !== 'HELD') {
        throw new EscrowStateViolationError(
            'RELEASE_NOT_HELD',
            `Cannot release: escrowStatus is '${tour.escrowStatus}', expected 'HELD'`,
            { tourId, escrowStatus: tour.escrowStatus },
        );
    }

    if (!['COMPLETED', 'CLOSED'].includes(tour.status)) {
        throw new EscrowStateViolationError(
            'RELEASE_TOUR_NOT_COMPLETED',
            `Cannot release: tour status is '${tour.status}', expected 'COMPLETED' or 'CLOSED'`,
            { tourId, status: tour.status },
        );
    }

    // Check for unresolved conflicts
    const openConflicts = await (tx as any).conflict.count({
        where: {
            serviceRequestId: tourId,
            status: { not: 'RESOLVED' },
        },
    });

    if (openConflicts > 0) {
        throw new EscrowStateViolationError(
            'RELEASE_OPEN_CONFLICTS',
            `Cannot release: ${openConflicts} unresolved conflict(s) exist`,
            { tourId, openConflicts },
        );
    }
}

// ══════════════════════════════════════════════════════════════════════
// GUARD C — CAN REFUND ESCROW
// ══════════════════════════════════════════════════════════════════════

/**
 * Assert that escrow can be refunded for this tour.
 *
 * Allowed only if:
 * - serviceRequest.status in ['CANCELLED', 'FORCE_CANCELLED']
 * - escrowStatus === 'HELD'
 */
export async function assertCanRefundEscrow(
    tx: TxClient,
    tourId: string,
): Promise<void> {
    const tour = await (tx as any).serviceRequest.findUnique({
        where: { id: tourId },
        select: {
            id: true,
            status: true,
            escrowStatus: true,
        },
    });

    if (!tour) {
        throw new EscrowStateViolationError(
            'REFUND_TOUR_NOT_FOUND',
            'Cannot refund escrow: tour does not exist',
            { tourId },
        );
    }

    if (tour.escrowStatus !== 'HELD') {
        throw new EscrowStateViolationError(
            'REFUND_NOT_HELD',
            `Cannot refund: escrowStatus is '${tour.escrowStatus}', expected 'HELD'`,
            { tourId, escrowStatus: tour.escrowStatus },
        );
    }

    const allowedStatuses = ['CANCELLED', 'FORCE_CANCELLED'];
    if (!allowedStatuses.includes(tour.status)) {
        throw new EscrowStateViolationError(
            'REFUND_TOUR_NOT_CANCELLED',
            `Cannot refund: tour status is '${tour.status}', expected one of: ${allowedStatuses.join(', ')}`,
            { tourId, status: tour.status },
        );
    }
}

// ══════════════════════════════════════════════════════════════════════
// GUARD D — CAN APPROVE WITHDRAW
// ══════════════════════════════════════════════════════════════════════

/**
 * Assert that a withdrawal can be approved for this wallet.
 *
 * Allowed only if:
 * - wallet.pendingBalance === 0 (no pending escrow holds)
 * - No HELD escrow exists for the operator
 */
export async function assertCanApproveWithdraw(
    tx: TxClient,
    walletId: string,
): Promise<void> {
    const wallet = await (tx as any).operatorWallet.findUnique({
        where: { id: walletId },
        select: {
            id: true,
            operatorId: true,
            pendingBalance: true,
        },
    });

    if (!wallet) {
        throw new EscrowStateViolationError(
            'WITHDRAW_WALLET_NOT_FOUND',
            'Cannot approve withdrawal: wallet does not exist',
            { walletId },
        );
    }

    if (wallet.pendingBalance > 0.01) {
        throw new EscrowStateViolationError(
            'WITHDRAW_PENDING_BALANCE',
            `Cannot approve withdrawal: wallet has pending escrow balance of ${wallet.pendingBalance}`,
            { walletId, pendingBalance: wallet.pendingBalance },
        );
    }

    // Check for any HELD escrows belonging to this operator
    const heldEscrows = await (tx as any).serviceRequest.count({
        where: {
            operatorId: wallet.operatorId,
            escrowStatus: 'HELD',
        },
    });

    if (heldEscrows > 0) {
        throw new EscrowStateViolationError(
            'WITHDRAW_ACTIVE_ESCROWS',
            `Cannot approve withdrawal: operator has ${heldEscrows} active escrow hold(s)`,
            { walletId, operatorId: wallet.operatorId, heldEscrows },
        );
    }
}
