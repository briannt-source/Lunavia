import { findTourCompat, enrichTourCompat, getAssignedGuideId } from '@/lib/tour-compat';
/**
 * IncidentResolutionDomain — Structured Incident Resolution
 *
 * Lifecycle: OPEN → INVESTIGATING → RESOLVED | DISMISSED
 *
 * Resolution actions:
 *   NONE             — no impact
 *   WARNING          — guide warning logged
 *   SCORE_REDUCTION  — reliability/trust score reduced
 *   SUSPENSION       — temporary guide suspension
 *
 * Integrates with: TourHealth, ReliabilitySystem, ExecutionTimeline
 */

import { prisma } from '@/lib/prisma';

// ── Constants ────────────────────────────────────────────────────────

export const INCIDENT_STATUS = {
    OPEN: 'OPEN',
    INVESTIGATING: 'INVESTIGATING',
    RESOLVED: 'RESOLVED',
    DISMISSED: 'DISMISSED',
} as const;

export const TRUST_IMPACT = {
    NONE: 'NONE',
    WARNING: 'WARNING',
    SCORE_REDUCTION: 'SCORE_REDUCTION',
    SUSPENSION: 'SUSPENSION',
} as const;

// ── Start Investigation ───────────────────────────────────────────────

async function startInvestigation(incidentId: string, adminId: string) {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw new Error('INCIDENT_NOT_FOUND');
    if (incident.status !== 'OPEN') throw new Error('INCIDENT_NOT_OPEN');

    return prisma.incident.update({
        where: { id: incidentId },
        data: {
            status: INCIDENT_STATUS.INVESTIGATING,
            internalNotes: `Investigation started by admin ${adminId} at ${new Date().toISOString()}`,
        },
    });
}

// ── Resolve Incident ──────────────────────────────────────────────────

async function resolveIncident(params: {
    incidentId: string;
    resolvedBy: string;
    resolution: string;
    trustImpact: string;
    internalNotes?: string;
}) {
    const { incidentId, resolvedBy, resolution, trustImpact, internalNotes } = params;

    const incident = await prisma.incident.findUnique({
        where: { id: incidentId },
        include: { request: { select: { assignedGuideId: true } } },
    });
    if (!incident) throw new Error('INCIDENT_NOT_FOUND');
    if (['RESOLVED', 'DISMISSED'].includes(incident.status)) throw new Error('INCIDENT_ALREADY_CLOSED');

    // Update incident
    const updated = await (prisma as any).incident.update({
        where: { id: incidentId },
        data: {
            status: INCIDENT_STATUS.RESOLVED,
            resolution,
            resolvedBy,
            resolvedAt: new Date(),
            trustImpact,
            resolved: true,
            internalNotes: internalNotes || incident.internalNotes,
        },
    });

    // Apply trust impact to guide
    const guideId = incident.request.assignedGuideId;
    if (guideId && trustImpact !== TRUST_IMPACT.NONE) {
        await applyTrustImpact(guideId, trustImpact);
    }

    // Update tour health — if no more open incidents, revert to HEALTHY
    const remainingOpenIncidents = await (prisma as any).incident.count({
        where: { requestId: incident.requestId, resolved: false },
    });
    if (remainingOpenIncidents === 0) {
        await (prisma as any).serviceRequest.update({
            where: { id: incident.requestId },
            data: { tourHealth: 'HEALTHY' },
        });
    }

    return updated;
}

// ── Dismiss Incident ──────────────────────────────────────────────────

async function dismissIncident(incidentId: string, dismissedBy: string, reason: string) {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw new Error('INCIDENT_NOT_FOUND');

    return (prisma as any).incident.update({
        where: { id: incidentId },
        data: {
            status: INCIDENT_STATUS.DISMISSED,
            resolution: `Dismissed: ${reason}`,
            resolvedBy: dismissedBy,
            resolvedAt: new Date(),
            trustImpact: TRUST_IMPACT.NONE,
            resolved: true,
        },
    });
}

// ── Apply Trust Impact ────────────────────────────────────────────────

async function applyTrustImpact(guideId: string, impact: string) {
    const guide = await prisma.user.findUnique({
        where: { id: guideId },
        select: { reliabilityScore: true, trustScore: true },
    });
    if (!guide) return;

    switch (impact) {
        case TRUST_IMPACT.WARNING:
            // Log warning, minor reliability hit
            await prisma.user.update({
                where: { id: guideId },
                data: {
                    reliabilityScore: Math.max(0, (guide.reliabilityScore || 50) - 3),
                },
            });
            break;

        case TRUST_IMPACT.SCORE_REDUCTION:
            // Significant reliability + trust reduction
            await prisma.user.update({
                where: { id: guideId },
                data: {
                    reliabilityScore: Math.max(0, (guide.reliabilityScore || 50) - 10),
                    trustScore: Math.max(0, (guide.trustScore || 50) - 5),
                },
            });
            break;

        case TRUST_IMPACT.SUSPENSION:
            // Suspension: deactivate + heavy score reduction
            await (prisma as any).user.update({
                where: { id: guideId },
                data: {
                    isActive: false,
                    reliabilityScore: Math.max(0, (guide.reliabilityScore || 50) - 25),
                    trustScore: Math.max(0, (guide.trustScore || 50) - 15),
                },
            });
            break;
    }
}

// ── Get Open Incidents ────────────────────────────────────────────────

async function getOpenIncidents(operatorId?: string) {
    const where: any = { resolved: false };
    if (operatorId) {
        where.request = { operatorId };
    }

    return prisma.incident.findMany({
        where,
        include: {
            reporter: { select: { id: true, name: true, email: true } },
            request: { select: { id: true, title: true, operatorId: true, assignedGuideId: true } },
        },
        orderBy: [
            { severity: 'desc' },
            { createdAt: 'desc' },
        ],
        take: 50,
    });
}

// ── Exports ───────────────────────────────────────────────────────────

export const IncidentResolutionDomain = {
    startInvestigation,
    resolveIncident,
    dismissIncident,
    getOpenIncidents,
    INCIDENT_STATUS,
    TRUST_IMPACT,
};
