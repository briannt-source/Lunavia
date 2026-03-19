import { findTourCompat, enrichTourCompat, getAssignedGuideId } from '@/lib/tour-compat';
import { prisma } from '@/lib/prisma';
import { createDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';

/**
 * Step 5: Tour Event Types (FIXED - do not modify)
 */
export const TOUR_EVENT_TYPES = {
    TOUR_PUBLISHED: 'TOUR_PUBLISHED',
    GUIDE_ASSIGNED: 'GUIDE_ASSIGNED',
    GUIDE_CHECKED_IN: 'GUIDE_CHECKED_IN',
    TOUR_AUTO_STARTED: 'TOUR_AUTO_STARTED',
    TOUR_STARTED_BY_OPERATOR: 'TOUR_STARTED_BY_OPERATOR',
    INCIDENT_REPORTED: 'INCIDENT_REPORTED',
    SUPPORT_REQUESTED: 'SUPPORT_REQUESTED',
    TOUR_RETURNED: 'TOUR_RETURNED',
    PAYMENT_REQUESTED: 'PAYMENT_REQUESTED',
    PAYMENT_ACCEPTED: 'PAYMENT_ACCEPTED',
    PAYMENT_REJECTED: 'PAYMENT_REJECTED',
    TOUR_COMPLETED: 'TOUR_COMPLETED',
    TOUR_CLOSED: 'TOUR_CLOSED',
    TOUR_REOPENED_BY_INTERNAL: 'TOUR_REOPENED_BY_INTERNAL',
    NO_SHOW_DETECTED: 'NO_SHOW_DETECTED',
    // Governance events
    DISPUTE_OPENED: 'DISPUTE_OPENED',
    DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',
    GUIDE_BLACKLISTED: 'GUIDE_BLACKLISTED',
    GUIDE_UNBLACKLISTED: 'GUIDE_UNBLACKLISTED',
} as const;

export type TourEventType = keyof typeof TOUR_EVENT_TYPES;

/**
 * Actor roles for tour events
 */
export const ACTOR_ROLES = {
    GUIDE: 'GUIDE',
    OPERATOR: 'OPERATOR',
    SYSTEM: 'SYSTEM',
    INTERNAL: 'INTERNAL',
} as const;

export type ActorRole = keyof typeof ACTOR_ROLES;

/**
 * Notification rules: which events notify whom
 */
const NOTIFICATION_RULES: Record<string, { recipients: ('OPERATOR' | 'GUIDE' | 'OPS')[] }> = {
    TOUR_PUBLISHED: { recipients: ['GUIDE'] }, // Notify eligible guides? Needs filter. For now generic.
    GUIDE_ASSIGNED: { recipients: ['OPERATOR', 'GUIDE'] },
    GUIDE_CHECKED_IN: { recipients: ['OPERATOR'] },
    TOUR_AUTO_STARTED: { recipients: ['OPERATOR', 'GUIDE'] },
    TOUR_STARTED_BY_OPERATOR: { recipients: ['GUIDE'] },
    INCIDENT_REPORTED: { recipients: ['OPERATOR', 'OPS'] },
    SUPPORT_REQUESTED: { recipients: ['OPERATOR', 'OPS'] },
    TOUR_RETURNED: { recipients: ['OPERATOR'] },
    PAYMENT_REQUESTED: { recipients: ['OPERATOR'] },
    PAYMENT_ACCEPTED: { recipients: ['GUIDE'] },
    PAYMENT_REJECTED: { recipients: ['GUIDE'] },
    TOUR_COMPLETED: { recipients: ['OPERATOR'] },
    TOUR_CLOSED: { recipients: ['GUIDE'] },
    TOUR_REOPENED_BY_INTERNAL: { recipients: ['OPERATOR', 'GUIDE'] },
    NO_SHOW_DETECTED: { recipients: ['OPERATOR', 'GUIDE', 'OPS'] },
    // Governance events
    DISPUTE_OPENED: { recipients: ['OPERATOR', 'GUIDE', 'OPS'] },
    DISPUTE_RESOLVED: { recipients: ['OPERATOR', 'GUIDE'] },
    GUIDE_BLACKLISTED: { recipients: ['GUIDE'] },
    GUIDE_UNBLACKLISTED: { recipients: ['GUIDE'] },
};

/**
 * Human-readable labels for events
 */
const EVENT_LABELS: Record<string, string> = {
    TOUR_PUBLISHED: 'Tour Published',
    GUIDE_ASSIGNED: 'Guide Assigned',
    GUIDE_CHECKED_IN: 'Guide Checked In',
    TOUR_AUTO_STARTED: 'Tour Auto-Started',
    TOUR_STARTED_BY_OPERATOR: 'Tour Started by Operator',
    INCIDENT_REPORTED: 'Incident Reported',
    SUPPORT_REQUESTED: 'Support Requested',
    TOUR_RETURNED: 'Tour Returned by Guide',
    PAYMENT_REQUESTED: 'Payment Requested',
    PAYMENT_ACCEPTED: 'Payment Accepted',
    PAYMENT_REJECTED: 'Payment Rejected',
    TOUR_COMPLETED: 'Tour Completed',
    TOUR_CLOSED: 'Tour Closed',
    TOUR_REOPENED_BY_INTERNAL: 'Tour Reopened',
    NO_SHOW_DETECTED: 'No-Show Detected',
    // Governance events
    DISPUTE_OPENED: 'Dispute Opened',
    DISPUTE_RESOLVED: 'Dispute Resolved',
    GUIDE_BLACKLISTED: 'Guide Blacklisted',
    GUIDE_UNBLACKLISTED: 'Guide Removed from Blacklist',
};

export function getEventLabel(eventType: string): string {
    return EVENT_LABELS[eventType] || eventType;
}

interface CreateEventParams {
    tourId: string;
    actorId?: string | null;
    actorRole: ActorRole;
    eventType: TourEventType;
    metadata?: Record<string, any>;
}

/**
 * Create a tour event (append-only - no updates allowed)
 */
export async function createTourEvent(params: CreateEventParams) {
    const { tourId, actorId, actorRole, eventType, metadata } = params;

    const event = await (prisma as any).tourEvent.create({
        data: {
            tourId,
            actorId: actorId || null,
            actorRole,
            eventType,
            metadata: metadata ? JSON.stringify(metadata) : null,
        },
    });

    // Create notifications based on rules
    await createNotificationsForEvent(event.id, tourId, eventType);

    return event;
}

/**
 * Create notifications for the event recipients
 */
async function createNotificationsForEvent(eventId: string, tourId: string, eventType: string) {
    const rules = NOTIFICATION_RULES[eventType];
    if (!rules) return;

    // Get tour with operator and guide info
    const tour = enrichTourCompat(await prisma.tour.findUnique({
        where: { id: tourId },
        select: {
            id: true,
            title: true,
            operatorId: true,
            assignedGuideId: true,
        },
    }));

    if (!tour) return;

    const eventLabel = getEventLabel(eventType);
    const tourTitle = tour.title || 'Tour';
    const notifications: any[] = [];

    for (const recipientType of rules.recipients) {
        if (recipientType === 'OPERATOR' && tour.operatorId) {
            notifications.push({
                userId: tour.operatorId,
                title: eventLabel,
                message: `${eventLabel} for "${tourTitle}"`,
                type: eventType,
                relatedId: tourId
            });
        }
        if (recipientType === 'GUIDE' && tour.assignedGuideId) {
            notifications.push({
                userId: tour.assignedGuideId,
                title: eventLabel,
                message: `${eventLabel} for "${tourTitle}"`,
                type: eventType,
                relatedId: tourId
            });
        }
        if (recipientType === 'OPS') {
            // Notify all OPS users
            const opsUsers = await prisma.user.findMany({
                where: { role: { name: 'OPS' }, accountStatus: 'ACTIVE' },
                select: { id: true },
            });
            for (const u of opsUsers) {
                notifications.push({
                    userId: u.id,
                    title: eventLabel,
                    message: `${eventLabel} for "${tourTitle}"`,
                    type: eventType,
                    relatedId: tourId
                });
            }
        }
    }

    // Create notifications using domain factory
    if (notifications.length > 0) {
        for (const n of notifications) {
            await createDomainNotification({
                userId: n.userId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/operator/tours`,
                type: n.type,
                title: n.title,
                message: n.message,
                relatedId: n.relatedId,
            });
        }
    }
}

/**
 * Get timeline events for a tour
 */
export async function getTourTimeline(tourId: string) {
    const events = await (prisma as any).tourEvent.findMany({
        where: { tourId },
        orderBy: { createdAt: 'asc' },
    });

    return events.map((e: any) => ({
        ...e,
        label: getEventLabel(e.eventType),
        metadata: e.metadata ? JSON.parse(e.metadata) : null,
    }));
}
