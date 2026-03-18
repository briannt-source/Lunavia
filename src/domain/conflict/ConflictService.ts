import { prisma } from '@/lib/prisma';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { createDomainNotification, NotificationDomain } from '../notification/NotificationService';

export class ConflictService {

    /**
     * Report a conflict/incident.
     * Triggers automatic Trust Score deduction.
     */
    static async reportConflict(data: {
        serviceRequestId: string,
        filedById: string,
        receivedById: string,
        category: string,
        description: string,
        evidenceUrl?: string
    }) {
        const result = await executeSimpleMutation({
            entityName: 'Conflict',
            actorId: data.filedById,
            actorRole: 'USER',
            auditAction: 'CONFLICT_REPORTED',
            metadata: { category: data.category, serviceRequestId: data.serviceRequestId },
            atomicMutation: async (tx) => {
                // 1. Create Conflict Record
                const conflict = await tx.conflict.create({
                    data: {
                        serviceRequestId: data.serviceRequestId,
                        filedById: data.filedById,
                        receivedById: data.receivedById,
                        category: data.category,
                        description: data.description,
                        evidenceUrl: data.evidenceUrl,
                        status: 'REPORTED'
                    },
                    include: { serviceRequest: true }
                });

                // 2. Immediate Trust Deduction
                const DEDUCTION = 5;
                const receivedByUser = await tx.user.findUnique({ where: { id: data.receivedById } });

                if (receivedByUser) {
                    const newScore = Math.max(receivedByUser.trustScore - DEDUCTION, 0);
                    await tx.user.update({
                        where: { id: data.receivedById },
                        data: { trustScore: newScore }
                    });

                    await tx.trustEvent.create({
                        data: {
                            userId: data.receivedById,
                            changeValue: -DEDUCTION,
                            newScore: newScore,
                            type: 'DISPUTE_FILED',
                            description: `Conflict reported: ${data.category}`,
                            relatedConflictId: conflict.id,
                            relatedRequestId: data.serviceRequestId
                        }
                    });
                }

                return conflict;
            },
            notification: async () => {
                // 3. Notify the accused (post-commit, non-critical)
                const conflict = await prisma.conflict.findFirst({
                    where: { serviceRequestId: data.serviceRequestId, filedById: data.filedById },
                    include: { serviceRequest: true },
                    orderBy: { createdAt: 'desc' },
                });

                if (conflict) {
                    await createDomainNotification({
                        userId: data.receivedById,
                        domain: NotificationDomain.INCIDENT,
                        targetUrl: `/dashboard/admin/incidents`,
                        type: 'CONFLICT_REPORTED',
                        title: 'New Conflict Reported',
                        message: `A conflict has been filed against you regarding tour ${conflict.serviceRequest.title}. Your trust score has been impacted.`,
                        relatedId: conflict.id,
                    });
                }
            },
        });

        return result;
    }

    /**
     * Respond to a conflict
     */
    static async respondToConflict(conflictId: string, responderId: string, response: string) {
        // Verify responder is the receivedBy user
        const conflict = await prisma.conflict.findUnique({ where: { id: conflictId } });
        if (!conflict || conflict.receivedById !== responderId) {
            throw new Error('Unauthorized or Conflict not found');
        }

        return await prisma.conflict.update({
            where: { id: conflictId },
            data: {
                response,
                respondedAt: new Date(),
                status: 'RESPONDED'
            }
        });
    }
}
