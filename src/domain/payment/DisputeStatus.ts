
export type DisputeStatus =
    | 'OPEN'
    | 'INVESTIGATING'
    | 'RESOLVED'
    | 'CLOSED';

export const DISPUTE_STATUS: Record<string, DisputeStatus> = {
    OPEN: 'OPEN',
    INVESTIGATING: 'INVESTIGATING',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED'
};
