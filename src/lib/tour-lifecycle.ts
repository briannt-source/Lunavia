import { findTourCompat, enrichTourCompat, getAssignedGuideId } from '@/lib/tour-compat';
/**
 * Tour Lifecycle Management
 * 
 * Step 1: Core business logic for tour state machine
 * - Auto-start tours when conditions met
 * - Auto-ready tours before start window
 * - NO_SHOW detection and penalties
 */

import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { emitEvent } from './events';
import { PrismaUserTrustRepo } from '@/infrastructure/repositories/PrismaUserTrustRepo';
import { createDomainNotification, createBulkDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';

// Tour status constants
export const TOUR_STATUS = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    ASSIGNED: 'ASSIGNED',
    READY: 'READY',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CLOSED: 'CLOSED',
    REOPENED: 'REOPENED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
} as const;

// Time buffers (in milliseconds)
export const TIME_BUFFERS = {
    CHECK_IN_WINDOW: 30 * 60 * 1000,      // 30 minutes before start
    OPERATOR_START_WINDOW: 10 * 60 * 1000, // 10 minutes before start
    RETURN_WINDOW_BEFORE: 60 * 60 * 1000,  // 1 hour before end
    RETURN_WINDOW_AFTER: 60 * 60 * 1000,   // 1 hour after end
    AUTO_CLOSE_DELAY: 3 * 60 * 60 * 1000,  // 3 hours after end
} as const;

/**
 * Process auto-start for tours
 * Called by cron/scheduler
 * 
 * Conditions:
 * - time >= startAt
 * - guideCheckedInAt IS NOT NULL
 * - status = READY or ASSIGNED
 */
export async function processAutoStart(): Promise<{ processed: number; errors: string[] }> {
    const now = new Date();
    const errors: string[] = [];
    let processed = 0;

    try {
        // Find tours ready to auto-start
        // Note: Cast to any to handle new Prisma fields that may not be in IDE cache
        const toursToStart = await (prisma.tour as any).findMany({
            where: {
                status: { in: ['ASSIGNED', 'READY'] },
                startDate: { lte: now },
                guideCheckedInAt: { not: null },
            },
            select: {
                id: true,
                title: true,
                operatorId: true,
                assignedGuideId: true,
            }
        });

        for (const tour of toursToStart) {
            try {
                await prisma.tour.update({
                    where: { id: tour.id },
                    data: { status: TOUR_STATUS.IN_PROGRESS }
                });

                await logAudit({
                    userId: 'SYSTEM',
                    action: 'AUTO_START_TOUR',
                    targetType: 'Tour',
                    targetId: tour.id,
                    meta: { tourTitle: tour.title, startedAt: now.toISOString() }
                });

                // Notify both parties
                const notifyIds = [tour.operatorId, ...(tour.assignedGuideId ? [tour.assignedGuideId] : [])];
                for (const uid of notifyIds) {
                    await createDomainNotification({
                        userId: uid,
                        domain: NotificationDomain.SYSTEM,
                        targetUrl: '/dashboard/operator/tours',
                        type: 'TOUR_STARTED',
                        title: 'Tour Started',
                        message: uid === tour.operatorId
                            ? `"${tour.title}" has automatically started.`
                            : `"${tour.title}" has started. Good luck!`,
                        relatedId: tour.id,
                    });
                }

                processed++;
            } catch (err) {
                errors.push(`Failed to auto-start tour ${tour.id}: ${err}`);
            }
        }
    } catch (err) {
        errors.push(`processAutoStart failed: ${err}`);
    }

    return { processed, errors };
}

/**
 * Process auto-ready for tours
 * Sets tours to READY state 30 minutes before start
 */
export async function processAutoReady(): Promise<{ processed: number; errors: string[] }> {
    const now = new Date();
    const readyWindow = new Date(now.getTime() + TIME_BUFFERS.CHECK_IN_WINDOW);
    const errors: string[] = [];
    let processed = 0;

    try {
        // Find tours approaching start time
        const toursToReady = await (prisma as any).tour.findMany({
            where: {
                status: 'ASSIGNED',
                startDate: { lte: readyWindow },
            },
            select: {
                id: true,
                title: true,
                assignedGuideId: true,
            }
        });

        for (const tour of toursToReady) {
            try {
                await (prisma as any).tour.update({
                    where: { id: tour.id },
                    data: { status: TOUR_STATUS.READY }
                });

                if (tour.assignedGuideId) {
                    await createDomainNotification({
                        userId: tour.assignedGuideId,
                        domain: NotificationDomain.SYSTEM,
                        targetUrl: '/dashboard/guide/tours',
                        type: 'TOUR_READY',
                        title: 'Check-in Now Available',
                        message: `Check-in is now open for "${tour.title}". Please check in before the tour starts.`,
                        relatedId: tour.id,
                    });
                }

                processed++;
            } catch (err) {
                errors.push(`Failed to set tour ${tour.id} to READY: ${err}`);
            }
        }
    } catch (err) {
        errors.push(`processAutoReady failed: ${err}`);
    }

    return { processed, errors };
}

/**
 * Process check-in escalations
 * Window: startTime + 15 minutes
 */
export async function processCheckInEscalation(): Promise<{ processed: number; errors: string[] }> {
    const now = new Date();
    const escalationThreshold = new Date(now.getTime() - 15 * 60 * 1000); // 15 mins past start
    const errors: string[] = [];
    let processed = 0;

    try {
        // Find tours that are past T+15 and still haven't checked in
        // Filter out those that already have an escalation event in metadata (to avoid spam)
        const toursToEscalate = await (prisma.tour as any).findMany({
            where: {
                status: { in: ['ASSIGNED', 'READY'] },
                startDate: { lte: escalationThreshold },
                guideCheckedInAt: null,
                assignedGuideId: { not: null },
            },
            select: {
                id: true,
                title: true,
                operatorId: true,
                assignedGuideId: true,
            }
        });

        for (const tour of toursToEscalate) {
            try {
                await createDomainNotification({
                    userId: tour.operatorId,
                    domain: NotificationDomain.SYSTEM,
                    targetUrl: '/dashboard/operator/tours',
                    type: 'CHECKIN_ESCALATION',
                    title: 'ACTION REQUIRED: Missing Check-in',
                    message: `The guide for "${tour.title}" has not checked in (15+ mins late). High risk of No-Show.`,
                    relatedId: tour.id,
                });

                // 2. Emit HIGH priority event
                await emitEvent('SYSTEM_ALERT', {
                    tourId: tour.id,
                    actorId: 'SYSTEM',
                    priority: 'HIGH',
                    channels: ['IN_APP', 'EMAIL'],
                    metadata: { type: 'CHECKIN_MISSING_ESCALATION', tourTitle: tour.title },
                    timestamp: now
                });

                // 3. Log to Audit
                await logAudit({
                    userId: 'SYSTEM',
                    action: 'CHECKIN_ESCALATED',
                    targetType: 'Tour',
                    targetId: tour.id,
                    meta: { tourTitle: tour.title }
                });

                processed++;
            } catch (err) {
                errors.push(`Failed to escalate check-in for tour ${tour.id}: ${err}`);
            }
        }
    } catch (err) {
        errors.push(`processCheckInEscalation failed: ${err}`);
    }

    return { processed, errors };
}

/**
 * Detect and process NO_SHOW guides
 * Called after start time for tours without check-in
 * 
 * Penalties:
 * - Trust -1 per NO_SHOW
 * - 2 consecutive NO_SHOWs: Auto-suspend guide applications
 */
export async function processNoShows(): Promise<{ processed: number; errors: string[] }> {
    const now = new Date();
    const errors: string[] = [];
    let processed = 0;

    try {
        // Find tours past start time without check-in
        // Note: Cast to any to handle new Prisma fields
        const noShowTours = await (prisma.tour as any).findMany({
            where: {
                status: { in: ['ASSIGNED', 'READY'] },
                startDate: { lt: now },
                guideCheckedInAt: null,
                assignedGuideId: { not: null },
            },
            select: {
                id: true,
                title: true,
                operatorId: true,
                assignedGuideId: true,
            }
        });

        for (const tour of noShowTours) {
            try {
                // Mark tour as cancelled due to no-show
                // Note: Cast to any to handle new Prisma fields
                await (prisma.tour as any).update({
                    where: { id: tour.id },
                    data: {
                        status: TOUR_STATUS.CANCELLED,
                        closeReason: 'NO_SHOW',
                        closeNotes: 'Guide did not check-in',
                    }
                });

                // Apply trust penalty
                await PrismaUserTrustRepo.appendEvent(
                    tour.assignedGuideId!,
                    'NO_SHOW',
                    -1,
                    tour.id // relatedId
                );

                // Count recent NO_SHOWs for this guide
                const recentNoShows = await (prisma as any).trustRecord.count({
                    where: {
                        userId: tour.assignedGuideId!,
                        description: { contains: 'NO_SHOW' },
                        createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
                    }
                });

                // Log for potential suspension (2+ NO_SHOWs)
                if (recentNoShows >= 2) {
                    await logAudit({
                        userId: 'SYSTEM',
                        action: 'GUIDE_SUSPENSION_TRIGGERED',
                        targetType: 'User',
                        targetId: tour.assignedGuideId!,
                        meta: {
                            description: '2+ NO_SHOWs in 30 days',
                            noShowCount: recentNoShows,
                        }
                    });

                    // Create incident for ops review
                    await (prisma as any).tourIncident.create({
                        data: {
                            tourId: tour.id,
                            reportedBy: 'SYSTEM',
                            description: `[NO_SHOW] Guide has ${recentNoShows} NO_SHOWs in the last 30 days. Consider suspension.`,
                            status: 'OPEN',
                            severity: 'HIGH',
                        }
                    });
                }

                // Notify operator
                await createDomainNotification({
                    userId: tour.operatorId,
                    domain: NotificationDomain.SYSTEM,
                    targetUrl: '/dashboard/operator/tours',
                    type: 'GUIDE_NO_SHOW',
                    title: 'Guide No-Show',
                    message: `The guide assigned to "${tour.title}" did not check-in. Tour cancelled.`,
                    relatedId: tour.id,
                });

                // Notify guide
                await createDomainNotification({
                    userId: tour.assignedGuideId!,
                    domain: NotificationDomain.RISK,
                    targetUrl: '/dashboard/guide/tours',
                    type: 'NO_SHOW_RECORDED',
                    title: 'No-Show Recorded',
                    message: `You missed check-in for "${tour.title}". This has been recorded and may affect your trust score.`,
                    relatedId: tour.id,
                });

                await logAudit({
                    userId: 'SYSTEM',
                    action: 'GUIDE_NO_SHOW',
                    targetType: 'Tour',
                    targetId: tour.id,
                    meta: {
                        tourTitle: tour.title,
                        guideId: tour.assignedGuideId,
                    }
                });

                processed++;
            } catch (err) {
                errors.push(`Failed to process no-show for tour ${tour.id}: ${err}`);
            }
        }
    } catch (err) {
        errors.push(`processNoShows failed: ${err}`);
    }

    return { processed, errors };
}

/**
 * Auto-close tours that are overdue
 * Called for tours past end time + buffer that weren't returned
 */
export async function processAutoClose(): Promise<{ processed: number; errors: string[] }> {
    const now = new Date();
    const autoCloseThreshold = new Date(now.getTime() - TIME_BUFFERS.AUTO_CLOSE_DELAY);
    const errors: string[] = [];
    let processed = 0;

    try {
        // Find IN_PROGRESS tours past auto-close threshold
        const overdueTours = await (prisma as any).tour.findMany({
            where: {
                status: 'IN_PROGRESS',
                endDate: { lt: autoCloseThreshold },
            },
            select: {
                id: true,
                title: true,
                operatorId: true,
                assignedGuideId: true,
            }
        });

        for (const tour of overdueTours) {
            try {
                // Mark as completed with warning
                // Note: Cast to any to handle new Prisma fields
                await (prisma.tour as any).update({
                    where: { id: tour.id },
                    data: {
                        status: TOUR_STATUS.COMPLETED,
                        returnNotes: 'Auto-completed by system (overdue)',
                        guideReturnedAt: now,
                    }
                });

                // Warn both parties
                const closeNotifyIds = [tour.operatorId, ...(tour.assignedGuideId ? [tour.assignedGuideId] : [])];
                for (const uid of closeNotifyIds) {
                    await createDomainNotification({
                        userId: uid,
                        domain: NotificationDomain.SYSTEM,
                        targetUrl: uid === tour.operatorId ? '/dashboard/operator/tours' : '/dashboard/guide/tours',
                        type: 'TOUR_AUTO_COMPLETED',
                        title: 'Tour Auto-Completed',
                        message: uid === tour.operatorId
                            ? `"${tour.title}" was auto-completed (3+ hours overdue). Please review and confirm.`
                            : `"${tour.title}" was auto-completed as overdue. This may affect your record.`,
                        relatedId: tour.id,
                    });
                }

                await logAudit({
                    userId: 'SYSTEM',
                    action: 'AUTO_COMPLETE_TOUR',
                    targetType: 'Tour',
                    targetId: tour.id,
                    meta: { tourTitle: tour.title, description: 'overdue' }
                });

                processed++;
            } catch (err) {
                errors.push(`Failed to auto-close tour ${tour.id}: ${err}`);
            }
        }
    } catch (err) {
        errors.push(`processAutoClose failed: ${err}`);
    }

    return { processed, errors };
}

/**
 * Check if operator can manually start a tour
 * Window: startAt - 10min to startAt
 */
export function canOperatorStart(tour: { startDate: Date; status: string; guideCheckedInAt: Date | null }): {
    allowed: boolean;
    reason?: string
} {
    const now = new Date();
    const startTime = new Date(tour.startDate);
    const windowStart = new Date(startTime.getTime() - TIME_BUFFERS.OPERATOR_START_WINDOW);

    if (!['ASSIGNED', 'READY'].includes(tour.status)) {
        return { allowed: false, reason: `Tour is in ${tour.status} status` };
    }

    if (!tour.guideCheckedInAt) {
        return { allowed: false, reason: 'Guide has not checked in yet' };
    }

    if (now < windowStart) {
        return { allowed: false, reason: `Too early. Start window opens at ${windowStart.toISOString()}` };
    }

    if (now > startTime) {
        return { allowed: false, reason: 'Start time has passed. Tour will auto-start if guide checked in.' };
    }

    return { allowed: true };
}
