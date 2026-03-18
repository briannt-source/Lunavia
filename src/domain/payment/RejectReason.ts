
export const REJECTION_REASONS = [
    'INCOMPLETE_SERVICE',
    'SCHEDULE_VIOLATION',
    'GUEST_COMPLAINT',
    'POLICY_VIOLATION',
    'OTHER',
] as const;

export type RejectReason = typeof REJECTION_REASONS[number];
