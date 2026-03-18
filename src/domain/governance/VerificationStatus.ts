export type VerificationStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type KYCStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export const VERIFICATION_STATUS: Record<string, VerificationStatus> = {
    NOT_SUBMITTED: 'NOT_SUBMITTED',
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};
