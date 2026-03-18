/**
 * Escrow Governance Constants
 * Constitution-aligned payment governance for Lunavia
 */

// ============================================
// REFUND REASONS
// ============================================

export enum RefundReason {
    // Operator-fault
    OPERATOR_CANCELLED = 'OPERATOR_CANCELLED',
    OPERATOR_INTERNAL_ISSUE = 'OPERATOR_INTERNAL_ISSUE',
    OPERATOR_FRAUD = 'OPERATOR_FRAUD',

    // Guide-fault
    GUIDE_NO_SHOW = 'GUIDE_NO_SHOW',
    GUIDE_QUALITY_ISSUE = 'GUIDE_QUALITY_ISSUE',
    GUIDE_CONTRACT_VIOLATION = 'GUIDE_CONTRACT_VIOLATION',

    // Neutral (REQUIRES dual-approval + documentation)
    FORCE_MAJEURE = 'FORCE_MAJEURE',
    CLIENT_CANCELLATION = 'CLIENT_CANCELLATION',
    MEDICAL_EMERGENCY = 'MEDICAL_EMERGENCY',

    // Dispute resolution
    DISPUTE_RESOLVED_OPERATOR_FAVOR = 'DISPUTE_RESOLVED_OPERATOR_FAVOR',
    DISPUTE_RESOLVED_GUIDE_FAVOR = 'DISPUTE_RESOLVED_GUIDE_FAVOR'
}

// Reasons that require dual-approval + documentation
export const NEUTRAL_REASONS_REQUIRING_DUAL_APPROVAL: RefundReason[] = [
    RefundReason.FORCE_MAJEURE,
    RefundReason.MEDICAL_EMERGENCY
];

// All valid refund reasons
export const VALID_REFUND_REASONS = Object.values(RefundReason);

// ============================================
// TRUST IMPACT MATRIX
// ============================================

export interface TrustImpact {
    operatorDelta: number;
    guideDelta: number;
    notes: string;
}

export const REFUND_TRUST_MATRIX: Record<RefundReason, TrustImpact> = {
    // Operator-fault
    [RefundReason.OPERATOR_CANCELLED]: {
        operatorDelta: -3,
        guideDelta: 0,
        notes: 'Operator broke commitment'
    },
    [RefundReason.OPERATOR_INTERNAL_ISSUE]: {
        operatorDelta: -2,
        guideDelta: 0,
        notes: 'Less severe — operational issue'
    },
    [RefundReason.OPERATOR_FRAUD]: {
        operatorDelta: -20,
        guideDelta: 0,
        notes: 'Immediate account review required'
    },

    // Guide-fault
    [RefundReason.GUIDE_NO_SHOW]: {
        operatorDelta: 1,
        guideDelta: -10,
        notes: 'Guide broke core obligation'
    },
    [RefundReason.GUIDE_QUALITY_ISSUE]: {
        operatorDelta: 1,
        guideDelta: -5,
        notes: 'Based on complaint + evidence'
    },
    [RefundReason.GUIDE_CONTRACT_VIOLATION]: {
        operatorDelta: 1,
        guideDelta: -7,
        notes: 'Legal exposure for guide'
    },

    // Neutral (no-fault)
    [RefundReason.FORCE_MAJEURE]: {
        operatorDelta: 0,
        guideDelta: 0,
        notes: 'External force — requires documentation'
    },
    [RefundReason.CLIENT_CANCELLATION]: {
        operatorDelta: 0,
        guideDelta: -1,
        notes: 'Minor impact — guide loses potential'
    },
    [RefundReason.MEDICAL_EMERGENCY]: {
        operatorDelta: 0,
        guideDelta: 0,
        notes: 'Verified medical docs required'
    },

    // Dispute resolution
    [RefundReason.DISPUTE_RESOLVED_OPERATOR_FAVOR]: {
        operatorDelta: 0,
        guideDelta: -5,
        notes: 'Guide lost formal dispute'
    },
    [RefundReason.DISPUTE_RESOLVED_GUIDE_FAVOR]: {
        operatorDelta: -5,
        guideDelta: 3,
        notes: 'Operator lost dispute'
    }
};

// ============================================
// ESCROW TRUST EVENTS
// ============================================

export const ESCROW_TRUST_EVENTS = {
    // Commitment signal (not core — can be neutralized)
    ESCROW_HELD: {
        delta: 1,
        description: 'Commitment signal — can be reversed if tour cancelled before COMPLETED'
    },

    // Core trust events
    TOUR_COMPLETED_NO_DISPUTE: {
        delta: 5,
        description: 'Tour completed successfully with no disputes'
    },
    PAYMENT_RELEASED: {
        delta: 3,
        description: 'Payment released to guide'
    },
    EARLY_PAYMENT_RELEASE: {
        delta: 2,
        description: 'Payment released within 24h of completion'
    },

    // Negative events
    PUBLISH_THEN_CANCEL: {
        delta: -3,
        description: 'Tour published then cancelled within 7 days'
    },
    ESCROW_HELD_REVERSED: {
        delta: -1,
        description: 'ESCROW_HELD trust reversed due to cancellation before completion'
    }
};

// ============================================
// TOP-UP GOVERNANCE
// ============================================

export const TOP_UP_GOVERNANCE = {
    // Never expose individual staff to operators
    DISPLAY_APPROVER_AS: 'Finance Team',

    // Estimated review time (for UX messaging)
    ESTIMATED_REVIEW_HOURS_MIN: 4,
    ESTIMATED_REVIEW_HOURS_MAX: 24,

    // Auto-escalation threshold
    ESCALATION_HOURS: 24,

    // Minimum top-up amount (VND)
    MINIMUM_AMOUNT: 100000
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function requiresDualApproval(reason: RefundReason): boolean {
    return NEUTRAL_REASONS_REQUIRING_DUAL_APPROVAL.includes(reason);
}

export function getTrustImpact(reason: RefundReason): TrustImpact {
    return REFUND_TRUST_MATRIX[reason];
}

export function isValidRefundReason(reason: string): reason is RefundReason {
    return VALID_REFUND_REASONS.includes(reason as RefundReason);
}

/**
 * Calculate hours since a date
 */
export function hoursSince(date: Date): number {
    return (Date.now() - date.getTime()) / (1000 * 60 * 60);
}

/**
 * Check if a top-up should be escalated
 */
export function shouldEscalate(createdAt: Date): boolean {
    return hoursSince(createdAt) > TOP_UP_GOVERNANCE.ESCALATION_HOURS;
}
