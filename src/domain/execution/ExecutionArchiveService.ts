import { findTourCompat, enrichTourCompat, getAssignedGuideId } from '@/lib/tour-compat';
/**
 * ExecutionArchiveService — Immutable Execution Snapshots
 *
 * Creates a SHA-256 hashed snapshot of tour execution data
 * when a tour is completed. Ensures execution history cannot be altered.
 */

import { prisma } from '@/lib/prisma';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { createHash } from 'crypto';

/**
 * Create an execution archive snapshot for a completed tour
 */
async function createArchive(tourId: string) {
    // Fetch full execution data
    const tour = enrichTourCompat(await prisma.tour.findUnique({
        where: { id: tourId },
        select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
            operatorId: true,
            assignedGuideId: true,
            operatorStartedAt: true,
            guideCheckedInAt: true,
            guideReturnedAt: true,
            operatorClosedAt: true,
        },
    }));

    if (!tour) throw new Error('Tour not found');

    const segments = await prisma.tourSegment.findMany({
        where: { tourId },
        orderBy: { orderIndex: 'asc' },
        include: {
            checkIns: {
                orderBy: { createdAt: 'asc' },
                select: {
                    id: true,
                    segmentId: true,
                    guideId: true,
                    status: true,
                    checkInTime: true,
                    note: true,
                    photoUrl: true,
                    createdAt: true,
                },
            },
        },
    });

    const snapshot = {
        tour,
        segments: segments.map(seg => ({
            id: seg.id,
            title: seg.title,
            type: seg.type,
            locationName: seg.locationName,
            orderIndex: seg.orderIndex,
            plannedStartTime: seg.plannedStartTime,
            plannedEndTime: seg.plannedEndTime,
            checkIns: seg.checkIns,
        })),
        archivedAt: new Date().toISOString(),
    };

    const snapshotJson = JSON.stringify(snapshot, null, 0);
    const hash = createHash('sha256').update(snapshotJson).digest('hex');

    return executeSimpleMutation({
        entityName: 'ExecutionArchive',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        atomicMutation: async (tx) => {
            return tx.executionArchive.upsert({
                where: { tourId },
                create: { tourId, snapshot: snapshotJson, hash },
                update: { snapshot: snapshotJson, hash },
            });
        },
        auditAction: 'EXECUTION_ARCHIVED',
    });
}

/**
 * Verify archive integrity by recomputing hash
 */
async function verifyArchive(tourId: string): Promise<{ valid: boolean; hash: string }> {
    const archive = await prisma.executionArchive.findUnique({ where: { tourId } });
    if (!archive) throw new Error('Archive not found');

    const recomputedHash = createHash('sha256').update(archive.snapshot).digest('hex');
    return {
        valid: recomputedHash === archive.hash,
        hash: archive.hash,
    };
}

/**
 * Get archive for a tour
 */
async function getArchive(tourId: string) {
    return prisma.executionArchive.findUnique({ where: { tourId } });
}

export const ExecutionArchiveService = {
    createArchive,
    verifyArchive,
    getArchive,
};
