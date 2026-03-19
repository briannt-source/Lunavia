import { findTourCompat, enrichTourCompat, getAssignedGuideId } from '@/lib/tour-compat';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface LogLocationPingInput {
    tourId: string;
    guideId: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
}

/**
 * Creates a new location ping for a guide on an active tour.
 * Verifies that the tour is currently IN_PROGRESS and the guide is assigned to it before saving.
 */
async function logLocationPing(input: LogLocationPingInput) {
    const { tourId, guideId, latitude, longitude, accuracy, speed, heading } = input;

    // Fast check: Ensure tour is actually in progress and guide is assigned.
    // If we want ultra-high throughput, we could cache this in Redis. For now DB is fine.
    const tour = enrichTourCompat(await prisma.tour.findUnique({
        where: { id: tourId },
        select: { status: true, assignedGuideId: true }
    }));

    if (!tour) throw new Error('NOT_FOUND');
    if (tour.status !== 'IN_PROGRESS') throw new Error('TOUR_NOT_ACTIVE');
    
    // We explicitly check assignedGuideId, but in a multi-guide setup we might check team members.
    // Assuming the ping comes from the assigned guide for now.
    if (tour.assignedGuideId !== guideId) {
        // Fallback: check team members if lead guide check fails
        const teamMember = await prisma.tourTeamMember.findFirst({
            where: { tourId, userId: guideId, status: 'ACTIVE' }
        });
        if (!teamMember) throw new Error('FORBIDDEN');
    }

    const ping = await prisma.tourLocationPing.create({
        data: {
            tourId,
            guideId,
            latitude,
            longitude,
            accuracy,
            speed,
            heading
        }
    });

    return ping;
}

/**
 * Retrieves the latest location ping for all IN_PROGRESS tours governed by the given Operator.
 */
async function getLiveOperatorFleet(operatorId: string) {
    // 1. Get all IN_PROGRESS tours for this operator
    const activeTours = await prisma.tour.findMany({
        where: { 
            operatorId, 
            status: 'IN_PROGRESS' 
        },
        select: {
            id: true,
            title: true,
            assignedGuideId: true,
            operatorStartedAt: true,
            location: true,
        }
    });

    if (activeTours.length === 0) return [];

    const tourIds = activeTours.map(t => t.id);

    // Fetch guide info separately using a second query to avoid type complexity
    const guideIds = [...new Set(activeTours.map(t => t.assignedGuideId).filter(Boolean) as string[])];
    const guides = await prisma.user.findMany({
        where: { id: { in: guideIds } },
        select: { id: true, name: true, email: true, avatarUrl: true }
    });
    const guideMap = new Map(guides.map(g => [g.id, g]));

    // 2. Get the SINGLE latest ping for each of these tours
    // PostgreSQL DISTINCT ON is the most efficient, but Prisma doesn't natively support it easily without rawQuery.
    // Since fleet sizes aren't massive yet, fetching the latest 1 for each tour via a loop or groupBy is acceptable.
    // Given the real-time nature, a raw query is best here for performance.

    const pingsRaw = await prisma.$queryRaw`
        SELECT DISTINCT ON ("tourId") 
            id, "tourId", "guideId", latitude, longitude, accuracy, speed, heading, timestamp
        FROM "TourLocationPing"
        WHERE "tourId" IN (${tourIds.length > 0 ? Prisma.join(tourIds) : Prisma.empty})
        ORDER BY "tourId", timestamp DESC
    `;

    const pings = pingsRaw as any[];
    const pingMap = new Map(pings.map(p => [p.tourId, p]));

    return activeTours.map(tour => {
        const latestPing = pingMap.get(tour.id);
        const guide = tour.assignedGuideId ? guideMap.get(tour.assignedGuideId) : null;
        
        return {
            tourId: tour.id,
            tourTitle: tour.title,
            guideName: guide?.name || guide?.email?.split('@')[0] || 'Unknown Guide',
            guideAvatar: guide?.avatarUrl,
            startedAt: tour.operatorStartedAt,
            plannedLocation: tour.location,
            currentLocation: latestPing ? {
                latitude: latestPing.latitude,
                longitude: latestPing.longitude,
                accuracy: latestPing.accuracy,
                speed: latestPing.speed,
                heading: latestPing.heading,
                lastUpdate: latestPing.timestamp
            } : null // Null means guide hasn't transmitted GPS yet
        };
    });
}

/**
 * Super Admin: Retrieves the latest location ping for ALL currently IN_PROGRESS tours platform-wide.
 */
async function getLivePlatformFleet() {
    const activeTours = await prisma.tour.findMany({
        where: { status: 'IN_PROGRESS' },
        select: {
            id: true,
            title: true,
            assignedGuideId: true,
            operatorId: true
        }
    });

    if (activeTours.length === 0) return [];
    
    // Fetch users for joining via Map
    const userIds = [...new Set([
        ...activeTours.map(t => t.assignedGuideId).filter(Boolean),
        ...activeTours.map(t => t.operatorId).filter(Boolean)
    ] as string[])];
    
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true }
    });
    const userMap = new Map(users.map(u => [u.id, u]));
    
    const tourIds = activeTours.map(t => t.id);

    const pingsRaw = await prisma.$queryRaw`
        SELECT DISTINCT ON ("tourId") 
            id, "tourId", "guideId", latitude, longitude, accuracy, speed, heading, timestamp
        FROM "TourLocationPing"
        WHERE "tourId" IN (${tourIds.length > 0 ? Prisma.join(tourIds) : Prisma.empty})
        ORDER BY "tourId", timestamp DESC
    `;

    const pings = pingsRaw as any[];
    const pingMap = new Map(pings.map(p => [p.tourId, p]));

    return activeTours.map((tour: any) => {
        const latestPing = pingMap.get(tour.id);
        const op = userMap.get(tour.operatorId);
        const g = tour.assignedGuideId ? userMap.get(tour.assignedGuideId) : null;
        
        return {
            tourId: tour.id,
            tourTitle: tour.title,
            operatorName: op?.name || op?.email || 'Unknown',
            guideName: g?.name || g?.email || 'Unknown',
            currentLocation: latestPing ? {
                latitude: latestPing.latitude,
                longitude: latestPing.longitude,
                lastUpdate: latestPing.timestamp
            } : null
        };
    });
}

export const LiveTrackingDomain = {
    logLocationPing,
    getLiveOperatorFleet,
    getLivePlatformFleet
};
