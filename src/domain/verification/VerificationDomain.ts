/**
 * VerificationDomain — Verification Document Mutations
 *
 * Handles verification submission creation, document upload records,
 * document deletion, review actions, and rejection.
 */

import { prisma } from '@/lib/prisma';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { createDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';
import { PrismaVerificationRepository } from '@/infrastructure/repositories/PrismaVerificationRepository';

// ── Create Verification Submission ──────────────────────────────────

async function createSubmission(input: { userId: string; type: string }) {
    return prisma.verificationSubmission.create({
        data: { userId: input.userId, type: input.type, status: 'DRAFT' },
        include: { documents: true },
    });
}

// ── Create Document Record ──────────────────────────────────────────

async function createDocumentRecord(input: {
    submissionId: string; filename: string;
    originalName: string; mimeType: string; size: number; storagePath: string;
}) {
    return prisma.verificationDocument.create({ data: input });
}

// ── Delete Document Record ──────────────────────────────────────────

async function deleteDocument(documentId: string) {
    return prisma.verificationDocument.delete({ where: { id: documentId } });
}

// ── Review Verification (Approve/Reject via UseCase) ────────────────

async function logVerificationReview(input: {
    reviewerId: string; submissionId: string; action: string; reason?: string;
}) {
    return executeSimpleMutation({
        entityName: 'VerificationSubmission',
        entityId: input.submissionId,
        actorId: input.reviewerId,
        actorRole: 'ADMIN',
        auditAction: input.action === 'APPROVE' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
        metadata: { reason: input.reason },
        atomicMutation: async () => {
            return { ok: true };
        },
    });
}

// ── Admin Reject Verification ───────────────────────────────────────

async function rejectVerification(input: {
    submissionId: string; reviewerId: string; reason: string; submissionUserId: string;
}) {
    const repo = new PrismaVerificationRepository(prisma);

    return executeSimpleMutation({
        entityName: 'VerificationSubmission',
        entityId: input.submissionId,
        actorId: input.reviewerId,
        actorRole: 'ADMIN',
        auditAction: 'VERIFICATION_REJECTED',
        metadata: { reason: input.reason },
        atomicMutation: async () => {
            await repo.rejectSubmission(input.submissionId, input.reason);
            return { ok: true };
        },
        notification: async () => {
            await createDomainNotification({
                userId: input.submissionUserId,
                domain: NotificationDomain.VERIFICATION,
                targetUrl: '/dashboard/verification/status',
                type: 'VERIFICATION_REJECTED',
                title: 'Verification Requires Action',
                message: `Your verification requires additional information. Please review the feedback and resubmit.${input.reason ? ` Reason: ${input.reason}` : ''}`,
            });
        },
    });
}

// ── Admin Request Verification ──────────────────────────────────────

async function logVerificationRequest(input: { reviewerId: string; targetId: string }) {
    return executeSimpleMutation({
        entityName: 'VerificationSubmission',
        entityId: input.targetId,
        actorId: input.reviewerId,
        actorRole: 'ADMIN',
        auditAction: 'VERIFICATION_REQUESTED',
        atomicMutation: async () => {
            return { ok: true };
        },
    });
}

export const VerificationDomain = {
    createSubmission,
    createDocumentRecord,
    deleteDocument,
    logVerificationReview,
    rejectVerification,
    logVerificationRequest,
};
