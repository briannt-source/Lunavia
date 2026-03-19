import { findTourCompat, enrichTourCompat, getAssignedGuideId } from '@/lib/tour-compat';

import { PaymentStatus } from './PaymentStatus';

export class PaymentPolicy {
    static canRequestPayment(
        tourStatus: string,
        assignedGuideId: string | null,
        currentUserId: string,
        guideReturnedAt: Date | null
    ): { allowed: boolean; reason?: string } {
        if (assignedGuideId !== currentUserId) {
            return { allowed: false, reason: 'You are not assigned to this tour' };
        }
        if (tourStatus !== 'COMPLETED') {
            return { allowed: false, reason: `Tour must be COMPLETED (current: ${tourStatus})` };
        }
        if (!guideReturnedAt) {
            return { allowed: false, reason: 'Tour must be returned by guide first' };
        }
        return { allowed: true };
    }

    static canDispute(paymentStatus: PaymentStatus, tourStatus: string): { allowed: boolean; reason?: string } {
        if (paymentStatus !== 'REJECTED') {
            return { allowed: false, reason: 'Can only dispute REJECTED payments' };
        }
        if (tourStatus === 'CLOSED') {
            return { allowed: false, reason: 'Cannot dispute if tour is CLOSED' };
        }
        return { allowed: true };
    }
}
