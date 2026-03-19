/**
 * Tour Compatibility Helpers
 * 
 * The old `serviceRequest` model had several fields that don't exist on the new `Tour` model.
 * These helpers bridge the gap, providing backward-compatible lookups for domain logic.
 * 
 * Field migration map:
 *   serviceRequest.assignedGuideId → Application/Assignment (guide is assigned via relations)
 *   serviceRequest.startTime       → tour.startDate
 *   serviceRequest.endTime         → tour.endDate
 *   serviceRequest.location        → tour.city
 *   serviceRequest.totalPayout     → computed from escrowAccounts/payments
 *   serviceRequest.escrowStatus    → escrowAccount.status
 *   serviceRequest.escrowTransaction → tour.escrowAccounts (relation)
 *   serviceRequest.walletId        → wallet.userId (wallet is per-user, not per-tour)
 *   serviceRequest.rolesNeeded     → tour.mainGuideSlots + tour.subGuideSlots
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

// Re-export prisma for convenience
export { prisma };

/**
 * Include block that fetches all relations needed for backward compatibility.
 */
const COMPAT_INCLUDE = {
    operator: true,
    applications: {
        where: { status: 'ACCEPTED' as const },
        include: { guide: true },
    },
    assignments: {
        where: { status: 'ACCEPTED' as const },
        include: { guide: true },
    },
    escrowAccounts: {
        orderBy: { createdAt: 'desc' as const },
    },
    payments: true,
};

/**
 * Enrich a tour object with backward-compatible fields.
 * Adds: assignedGuideId, location, totalPayout, escrowStatus, escrowTransaction, walletId
 */
export function enrichTourCompat(tour: any) {
    if (!tour) return tour;

    // Find assigned guide from applications or assignments
    const mainAssignment = tour.assignments?.find((a: any) => a.role === 'MAIN');
    const mainApp = tour.applications?.find((a: any) => a.role === 'MAIN');
    const anyAccepted = tour.applications?.[0] || tour.assignments?.[0];

    const assignedGuideId = mainAssignment?.guideId || mainApp?.guideId || anyAccepted?.guideId || null;

    // Escrow info
    const activeEscrow = tour.escrowAccounts?.find((e: any) => e.status === 'HELD' || e.status === 'PENDING');
    const escrowStatus = activeEscrow?.status || null;
    const totalPayout = tour.escrowAccounts?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0;

    return {
        ...tour,
        assignedGuideId,
        location: tour.city,
        totalPayout,
        escrowStatus,
        escrowTransaction: activeEscrow || null,
        walletId: null,
        rolesNeeded: JSON.stringify({
            mainGuides: tour.mainGuideSlots || 1,
            subGuides: tour.subGuideSlots || 0,
        }),
        groupSize: tour.pax,
        language: tour.languages?.[0] || null,
    };
}

/**
 * Find a single tour by ID with backward-compatible fields.
 * Use this as a drop-in replacement for `prisma.tour.findUnique({ where: { id } })`.
 */
export async function findTourCompat(where: Prisma.TourWhereUniqueInput, extraInclude?: Record<string, any>) {
    const tour = await prisma.tour.findUnique({
        where,
        include: {
            ...COMPAT_INCLUDE,
            ...extraInclude,
        },
    });
    return enrichTourCompat(tour);
}

/**
 * Find multiple tours with backward-compatible fields.
 */
export async function findToursCompat(args: Omit<Prisma.TourFindManyArgs, 'include'> & { include?: Record<string, any> }) {
    const { include: extraInclude, ...rest } = args;
    const tours = await prisma.tour.findMany({
        ...rest,
        include: {
            ...COMPAT_INCLUDE,
            ...extraInclude,
        },
    } as any);
    return tours.map(enrichTourCompat);
}

/**
 * Get the primary assigned guide ID for a tour.
 */
export async function getAssignedGuideId(tourId: string): Promise<string | null> {
    const assignment = await prisma.assignment.findFirst({
        where: { tourId, status: 'ACCEPTED', role: 'MAIN' },
        select: { guideId: true },
    });
    if (assignment) return assignment.guideId;

    const application = await prisma.application.findFirst({
        where: { tourId, status: 'ACCEPTED', role: 'MAIN' },
        select: { guideId: true },
    });
    if (application) return application.guideId;

    const anyAccepted = await prisma.application.findFirst({
        where: { tourId, status: 'ACCEPTED' },
        select: { guideId: true },
    });
    return anyAccepted?.guideId ?? null;
}

/**
 * Get all assigned guide IDs for a tour.
 */
export async function getAllAssignedGuideIds(tourId: string): Promise<string[]> {
    const [assignments, applications] = await Promise.all([
        prisma.assignment.findMany({
            where: { tourId, status: 'ACCEPTED' },
            select: { guideId: true },
        }),
        prisma.application.findMany({
            where: { tourId, status: 'ACCEPTED' },
            select: { guideId: true },
        }),
    ]);
    const ids = new Set<string>();
    assignments.forEach(a => ids.add(a.guideId));
    applications.forEach(a => ids.add(a.guideId));
    return Array.from(ids);
}

/**
 * Get the active escrow for a tour.
 */
export async function getTourEscrow(tourId: string) {
    return prisma.escrowAccount.findFirst({
        where: { tourId, status: { in: ['PENDING', 'HELD'] } },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Get total payout for a tour (from escrow accounts).
 */
export async function getTourTotalPayout(tourId: string): Promise<number> {
    const result = await prisma.escrowAccount.aggregate({
        where: { tourId },
        _sum: { amount: true },
    });
    return result._sum.amount || 0;
}

/**
 * Get operator's wallet.
 */
export async function getOperatorWallet(operatorId: string) {
    return prisma.wallet.findUnique({ where: { userId: operatorId } });
}

/**
 * Check if a guide is assigned to a specific tour.
 */
export async function isGuideAssignedToTour(tourId: string, guideId: string): Promise<boolean> {
    const count = await prisma.application.count({
        where: { tourId, guideId, status: 'ACCEPTED' },
    });
    return count > 0;
}
