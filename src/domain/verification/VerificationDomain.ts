/**
 * VerificationDomain — Verification Mutations
 *
 * Handles verification submission, review actions, and rejection
 * using the Verification model from the schema.
 */

import { prisma } from '@/lib/prisma';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { createDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';

// ── Create Verification Submission ──────────────────────────────────

async function createSubmission(input: { userId: string; type?: string }) {
    // Create or update the verification record for this user
    return prisma.verification.upsert({
        where: { id: `verification-${input.userId}` },
        update: { status: 'PENDING', updatedAt: new Date() },
        create: {
            userId: input.userId,
            status: 'PENDING',
        },
    });
}

// ── Upload Document URL ─────────────────────────────────────────────

async function addDocumentUrl(input: {
    userId: string; documentType: string; url: string;
}) {
    const fieldMap: Record<string, string> = {
        photo: 'photoUrl',
        id_document: 'idDocumentUrl',
        license: 'licenseUrl',
        travel_license: 'travelLicenseUrl',
        proof_of_address: 'proofOfAddressUrl',
    };

    const field = fieldMap[input.documentType];
    if (field) {
        return prisma.verification.updateMany({
            where: { userId: input.userId },
            data: { [field]: input.url },
        });
    }

    // Fallback: append to documents array
    const existing = await prisma.verification.findFirst({ where: { userId: input.userId } });
    if (existing) {
        return prisma.verification.update({
            where: { id: existing.id },
            data: { documents: { push: input.url } },
        });
    }
    return null;
}

// ── Delete Document URL ─────────────────────────────────────────────

async function removeDocumentUrl(userId: string, documentType: string) {
    const fieldMap: Record<string, string> = {
        photo: 'photoUrl',
        id_document: 'idDocumentUrl',
        license: 'licenseUrl',
        travel_license: 'travelLicenseUrl',
        proof_of_address: 'proofOfAddressUrl',
    };

    const field = fieldMap[documentType];
    if (field) {
        const existing = await prisma.verification.findFirst({ where: { userId } });
        if (existing) {
            return prisma.verification.update({
                where: { id: existing.id },
                data: { [field]: null },
            });
        }
    }
    return null;
}

// ── Review Verification (Approve/Reject via UseCase) ────────────────

async function logVerificationReview(input: {
    reviewerId: string; verificationId: string; action: string; reason?: string;
}) {
    return executeSimpleMutation({
        entityName: 'Verification',
        entityId: input.verificationId,
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
    verificationId: string; reviewerId: string; reason: string; userId: string;
}) {
    return executeSimpleMutation({
        entityName: 'Verification',
        entityId: input.verificationId,
        actorId: input.reviewerId,
        actorRole: 'ADMIN',
        auditAction: 'VERIFICATION_REJECTED',
        metadata: { reason: input.reason },
        atomicMutation: async () => {
            await prisma.verification.update({
                where: { id: input.verificationId },
                data: {
                    status: 'REJECTED',
                    rejectionReason: input.reason,
                },
            });
            // Also update user verifiedStatus
            await prisma.user.update({
                where: { id: input.userId },
                data: { verifiedStatus: 'REJECTED' },
            });
            return { ok: true };
        },
        notification: async () => {
            await createDomainNotification({
                userId: input.userId,
                domain: NotificationDomain.VERIFICATION,
                targetUrl: '/dashboard/verification/status',
                type: 'VERIFICATION_REJECTED',
                title: 'Verification Requires Action',
                message: `Your verification requires additional information.${input.reason ? ` Reason: ${input.reason}` : ''}`,
            });
        },
    });
}

// ── Admin Request Verification ──────────────────────────────────────

async function logVerificationRequest(input: { reviewerId: string; targetId: string }) {
    return executeSimpleMutation({
        entityName: 'Verification',
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
    addDocumentUrl,
    removeDocumentUrl,
    logVerificationReview,
    rejectVerification,
    logVerificationRequest,
};
