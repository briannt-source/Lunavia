/**
 * TourExecutionEventService — Structured Execution Event Tracking
 *
 * Records all execution actions with guide role for real-time monitoring.
 * Events: GUIDE_VERIFIED, PICKUP_STARTED, DEPARTURE_CONFIRMED, TOUR_STARTED,
 *         SEGMENT_CHECKED_IN, INCIDENT_REPORTED, GUIDE_REPLACED, TOUR_COMPLETED
 */

import { prisma } from '@/lib/prisma';

// ── Event Types ───────────────────────────────────────────────────────

export const EXECUTION_EVENT_TYPES = {
    GUIDE_VERIFIED: 'GUIDE_VERIFIED',
    PICKUP_STARTED: 'PICKUP_STARTED',
    DEPARTURE_CONFIRMED: 'DEPARTURE_CONFIRMED',
    TOUR_STARTED: 'TOUR_STARTED',
    SEGMENT_CHECKED_IN: 'SEGMENT_CHECKED_IN',
    INCIDENT_REPORTED: 'INCIDENT_REPORTED',
    GUIDE_REPLACED: 'GUIDE_REPLACED',
    GUIDE_PROMOTED: 'GUIDE_PROMOTED',
    TOUR_COMPLETED: 'TOUR_COMPLETED',
} as const;

export type ExecutionEventType = keyof typeof EXECUTION_EVENT_TYPES;

// ── Create Execution Event ────────────────────────────────────────────

interface CreateExecutionEventInput {
    tourId: string;
    guideId?: string;
    eventType: string;
    role?: string; // LEAD_GUIDE | ASSISTANT_GUIDE | INTERN_GUIDE
    description?: string;
    metadata?: Record<string, any>;
    isSimulation?: boolean;
}

async function createExecutionEvent(input: CreateExecutionEventInput) {
    const {
        tourId,
        guideId,
        eventType,
        role,
        description,
        metadata,
        isSimulation = false,
    } = input;

    // Build description with role context
    const roleLabel = role
        ? role.replace(/_/g, ' ').toLowerCase()
        : 'guide';

    const autoDescription = description || `${roleLabel} triggered ${eventType.replace(/_/g, ' ').toLowerCase()}.`;

    return (prisma as any).tourExecutionEvent.create({
        data: {
            tourId,
            guideId: guideId || null,
            eventType,
            role: role || null,
            description: autoDescription,
            metadata: metadata || null,
            isSimulation,
        },
    });
}

// ── Query Execution Events ────────────────────────────────────────────

async function getExecutionTimeline(tourId: string, includeSimulation = false) {
    const where: any = { tourId };
    if (!includeSimulation) {
        where.isSimulation = false;
    }

    return (prisma as any).tourExecutionEvent.findMany({
        where,
        orderBy: { createdAt: 'asc' },
    });
}

// ── Exports ───────────────────────────────────────────────────────────

export const TourExecutionEventService = {
    createExecutionEvent,
    getExecutionTimeline,
    EXECUTION_EVENT_TYPES,
};
