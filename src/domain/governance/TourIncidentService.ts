// ══════════════════════════════════════════════════════════════════════
// TourIncidentService — Typed incident reporting during tour execution
//
// Creates structured incidents with type categories, links to timeline,
// and provides stats for tour health monitoring.
// ══════════════════════════════════════════════════════════════════════

import { prisma } from '@/lib/prisma';
import type { IncidentType } from '@prisma/client';

export class TourIncidentService {

    /**
     * Report an incident during tour execution.
     * Creates INCIDENT_REPORTED timeline event.
     */
    static async reportIncident(params: {
        tourId: string;
        reportedBy: string;
        type: IncidentType;
        description: string;
        isSimulation?: boolean;
    }) {
        const { tourId, reportedBy, type, description, isSimulation = false } = params;

        // Verify tour exists
        const tour = await prisma.serviceRequest.findUnique({
            where: { id: tourId },
            select: { id: true, operatorId: true, assignedGuideId: true },
        });
        if (!tour) throw new Error('Tour not found');

        // Create incident
        const incident = await prisma.tourIncident.create({
            data: { tourId, reportedBy, type, description, isSimulation },
        });

        // Determine actor role
        let actorRole = 'SYSTEM';
        if (tour.operatorId === reportedBy) actorRole = 'OPERATOR';
        else if (tour.assignedGuideId === reportedBy) actorRole = 'GUIDE';

        // Create timeline event
        await prisma.tourTimelineEvent.create({
            data: {
                tourId,
                actorId: reportedBy,
                actorRole,
                eventType: 'INCIDENT_REPORTED',
                title: `Incident: ${type.replace(/_/g, ' ')}`,
                description,
                metadata: JSON.stringify({
                    incidentId: incident.id,
                    type,
                    isSimulation,
                }),
            },
        });

        return incident;
    }

    /**
     * Get all incidents for a tour.
     */
    static async getIncidents(tourId: string) {
        return prisma.tourIncident.findMany({
            where: { tourId },
            include: {
                reporter: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get incident statistics for an operator (for tour health).
     */
    static async getIncidentStats(operatorId: string) {
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        const [total, byType] = await Promise.all([
            prisma.tourIncident.count({
                where: {
                    tour: { operatorId },
                    createdAt: { gte: ninetyDaysAgo },
                },
            }),
            prisma.tourIncident.groupBy({
                by: ['type'],
                where: {
                    tour: { operatorId },
                    createdAt: { gte: ninetyDaysAgo },
                },
                _count: true,
            }),
        ]);

        return {
            totalIncidents: total,
            byType: byType.reduce((acc, e) => {
                acc[e.type] = e._count;
                return acc;
            }, {} as Record<string, number>),
        };
    }
}
