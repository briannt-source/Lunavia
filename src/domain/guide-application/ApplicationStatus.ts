export type ApplicationStatus =
    | 'APPLIED'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'WITHDRAWN_BY_GUIDE'
    | 'CANCELLED_BY_SYSTEM';

export const APPLICATION_STATUS: Record<string, ApplicationStatus> = {
    APPLIED: 'APPLIED',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    WITHDRAWN_BY_GUIDE: 'WITHDRAWN_BY_GUIDE',
    CANCELLED_BY_SYSTEM: 'CANCELLED_BY_SYSTEM',
};
