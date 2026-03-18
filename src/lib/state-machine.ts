/**
 * State Machine Enforcement
 *
 * Generic state machine with explicit transition maps.
 * Prevents invalid state transitions throughout the system.
 *
 * USAGE:
 *   validateTransition(TOUR_MACHINE, 'DRAFT', 'PUBLISHED');
 *   // Succeeds silently
 *
 *   validateTransition(TOUR_MACHINE, 'COMPLETED', 'DRAFT');
 *   // Throws INVALID_STATE_TRANSITION
 */

type TransitionMap = Record<string, string[]>;

/**
 * Validate that a state transition is allowed.
 * Throws `INVALID_STATE_TRANSITION` if not.
 */
export function validateTransition(
    machine: TransitionMap,
    machineName: string,
    from: string,
    to: string
): void {
    const allowed = machine[from];
    if (!allowed) {
        throw new Error(
            `INVALID_STATE_TRANSITION: Unknown state "${from}" in ${machineName}`
        );
    }
    if (!allowed.includes(to)) {
        throw new Error(
            `INVALID_STATE_TRANSITION: ${machineName} cannot transition from "${from}" to "${to}". Allowed: [${allowed.join(', ')}]`
        );
    }
}

/**
 * Check if a transition is valid without throwing.
 */
export function isValidTransition(
    machine: TransitionMap,
    from: string,
    to: string
): boolean {
    const allowed = machine[from];
    return !!allowed && allowed.includes(to);
}

// ============================================
// PRE-BUILT STATE MACHINES
// ============================================

/**
 * Tour lifecycle state machine.
 * DRAFT → PUBLISHED → ASSIGNED → IN_PROGRESS → COMPLETED
 *                 ↘ CANCELLED  ↗
 * FORCE_CANCEL_PENDING_REVIEW is a hold state during admin review.
 */
export const TOUR_MACHINE: TransitionMap = {
    DRAFT: ['PUBLISHED', 'CANCELLED'],
    PUBLISHED: ['ASSIGNED', 'CANCELLED', 'DRAFT', 'PENDING_MUTUAL_CANCEL'],
    ASSIGNED: ['READY', 'IN_PROGRESS', 'CANCELLED', 'FORCE_CANCEL_PENDING_REVIEW', 'PUBLISHED', 'PENDING_MUTUAL_CANCEL'],
    READY: ['IN_PROGRESS', 'CANCELLED', 'FORCE_CANCEL_PENDING_REVIEW'],
    IN_PROGRESS: ['COMPLETED', 'FORCE_CANCEL_PENDING_REVIEW', 'PENDING_MUTUAL_CANCEL'],
    COMPLETED: ['CLOSED', 'DISPUTED'],
    CLOSED: ['REOPENED'],
    DISPUTED: ['CLOSED', 'REOPENED'],
    REOPENED: ['IN_PROGRESS', 'CANCELLED', 'CLOSED'],
    PENDING_MUTUAL_CANCEL: ['CANCELLED', 'PUBLISHED', 'ASSIGNED'],
    FORCE_CANCEL_PENDING_REVIEW: ['CANCELLED'],
    EXPIRED: [],
    CANCELLED: [],
};

/**
 * Escrow state machine.
 * HELD → RELEASED or REFUNDED
 */
export const ESCROW_MACHINE: TransitionMap = {
    HELD: ['RELEASED', 'REFUNDED'],
    RELEASED: [],
    REFUNDED: [],
};

/**
 * Verification state machine.
 * NOT_SUBMITTED → PENDING_SUBMISSION → PENDING_REVIEW → APPROVED / REJECTED
 */
export const VERIFICATION_MACHINE: TransitionMap = {
    NOT_SUBMITTED: ['PENDING_SUBMISSION'],
    PENDING_SUBMISSION: ['PENDING_REVIEW'],
    PENDING_REVIEW: ['APPROVED', 'REJECTED'],
    APPROVED: [],
    REJECTED: ['PENDING_SUBMISSION'],
};

/**
 * User account status state machine.
 * ACTIVE ↔ SUSPENDED → BANNED
 */
export const USER_STATUS_MACHINE: TransitionMap = {
    ACTIVE: ['SUSPENDED', 'BANNED'],
    SUSPENDED: ['ACTIVE', 'BANNED'],
    BANNED: [],
};

/**
 * Payment request state machine.
 * PENDING → APPROVED / REJECTED
 */
export const PAYMENT_REQUEST_MACHINE: TransitionMap = {
    PENDING: ['APPROVED', 'REJECTED'],
    APPROVED: [],
    REJECTED: [],
};

/**
 * Withdraw request state machine.
 * PENDING → APPROVED / REJECTED
 */
export const WITHDRAW_REQUEST_MACHINE: TransitionMap = {
    PENDING: ['APPROVED', 'REJECTED'],
    APPROVED: [],
    REJECTED: [],
};
