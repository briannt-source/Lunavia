import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { TOUR_STATUS } from './tour-lifecycle';
import { emitEvent } from './events';

/**
 * Part A: Auto-Close Logic for Tours
 * 
 * Rules:
 * - status === COMPLETED
 * - 24 hours passed since guideReturnedAt
 * - No Incidents linked to the tour
 * - No PaymentDisputes linked to the tour
 * - No negative feedback (severity != 'OK')
 */
export async function processAutoClose24h(): Promise<{ processed: number; errors: string[] }> {
    const now = new Date();
    const threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const errors: string[] = [];
    let processed = 0;

    try {
        // 1. Find potential tours
        const tours = await (prisma.tour as any).findMany({
            where: {
                status: TOUR_STATUS.COMPLETED,
                guideReturnedAt: { lte: threshold },
            },
            include: {
                incidents: { select: { id: true } },
                feedback: { select: { severity: true } },
                tourPaymentRequest: {
                    include: {
                        disputes: { select: { id: true } }
                    }
                }
            }
        });

        for (const tour of tours) {
            try {
                // Check blocks
                const hasIncidents = (tour as any).incidents.length > 0;
                const hasDisputes = (tour as any).tourPaymentRequest?.disputes.length ? (tour as any).tourPaymentRequest.disputes.length > 0 : false;
                const hasNegativeFeedback = (tour as any).feedback.some((f: any) => f.severity && f.severity !== 'OK');

                if (hasIncidents || hasDisputes || hasNegativeFeedback) {
                    continue; // Skip tours with issues
                }

                // 2. Auto-close transition
                await (prisma.tour as any).update({
                    where: { id: tour.id },
                    data: {
                        status: TOUR_STATUS.CLOSED,
                        operatorClosedAt: now,
                        closeReason: 'CONFIRMED',
                        closeNotes: 'Auto-closed after 24h with no issues'
                    }
                });

                // 3. Log Audit
                await logAudit({
                    userId: 'SYSTEM',
                    action: 'AUTO_CLOSE_TOUR',
                    targetType: 'ServiceRequest',
                    targetId: tour.id,
                    meta: {
                        reason: '24h safety window passed with no signals',
                        tourTitle: tour.title
                    }
                });

                // 4. Emit Event (Triggers notifications)
                await emitEvent('TOUR_CLOSED', {
                    tourId: tour.id,
                    actorId: 'SYSTEM',
                    metadata: { type: 'AUTO_CLOSE' },
                    timestamp: now
                });

                processed++;
            } catch (err) {
                errors.push(`Failed to auto-close tour ${tour.id}: ${err}`);
            }
        }
    } catch (err) {
        errors.push(`processAutoClose24h failed: ${err}`);
    }

    return { processed, errors };
}

/**
 * Internal override to reopen a tour
 */
export async function reopenTour(
    tourId: string,
    actorId: string,
    reason: string
) {
    // Verify actor holds internal role
    const actor = await prisma.user.findUnique({
        where: { id: actorId },
        select: { role: { select: { name: true } } }
    });

    if (!actor || !['OPS', 'SUPER_ADMIN'].includes(actor.role.name)) {
        throw new Error('Unauthorized: Only OPS or SUPER_ADMIN can reopen tours');
    }

    const tour = await prisma.tour.update({
        where: { id: tourId },
        data: { status: TOUR_STATUS.REOPENED }
    });

    await logAudit({
        userId: actorId,
        action: 'REOPEN_TOUR',
        targetType: 'ServiceRequest',
        targetId: tourId,
        meta: { reason }
    });

    return tour;
}
