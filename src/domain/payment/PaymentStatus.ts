
export type PaymentStatus =
    | 'PENDING'
    | 'ACCEPTED'
    | 'REJECTED';

export const PAYMENT_STATUS: Record<string, PaymentStatus> = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED'
};
