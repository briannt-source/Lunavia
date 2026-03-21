/**
 * Execution Archive Service
 *
 * When a tour transitions to COMPLETED, this service creates an immutable
 * snapshot of all segments and check-ins. The archive includes a SHA256
 * hash for tamper detection.
 *
 * The archive is stored in the AuditLog as a governance-grade record.
 */
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export interface ExecutionSnapshot {
    tourId: string;
    tourTitle: string;
    operatorId: string;
    status: string;
    completedAt: string;
    segments: {
        id: string;
        title: string;
        type: string;
        orderIndex: number;
        plannedStartTime: string | null;
        checkIns: {
            id: string;
            guideId: string;
            checkInTime: string;
            note: string | null;
            edited: boolean;
            editReason: string | null;
        }[];
    }[];
}

/**
 * Create an immutable execution archive when a tour is completed.
 * Stores the full segment + check-in tree as a JSON snapshot with SHA256 hash.
 */
export async function createExecutionArchive(tourId: string): Promise<{
    snapshot: ExecutionSnapshot;
    hash: string;
}> {
    const tour = enrichTourCompat(await prisma.tour.findUnique({
        where: { id: tourId },
        select: {
            id: true,
            title: true,
            operatorId: true,
            status: true,
            updatedAt: true,
        },
    }));

    if (!tour) throw new Error(`Tour ${tourId} not found`);
    if (tour.status !== 'COMPLETED') {
        throw new Error(`Tour ${tourId} is not COMPLETED (status: ${tour.status})`);
    }

    const segments = await (prisma as any).tourSegment.findMany({
        where: { tourId },
        orderBy: { orderIndex: 'asc' },
        include: {
            checkIns: {
                orderBy: { checkInTime: 'asc' },
                select: {
                    id: true,
                    guideId: true,
                    checkInTime: true,
                    note: true,
                    edited: true,
                    editReason: true,
                },
            },
        },
    });

    const snapshot: ExecutionSnapshot = {
        tourId: tour.id,
        tourTitle: tour.title,
        operatorId: tour.operatorId,
        status: tour.status,
        completedAt: tour.updatedAt.toISOString(),
        segments: segments.map((seg: any) => ({
            id: seg.id,
            title: seg.title,
            type: seg.type,
            orderIndex: seg.orderIndex,
            plannedStartTime: seg.plannedStartTime?.toISOString() || null,
            checkIns: seg.checkIns.map((ci: any) => ({
                id: ci.id,
                guideId: ci.guideId,
                checkInTime: ci.checkInTime.toISOString(),
                note: ci.note,
                edited: ci.edited,
                editReason: ci.editReason,
            })),
        })),
    };

    // Generate SHA256 hash of the snapshot for tamper detection
    const snapshotJson = JSON.stringify(snapshot, null, 0);
    const hash = crypto.createHash('sha256').update(snapshotJson).digest('hex');

    // Store as immutable audit log entry
    await prisma.auditLog.create({
        data: {
            userId: 'SYSTEM',
            actorRole: 'SYSTEM',
            action: 'EXECUTION_ARCHIVE_CREATED',
            entityType: 'Tour',
            entityId: tourId,
            beforeState: undefined,
            afterState: snapshot as any,
            metadata: {
                hash,
                segmentCount: segments.length,
                checkInCount: segments.reduce((sum: number, s: any) => sum + s.checkIns.length, 0),
                archivedAt: new Date().toISOString(),
            },
            ipAddress: 'system',
        },
    });

    return { snapshot, hash };
}

/**
 * Verify that an execution archive has not been tampered with.
 * Compares the stored hash against a freshly computed hash of the snapshot.
 */
export async function verifyExecutionArchive(tourId: string): Promise<{
    valid: boolean;
    storedHash: string | null;
    computedHash: string | null;
}> {
    const archive = await prisma.auditLog.findFirst({
        where: {
            action: 'EXECUTION_ARCHIVE_CREATED',
            entityType: 'Tour',
            entityId: tourId,
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!archive || !archive.metadata) {
        return { valid: false, storedHash: null, computedHash: null };
    }

    const storedHash = (archive.metadata as any).hash;
    const snapshot = archive.afterState;

    if (!snapshot || !storedHash) {
        return { valid: false, storedHash: null, computedHash: null };
    }

    const computedHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(snapshot, null, 0))
        .digest('hex');

    return {
        valid: storedHash === computedHash,
        storedHash,
        computedHash,
    };
}
