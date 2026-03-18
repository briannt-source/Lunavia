/**
 * Cancellation Governance Constants
 * Constitution-aligned cancellation logic for Lunavia
 * 
 * Philosophy: Governance, not convenience. Protect the non-initiating party.
 * V5: Symmetric trust, context snapshots, actionable Superhero Mode
 */

// ============================================
// ENUMS
// ============================================

export enum CancellationType {
    MUTUAL = 'MUTUAL',
    FORCE = 'FORCE'
}

export enum CancellationTiming {
    EARLY = 'EARLY',  // >= 8h before startTime
    LATE = 'LATE'     // < 8h before startTime
}

export enum ForceCancelReason {
    OPERATOR_INTERNAL_ISSUE = 'OPERATOR_INTERNAL_ISSUE',
    OPERATOR_FRAUD = 'OPERATOR_FRAUD',
    GUIDE_NO_SHOW = 'GUIDE_NO_SHOW',
    GUIDE_CONTRACT_VIOLATION = 'GUIDE_CONTRACT_VIOLATION',
    GUIDE_FRAUD = 'GUIDE_FRAUD',  // V5: Added for symmetry
    SAFETY_RISK = 'SAFETY_RISK',
    MEDICAL_EMERGENCY = 'MEDICAL_EMERGENCY',
    FORCE_MAJEURE = 'FORCE_MAJEURE'
}

export enum FaultParty {
    OPERATOR_FAULT = 'OPERATOR_FAULT',
    GUIDE_FAULT = 'GUIDE_FAULT',
    OPERATOR_FRAUD = 'OPERATOR_FRAUD',  // V5: Extreme case
    GUIDE_FRAUD = 'GUIDE_FRAUD',        // V5: Extreme case
    NEUTRAL = 'NEUTRAL'
}

// V5: Escrow resolution types (clarity, not flow change)
export enum EscrowResolutionType {
    FULL_REFUND = 'FULL_REFUND',
    PARTIAL_REFUND = 'PARTIAL_REFUND',
    NO_RELEASE = 'NO_RELEASE'
}

// Reasons that require dual-approval (supervisor)
export const NEUTRAL_FAULT_REASONS: ForceCancelReason[] = [
    ForceCancelReason.MEDICAL_EMERGENCY,
    ForceCancelReason.FORCE_MAJEURE
];

// ============================================
// CONSTANTS
// ============================================

// Late window threshold in hours
export const LATE_WINDOW_HOURS = 8;

// Trust caps per week (from cancellations only)
export const MAX_TRUST_LOSS_PER_WEEK = -15;

// Force cancel abuse threshold
export const FORCE_ABUSE_THRESHOLD = {
    maxClaims: 3,
    periodDays: 30
};

// ============================================
// V6: TIME WINDOWS & COOLDOWNS
// ============================================

// A1: Dispute window (days after tour completion)
export const DISPUTE_WINDOW_DAYS = 7;

// A1: Force cancel max time after tour start (hours)
export const FORCE_CANCEL_MAX_AFTER_START_HOURS = 24;

// A2: Cancel proposal cooldown after rejection (hours)
export const CANCEL_PROPOSAL_COOLDOWN_HOURS = 24;

// A5: In-house exit cooldown before marketplace access (days)
export const INHOUSE_EXIT_COOLDOWN_DAYS = 14;

// A4: Min tour age for escrow commitment (hours)
export const ESCROW_COMMITMENT_MIN_AGE_HOURS = 48;

// A3: Trust event visibility mapping
export const TRUST_EVENT_VISIBILITY: Record<string, boolean> = {
    'TOUR_COMPLETED': true,
    'ESCROW_HELD': false,           // Internal signal, not user-facing
    'ESCROW_HELD_REVERSED': false,  // Internal signal
    'FORCE_CANCEL_OPERATOR_FAULT': true,
    'FORCE_CANCEL_GUIDE_FAULT': true,
    'FORCE_CANCEL_OPERATOR_FRAUD': true,
    'FORCE_CANCEL_GUIDE_FRAUD': true,
    'FORCE_CANCEL_NEUTRAL': true,
    'MUTUAL_CANCEL_LATE_INITIATOR': true,
    'MANUAL_ADJUSTMENT': false,     // Ops internal
    'DOCUMENT_VERIFIED': true,
    'DISPUTE_FILED': true
};

// Tour statuses for cancellation flow
export const CANCELLATION_STATUSES = {
    PENDING_MUTUAL_CANCEL: 'PENDING_MUTUAL_CANCEL',
    FORCE_CANCEL_PENDING_REVIEW: 'FORCE_CANCEL_PENDING_REVIEW',
    CANCELLED: 'CANCELLED'
};

// ============================================
// TRUST IMPACT MATRIX (V5: SYMMETRIC)
// ============================================

export interface CancellationTrustImpact {
    operatorDelta: number;
    guideDelta: number;
    notes: string;
}

// Mutual cancellation trust impacts
export const MUTUAL_TRUST_MATRIX: Record<CancellationTiming, CancellationTrustImpact> = {
    [CancellationTiming.EARLY]: {
        operatorDelta: 0,
        guideDelta: 0,
        notes: 'No harm — normal operational change'
    },
    [CancellationTiming.LATE]: {
        // V5: -1 applies to INITIATOR only IF tour status === ASSIGNED
        operatorDelta: 0,
        guideDelta: 0,
        notes: 'Initiator gets -1 ONLY if tour was ASSIGNED'
    }
};

// V5: SYMMETRIC trust penalties - role ≠ privilege
export const FORCE_TRUST_MATRIX: Record<FaultParty, CancellationTrustImpact> = {
    [FaultParty.OPERATOR_FAULT]: {
        operatorDelta: -6,  // V5: Was -5, now symmetric
        guideDelta: 0,
        notes: 'Operator broke commercial promise'
    },
    [FaultParty.GUIDE_FAULT]: {
        operatorDelta: 0,
        guideDelta: -6,     // V5: Was -7, now symmetric
        notes: 'Guide broke attendance obligation'
    },
    [FaultParty.OPERATOR_FRAUD]: {
        operatorDelta: -20, // V5: Extreme case
        guideDelta: 0,
        notes: 'FRAUD — operator attempted to defraud guide'
    },
    [FaultParty.GUIDE_FRAUD]: {
        operatorDelta: 0,
        guideDelta: -20,    // V5: Extreme case
        notes: 'FRAUD — guide attempted to defraud operator'
    },
    [FaultParty.NEUTRAL]: {
        operatorDelta: 0,
        guideDelta: 0,
        notes: 'External force — no fault'
    }
};

// Late initiator penalty
export const LATE_INITIATOR_PENALTY = -1;

// ============================================
// REFUND REASONS (extends lib/escrow.ts)
// ============================================

export const CANCELLATION_REFUND_REASONS = {
    MUTUAL_CANCELLATION_EARLY: 'MUTUAL_CANCELLATION_EARLY',
    MUTUAL_CANCELLATION_LATE: 'MUTUAL_CANCELLATION_LATE',
    FORCE_CANCEL_OPERATOR_FAULT: 'FORCE_CANCEL_OPERATOR_FAULT',
    FORCE_CANCEL_GUIDE_FAULT: 'FORCE_CANCEL_GUIDE_FAULT',
    FORCE_CANCEL_OPERATOR_FRAUD: 'FORCE_CANCEL_OPERATOR_FRAUD',
    FORCE_CANCEL_GUIDE_FRAUD: 'FORCE_CANCEL_GUIDE_FRAUD',
    FORCE_CANCEL_NEUTRAL: 'FORCE_CANCEL_NEUTRAL'
};

// ============================================
// SUPERHERO MODE (V5: ACTIONABLE)
// ============================================

export interface SuperheroSupportOptions {
    allowSOS: boolean;
    allowAutoMatch: boolean;
    allowPriorityApply: boolean;
    allowPrioritySupport: boolean;
}

export const SUPERHERO_MODE = {
    // Message to harmed party
    notificationTitle: 'Lunavia Support Activated',
    notificationMessage:
        'The other party cancelled unilaterally for a verified reason. ' +
        'Penalties have been applied. Lunavia is here to support you.',

    // V5: Actionable support options (backend declares intent)
    supportOptions: {
        allowSOS: true,
        allowAutoMatch: true,
        allowPriorityApply: true,
        allowPrioritySupport: true
    } as SuperheroSupportOptions,

    // UI display labels
    actions: [
        { id: 'sos', label: '🆘 SOS Mode', description: 'Emergency support' },
        { id: 'rematch', label: '🔁 Find Replacement', description: 'Auto-matching' },
        { id: 'opportunities', label: '🔍 View Opportunities', description: 'Suggestions' },
        { id: 'support', label: '📞 Priority Support', description: 'Contact Ops' }
    ]
};

// ============================================
// V5: TRUST EVENT CONTEXT SNAPSHOT
// ============================================

export interface CancellationContextSnapshot {
    cancellationType: CancellationType | null;
    cancellationTiming: CancellationTiming | null;
    cancellationFaultParty: FaultParty | null;
    reviewedBy: string | null;
    escrowResolutionType: EscrowResolutionType;
}

export function buildCancellationContext(
    type: CancellationType | null,
    timing: CancellationTiming | null,
    fault: FaultParty | null,
    reviewerId: string | null,
    resolution: EscrowResolutionType = EscrowResolutionType.FULL_REFUND
): CancellationContextSnapshot {
    return {
        cancellationType: type,
        cancellationTiming: timing,
        cancellationFaultParty: fault,
        reviewedBy: reviewerId,
        escrowResolutionType: resolution
    };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Determine if cancellation is EARLY or LATE based on tour start time
 */
export function getCancellationTiming(startTime: Date): CancellationTiming {
    const now = new Date();
    const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilStart >= LATE_WINDOW_HOURS
        ? CancellationTiming.EARLY
        : CancellationTiming.LATE;
}

/**
 * Check if a force cancel reason is valid
 */
export function isValidForceCancelReason(reason: string): reason is ForceCancelReason {
    return Object.values(ForceCancelReason).includes(reason as ForceCancelReason);
}

/**
 * Check if a fault party is valid
 */
export function isValidFaultParty(party: string): party is FaultParty {
    return Object.values(FaultParty).includes(party as FaultParty);
}

/**
 * Check if NEUTRAL fault requires supervisor approval
 */
export function requiresSupervisorApproval(faultParty: FaultParty): boolean {
    return faultParty === FaultParty.NEUTRAL;
}

/**
 * V5: Get trust impact for mutual cancellation
 * Only apply penalty if LATE AND tour was ASSIGNED
 */
export function getMutualTrustImpact(
    timing: CancellationTiming,
    initiatorIsOperator: boolean,
    tourWasAssigned: boolean  // V5: Required param
): { operatorDelta: number; guideDelta: number } {
    // V5: No penalty if tour wasn't assigned (no real operational disruption)
    if (timing === CancellationTiming.EARLY || !tourWasAssigned) {
        return { operatorDelta: 0, guideDelta: 0 };
    }
    // LATE + ASSIGNED: initiator gets penalty
    return {
        operatorDelta: initiatorIsOperator ? LATE_INITIATOR_PENALTY : 0,
        guideDelta: initiatorIsOperator ? 0 : LATE_INITIATOR_PENALTY
    };
}

/**
 * Get trust impact for force cancellation
 */
export function getForceTrustImpact(faultParty: FaultParty): CancellationTrustImpact {
    return FORCE_TRUST_MATRIX[faultParty];
}

/**
 * Identify harmed party in force cancellation
 */
export function getHarmedPartyId(
    faultParty: FaultParty,
    operatorId: string,
    guideId: string | null
): string | null {
    if (!guideId) return null;

    switch (faultParty) {
        case FaultParty.OPERATOR_FAULT:
        case FaultParty.OPERATOR_FRAUD:
            return guideId; // Guide is harmed
        case FaultParty.GUIDE_FAULT:
        case FaultParty.GUIDE_FRAUD:
            return operatorId; // Operator is harmed
        case FaultParty.NEUTRAL:
            return null; // No one is "at fault"
    }
}

/**
 * V5: Check if tour is locked for edits (force cancel pending review)
 */
export function isTourLockedForReview(status: string, cancellationType: string | null): boolean {
    return status === CANCELLATION_STATUSES.FORCE_CANCEL_PENDING_REVIEW &&
        cancellationType === CancellationType.FORCE;
}

/**
 * V5: Get allowed actions during force cancel review
 */
export function getAllowedActionsDuringReview(): { allowed: string[]; blocked: string[] } {
    return {
        allowed: ['VIEW', 'UPLOAD_EVIDENCE', 'READ_STATUS'],
        blocked: ['EDIT_TOUR', 'APPLY', 'WITHDRAW', 'REASSIGN', 'CONFIRM', 'START']
    };
}

// ============================================
// V6: TIME WINDOW & COOLDOWN HELPERS
// ============================================

/**
 * V6-A1: Check if force cancel is still allowed (within 24h of tour start)
 */
export function canForceCancel(tourStartTime: Date, tourStatus: string): { allowed: boolean; reason?: string } {
    const now = new Date();

    // Force cancel NOT allowed if tour already completed
    if (tourStatus === 'COMPLETED' || tourStatus === 'CLOSED') {
        return { allowed: false, reason: 'Tour already completed — use dispute flow instead' };
    }

    // If tour hasn't started yet, always allowed
    if (tourStartTime > now) {
        return { allowed: true };
    }

    // If tour has started, check 24h window
    const hoursSinceStart = (now.getTime() - tourStartTime.getTime()) / (1000 * 60 * 60);
    if (hoursSinceStart > FORCE_CANCEL_MAX_AFTER_START_HOURS) {
        return {
            allowed: false,
            reason: `Force cancellation window expired. Max ${FORCE_CANCEL_MAX_AFTER_START_HOURS}h after tour start.`
        };
    }

    return { allowed: true };
}

/**
 * V6-A1: Check if dispute can still be opened
 */
export function canOpenDispute(tourCompletedAt: Date | null): { allowed: boolean; reason?: string } {
    if (!tourCompletedAt) {
        return { allowed: false, reason: 'Tour not yet completed' };
    }

    const now = new Date();
    const daysSinceCompletion = (now.getTime() - tourCompletedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceCompletion > DISPUTE_WINDOW_DAYS) {
        return {
            allowed: false,
            reason: `Dispute window expired. Must file within ${DISPUTE_WINDOW_DAYS} days of tour completion.`
        };
    }

    return { allowed: true };
}

/**
 * V6-A2: Check if new cancel proposal is allowed (spam protection)
 */
export function canProposeCancel(lastRejectedAt: Date | null): { allowed: boolean; reason?: string } {
    if (!lastRejectedAt) {
        return { allowed: true };
    }

    const now = new Date();
    const hoursSinceRejection = (now.getTime() - lastRejectedAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceRejection < CANCEL_PROPOSAL_COOLDOWN_HOURS) {
        const hoursRemaining = Math.ceil(CANCEL_PROPOSAL_COOLDOWN_HOURS - hoursSinceRejection);
        return {
            allowed: false,
            reason: `Please wait ${hoursRemaining}h before proposing another cancellation.`
        };
    }

    return { allowed: true };
}

/**
 * V6-A4: Check if escrow commitment should be granted
 * Only grants +1 if tour has existed 48h+ OR has applications
 */
export function shouldGrantEscrowCommitment(
    tourPublishedAt: Date,
    applicationCount: number
): boolean {
    // If any guide applied, grant immediately
    if (applicationCount > 0) {
        return true;
    }

    // Check 48h maturity
    const now = new Date();
    const hoursSincePublish = (now.getTime() - tourPublishedAt.getTime()) / (1000 * 60 * 60);

    return hoursSincePublish >= ESCROW_COMMITMENT_MIN_AGE_HOURS;
}

/**
 * V6-A5: Check if guide is in marketplace cooldown period
 */
export function isInMarketplaceCooldown(inhouseExitedAt: Date | null): { inCooldown: boolean; daysRemaining?: number } {
    if (!inhouseExitedAt) {
        return { inCooldown: false };
    }

    const now = new Date();
    const daysSinceExit = (now.getTime() - inhouseExitedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceExit < INHOUSE_EXIT_COOLDOWN_DAYS) {
        return {
            inCooldown: true,
            daysRemaining: Math.ceil(INHOUSE_EXIT_COOLDOWN_DAYS - daysSinceExit)
        };
    }

    return { inCooldown: false };
}

/**
 * V6-A3: Get visibility for a trust event type
 */
export function getTrustEventVisibility(eventType: string): boolean {
    return TRUST_EVENT_VISIBILITY[eventType] ?? true; // Default to visible if unknown
}
