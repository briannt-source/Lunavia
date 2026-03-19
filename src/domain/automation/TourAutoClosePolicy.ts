import { Tour } from '../tour/Tour';

export class TourAutoClosePolicy {
    static shouldAutoClose(tour: Tour, hasIncidents: boolean, hasDisputes: boolean): { close: boolean; reason?: string } {
        if (tour.status !== 'COMPLETED') {
            return { close: false, reason: 'Tour not COMPLETED' };
        }

        // Logic from prompt: Close if NO incidents, NO disputes, and > 24h passed
        if (hasIncidents) {
            return { close: false, reason: 'Has active incidents' };
        }
        if (hasDisputes) {
            return { close: false, reason: 'Has active disputes' };
        }

        // Use endTime as reference; if not set, cannot determine close window
        if (!tour.endDate) {
            return { close: false, reason: 'No endTime — cannot determine close window' };
        }

        const closeTimeThreshold = new Date(tour.endDate.getTime() + 24 * 60 * 60 * 1000); // endTime + 24h
        if (Date.now() < closeTimeThreshold.getTime()) {
            return { close: false, reason: 'Less than 24h since completion' };
        }

        return { close: true, reason: 'Auto-closed: No incidents/disputes after 24h' };
    }
}
