/**
 * ExecutionTimelineDomain — Read-Only Execution Timeline
 *
 * Constructs a chronological timeline from REAL database records.
 * No writes — aggregates from ServiceRequest, SegmentCheckIn, Incident.
 * All entries are derived from existing data, not stored separately.
 */

import { prisma } from '@/lib/prisma';

// ── Event Types ──────────────────────────────────────────────────────

export const TIMELINE_EVENT_TYPES = {
    GUIDE_CHECKED_IN: 'GUIDE_CHECKED_IN',
    TOUR_STARTED: 'TOUR_STARTED',
    SEGMENT_ARRIVED: 'SEGMENT_ARRIVED',
    SEGMENT_STARTED: 'SEGMENT_STARTED',
    SEGMENT_COMPLETED: 'SEGMENT_COMPLETED',
    SEGMENT_SKIPPED: 'SEGMENT_SKIPPED',
    INCIDENT_REPORTED: 'INCIDENT_REPORTED',
    TOUR_COMPLETED: 'TOUR_COMPLETED',
    TOUR_CLOSED: 'TOUR_CLOSED',
} as const;

// ── Icons ─────────────────────────────────────────────────────────────

export const TIMELINE_ICONS: Record<string, string> = {
    GUIDE_CHECKED_IN: '✓',
    TOUR_STARTED: '🚩',
    SEGMENT_ARRIVED: '📍',
    SEGMENT_STARTED: '▶️',
    SEGMENT_COMPLETED: '✅',
    SEGMENT_SKIPPED: '⏭️',
    INCIDENT_REPORTED: '⚠️',
    TOUR_COMPLETED: '🏆',
    TOUR_CLOSED: '🔒',
};

// ── Normalized Timeline Event ──────────────────────────────────────

export interface TimelineEvent {
    eventType: string;
    timestamp: string;
    title: string;
    description: string | null;
    icon: string;
    segmentId?: string | null;
    metadata?: Record<string, any> | null;
}

// ── Get Timeline Events (READ ONLY) ─────────────────────────────────

async function getTimelineEvents(tourId: string): Promise<TimelineEvent[]> {
    // Load all data sources in parallel
    const [tour, checkIns, incidents] = await Promise.all([
        prisma.serviceRequest.findUnique({
            where: { id: tourId },
            select: {
                id: true,
                title: true,
                status: true,
                guideCheckedInAt: true,
                operatorStartedAt: true,
                guideReturnedAt: true,
                operatorClosedAt: true,
                returnStatus: true,
                returnNotes: true,
                closeReason: true,
                assignedGuideId: true,
            },
        }),
        prisma.segmentCheckIn.findMany({
            where: { segment: { tourId } },
            include: {
                segment: { select: { id: true, title: true, locationName: true, orderIndex: true } },
                guide: { select: { email: true } },
            },
            orderBy: { checkInTime: 'asc' },
        }),
        prisma.incident.findMany({
            where: { requestId: tourId },
            select: {
                id: true,
                description: true,
                severity: true,
                status: true,
                createdAt: true,
                reporter: { select: { email: true } },
            },
            orderBy: { createdAt: 'asc' },
        }),
    ]);

    if (!tour) return [];

    // Fetch guide email if assigned
    let guideEmail = 'Guide';
    if (tour.assignedGuideId) {
        const guide = await prisma.user.findUnique({
            where: { id: tour.assignedGuideId },
            select: { email: true },
        });
        if (guide) guideEmail = guide.email;
    }

    const events: TimelineEvent[] = [];

    // ── 1. Guide Check-In ─────────────
    if (tour.guideCheckedInAt) {
        events.push({
            eventType: TIMELINE_EVENT_TYPES.GUIDE_CHECKED_IN,
            timestamp: tour.guideCheckedInAt.toISOString(),
            title: 'Guide Checked In',
            description: `${guideEmail} checked in for the tour.`,
            icon: TIMELINE_ICONS.GUIDE_CHECKED_IN,
        });
    }

    // ── 2. Tour Started ───────────────
    if (tour.operatorStartedAt) {
        events.push({
            eventType: TIMELINE_EVENT_TYPES.TOUR_STARTED,
            timestamp: tour.operatorStartedAt.toISOString(),
            title: 'Tour Started',
            description: 'Operator started the tour.',
            icon: TIMELINE_ICONS.TOUR_STARTED,
        });
    }

    // ── 3. Segment Check-Ins ──────────
    for (const ci of checkIns) {
        const statusMap: Record<string, { type: string; titlePrefix: string }> = {
            ARRIVED: { type: TIMELINE_EVENT_TYPES.SEGMENT_ARRIVED, titlePrefix: 'Arrived at' },
            STARTED: { type: TIMELINE_EVENT_TYPES.SEGMENT_STARTED, titlePrefix: 'Started' },
            COMPLETED: { type: TIMELINE_EVENT_TYPES.SEGMENT_COMPLETED, titlePrefix: 'Completed' },
            SKIPPED: { type: TIMELINE_EVENT_TYPES.SEGMENT_SKIPPED, titlePrefix: 'Skipped' },
        };

        const mapping = statusMap[ci.status] || statusMap.ARRIVED;
        const segTitle = ci.segment.title;
        const location = ci.segment.locationName;

        events.push({
            eventType: mapping.type,
            timestamp: ci.checkInTime.toISOString(),
            title: `${mapping.titlePrefix} ${segTitle}`,
            description: [
                location,
                ci.note,
            ].filter(Boolean).join(' — ') || null,
            icon: TIMELINE_ICONS[mapping.type] || '📍',
            segmentId: ci.segment.id,
            metadata: ci.photoUrl ? { photoUrl: ci.photoUrl } : null,
        });
    }

    // ── 4. Incidents ──────────────────
    for (const inc of incidents) {
        events.push({
            eventType: TIMELINE_EVENT_TYPES.INCIDENT_REPORTED,
            timestamp: inc.createdAt.toISOString(),
            title: 'Incident Reported',
            description: inc.description,
            icon: TIMELINE_ICONS.INCIDENT_REPORTED,
            metadata: { severity: inc.severity, status: inc.status },
        });
    }

    // ── 5. Tour Completed ─────────────
    if (tour.guideReturnedAt) {
        events.push({
            eventType: TIMELINE_EVENT_TYPES.TOUR_COMPLETED,
            timestamp: tour.guideReturnedAt.toISOString(),
            title: 'Tour Completed',
            description: tour.returnNotes || `Guide returned the tour. Status: ${tour.returnStatus || 'COMPLETED'}`,
            icon: TIMELINE_ICONS.TOUR_COMPLETED,
            metadata: { returnStatus: tour.returnStatus },
        });
    }

    // ── 6. Tour Closed ────────────────
    if (tour.operatorClosedAt) {
        events.push({
            eventType: TIMELINE_EVENT_TYPES.TOUR_CLOSED,
            timestamp: tour.operatorClosedAt.toISOString(),
            title: 'Tour Closed',
            description: tour.closeReason ? `Reason: ${tour.closeReason}` : 'Operator closed the tour.',
            icon: TIMELINE_ICONS.TOUR_CLOSED,
        });
    }

    // Sort by timestamp ascending
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return events;
}

export const ExecutionTimelineDomain = {
    getTimelineEvents,
    TIMELINE_EVENT_TYPES,
    TIMELINE_ICONS,
};
