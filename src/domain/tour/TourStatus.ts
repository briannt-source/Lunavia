export type TourStatus =
    | 'DRAFT'
    | 'OPEN'          // Published, waiting for applications
    | 'OFFERED'       // Applications received? Or Offered to specific guide? (Legacy status, keeping for compat)
    | 'ASSIGNED'      // Guide assigned
    | 'READY'         // Guide checked in (approaching start)
    | 'IN_PROGRESS'   // Started
    | 'COMPLETED'     // Finished
    | 'CLOSED'        // Archived/Finalized
    | 'CANCELLED'     // Cancelled before completion
    | 'EXPIRED'      // Open but start time passed
    | 'REOPENED';    // Reopened via Dispute resolution

export const TOUR_STATUS: Record<string, TourStatus> = {
    DRAFT: 'DRAFT',
    OPEN: 'OPEN',
    OFFERED: 'OFFERED',
    ASSIGNED: 'ASSIGNED',
    READY: 'READY',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CLOSED: 'CLOSED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
    REOPENED: 'REOPENED',
};
