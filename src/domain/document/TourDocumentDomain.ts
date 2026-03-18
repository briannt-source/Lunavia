/**
 * TourDocumentDomain — Tour Document Management
 *
 * Handles document upload records, deletion, and listing.
 * All mutations via executeSimpleMutation.
 */

import { prisma } from '@/lib/prisma';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { createDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';

const ALLOWED_FILE_TYPES = ['PDF', 'DOCX', 'XLSX', 'PNG', 'JPG', 'JPEG'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function getFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toUpperCase() || '';
    return ALLOWED_FILE_TYPES.includes(ext) ? ext : 'OTHER';
}

// ── Upload Document Record ──────────────────────────────────────────

interface UploadDocumentInput {
    tourId: string;
    uploadedBy: string;
    fileName: string;
    storagePath: string;
    fileUrl: string;
    fileSize: number;
    description?: string;
    isImportant?: boolean;
    assignedGuideId?: string | null;
    tourTitle: string;
}

async function uploadDocument(input: UploadDocumentInput) {
    const fileType = getFileType(input.fileName);

    return executeSimpleMutation({
        entityName: 'TourDocument',
        actorId: input.uploadedBy,
        actorRole: 'OPERATOR',
        auditAction: 'DOCUMENT_UPLOADED',
        metadata: { tourId: input.tourId, fileName: input.fileName, fileType },
        atomicMutation: async (tx) => {
            const doc = await tx.tourDocument.create({
                data: {
                    tourId: input.tourId,
                    uploadedBy: input.uploadedBy,
                    fileName: input.fileName,
                    storagePath: input.storagePath,
                    fileUrl: input.fileUrl,
                    fileType,
                    fileSize: input.fileSize,
                    description: input.description || null,
                    isImportant: input.isImportant || false,
                },
            });
            return { document: doc };
        },
        notification: async () => {
            if (input.assignedGuideId) {
                await createDomainNotification({
                    userId: input.assignedGuideId,
                    domain: NotificationDomain.SYSTEM,
                    targetUrl: `/dashboard/guide/tour/${input.tourId}/live`,
                    type: 'TOUR_DOCUMENT_ADDED',
                    title: input.isImportant ? '📌 Important Document Added' : 'New Tour Document',
                    message: `A document "${input.fileName}" was uploaded for "${input.tourTitle}".`,
                    relatedId: input.tourId,
                });
            }
        },
    });
}

// ── Delete Document ──────────────────────────────────────────────────

interface DeleteDocumentInput {
    documentId: string;
    actorId: string;
    actorRole: string;
}

async function deleteDocument(input: DeleteDocumentInput) {
    const doc = await prisma.tourDocument.findUnique({ where: { id: input.documentId } });
    if (!doc) throw new Error('Document not found');

    return executeSimpleMutation({
        entityName: 'TourDocument',
        entityId: input.documentId,
        actorId: input.actorId,
        actorRole: input.actorRole,
        auditAction: 'DOCUMENT_DELETED',
        metadata: { fileName: doc.fileName, tourId: doc.tourId },
        atomicMutation: async (tx) => {
            await tx.tourDocument.delete({ where: { id: input.documentId } });
            return { deleted: true };
        },
    });
}

// ── Toggle Important ──────────────────────────────────────────────

async function toggleImportant(documentId: string, actorId: string) {
    const doc = await prisma.tourDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new Error('Document not found');

    return executeSimpleMutation({
        entityName: 'TourDocument',
        entityId: documentId,
        actorId,
        actorRole: 'OPERATOR',
        auditAction: doc.isImportant ? 'DOCUMENT_UNMARKED_IMPORTANT' : 'DOCUMENT_MARKED_IMPORTANT',
        atomicMutation: async (tx) => {
            return tx.tourDocument.update({
                where: { id: documentId },
                data: { isImportant: !doc.isImportant },
            });
        },
    });
}

// ── List Documents ──────────────────────────────────────────────────

async function listDocuments(tourId: string) {
    return prisma.tourDocument.findMany({
        where: { tourId },
        orderBy: [{ isImportant: 'desc' }, { createdAt: 'desc' }],
        select: {
            id: true,
            fileName: true,
            fileUrl: true,
            fileType: true,
            fileSize: true,
            description: true,
            isImportant: true,
            createdAt: true,
            uploader: { select: { email: true } },
        },
    });
}

export const TourDocumentDomain = {
    uploadDocument,
    deleteDocument,
    toggleImportant,
    listDocuments,
    ALLOWED_FILE_TYPES,
    MAX_FILE_SIZE,
    getFileType,
};
