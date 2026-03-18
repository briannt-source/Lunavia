import { Tour } from '../tour/Tour';

export class NoShowDetectionPolicy {
    static isNoShow(tour: Tour): { isNoShow: boolean; reason?: string } {
        if (tour.status !== 'ASSIGNED' && tour.status !== 'READY') {
            // Only check if expected to start
            return { isNoShow: false };
        }

        if (tour.guideCheckedInAt) {
            return { isNoShow: false };
        }

        const noShowThreshold = new Date(tour.startTime.getTime() + 30 * 60 * 1000); // Start + 30m (tourism-appropriate grace period)
        if (Date.now() > noShowThreshold.getTime()) {
            return { isNoShow: true, reason: 'Guide failed to check in 30m after start time' };
        }

        return { isNoShow: false };
    }
}
