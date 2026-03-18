import { Tour } from './Tour';
import { TourStatus } from './TourStatus';

export class TourPolicy {
    static canTransition(tour: Tour, targetStatus: TourStatus): { allowed: boolean; reason?: string } {
        const current = tour.status;

        if (current === targetStatus) return { allowed: true };

        const validTransitions: Record<TourStatus, TourStatus[]> = {
            DRAFT: ['OPEN', 'CANCELLED'],
            OPEN: ['ASSIGNED', 'DRAFT', 'CANCELLED', 'EXPIRED'],
            OFFERED: ['ASSIGNED', 'OPEN', 'CANCELLED'],
            ASSIGNED: ['READY', 'OPEN', 'CANCELLED'],
            READY: ['IN_PROGRESS', 'ASSIGNED', 'CANCELLED'],
            IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
            COMPLETED: ['CLOSED'],
            CLOSED: ['REOPENED'],
            CANCELLED: [],
            EXPIRED: [],
            REOPENED: ['COMPLETED', 'CLOSED']
        };

        if (validTransitions[current]?.includes(targetStatus)) {
            // Specific Logic Checks
            if (targetStatus === 'IN_PROGRESS') {
                if (!tour.guideCheckedInAt) {
                    return { allowed: false, reason: 'Guide must check-in before starting tour' };
                }
            }
            return { allowed: true };
        }

        return { allowed: false, reason: `Invalid transition from ${current} to ${targetStatus}` };
    }
}
