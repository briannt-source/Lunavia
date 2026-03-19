import { differenceInHours } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { createDomainNotification, NotificationDomain } from '../notification/NotificationService';
import { getTrustMax, computeComplianceLevel } from '../operator/OperatorGovernance';
import { evaluateOperatorRisk, persistRiskEvaluation } from '../risk/RiskEngine';
import { buildTrustComponents, computeTrustScore } from '../trust/TrustFormula';
import { computeDecayPenalty } from '../trust/TrustDecay';

export class TrustService {
    /**
     * Logic to handle tour completion and award points to all parties.
     * Recomputes full trust score with all components including decay.
     */
    static async completeTourAndAwardPoints(serviceRequestId: string) {
        const result = await executeSimpleMutation({
            entityName: 'TrustEvent',
            entityId: serviceRequestId,
            actorId: 'SYSTEM',
            actorRole: 'SYSTEM',
            auditAction: 'TRUST_TOUR_COMPLETED',
            metadata: { serviceRequestId },
            atomicMutation: async (tx) => {
                // 1. Fetch Service Request and Participants
                const request = await (tx as any).serviceRequest.findUnique({
                    where: { id: serviceRequestId },
                    include: {
                        operator: {
                            select: {
                                id: true,
                                trustScore: true,
                                operatorCategory: true,
                                complianceLevel: true,
                                lastActivityAt: true,
                            }
                        },
                        applications: {
                            where: { status: 'ACCEPTED' },
                            include: { guide: true }
                        }
                    }
                });

                if (!request || request.status !== 'IN_PROGRESS') {
                    throw new Error('Tour does not exist or is not IN_PROGRESS');
                }

                // 2. Update Status to COMPLETED
                await tx.serviceRequest.update({
                    where: { id: serviceRequestId },
                    data: { status: 'COMPLETED' }
                });

                // 3. Recompute full operator trust with breakdown + decay
                const operatorId = request.operatorId;
                const category = request.operator.operatorCategory;

                // Gather operator stats for full recomputation
                const [completedTours, totalTours, totalPayments, disputeCount, negativeEvents] = await Promise.all([
                    tx.serviceRequest.count({ where: { operatorId, status: 'COMPLETED' } }),
                    tx.serviceRequest.count({ where: { operatorId } }),
                    tx.serviceRequest.count({ where: { operatorId, status: 'COMPLETED' } }),
                    tx.conflict.count({ where: { OR: [{ filedById: operatorId }, { receivedById: operatorId }] } }),
                    tx.trustEvent.findMany({
                        where: {
                            userId: operatorId,
                            changeValue: { lt: 0 },
                            createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
                        },
                        select: { type: true, changeValue: true },
                    }),
                ]);

                // Calculate operational/financial penalties from recent events
                const operationalPenalty = negativeEvents
                    .filter(e => ['LATE_CANCELLATION', 'NO_SHOW', 'MANUAL_ADJUSTMENT'].includes(e.type) && e.changeValue < 0)
                    .reduce((sum, e) => sum + Math.abs(e.changeValue), 0);
                const financialPenalty = Math.min(disputeCount * 15, 45);

                // Compute decay penalty
                const decayPenalty = computeDecayPenalty(request.operator.lastActivityAt);

                // Build full trust components
                const components = buildTrustComponents({
                    category,
                    complianceLevel: request.operator.complianceLevel || 'STANDARD',
                    completedTours,
                    totalTours,
                    totalPayments,
                    disputeCount,
                    operationalPenalty,
                    financialPenalty,
                    riskPenalty: decayPenalty,
                });

                const newOperatorScore = computeTrustScore(components, category);

                await (tx as any).user.update({
                    where: { id: operatorId },
                    data: {
                        trustScore: newOperatorScore,
                        lastActivityAt: new Date(),
                    },
                });

                // Store trust event with breakdown snapshot
                const changeValue = newOperatorScore - request.operator.trustScore;
                await (tx as any).trustEvent.create({
                    data: {
                        userId: operatorId,
                        changeValue,
                        newScore: newOperatorScore,
                        type: 'TOUR_COMPLETED',
                        description: `Completed tour: ${request.title}`,
                        relatedRequestId: serviceRequestId,
                        legalBase: components.legalBase,
                        complianceScore: components.complianceScore,
                        performanceScore: components.performanceScore,
                        financialBehavior: components.financialBehavior,
                        operationalPenalty: components.operationalPenalty,
                        financialPenalty: components.financialPenalty,
                        riskPenalty: components.riskPenalty,
                        decayPenalty,
                    }
                });

                // 4. Update Guides
                const GUIDE_POINTS: Record<string, number> = {
                    'MAIN_GUIDE': 3,
                    'SUB_GUIDE': 1,
                    'INTERN': 1
                };

                const guideNotifs: { guideId: string; points: number }[] = [];

                for (const app of request.applications) {
                    const pointsToAward = GUIDE_POINTS[app.roleApplied] || 1;
                    const newGuideScore = Math.min(app.guide.trustScore + pointsToAward, 100);

                    await tx.user.update({
                        where: { id: app.guideId },
                        data: { trustScore: newGuideScore }
                    });

                    await tx.trustEvent.create({
                        data: {
                            userId: app.guideId,
                            changeValue: pointsToAward,
                            newScore: newGuideScore,
                            type: 'TOUR_COMPLETED',
                            description: `Completed tour as ${app.roleApplied}: ${request.title}`,
                            relatedRequestId: serviceRequestId
                        }
                    });

                    guideNotifs.push({ guideId: app.guideId, points: pointsToAward });
                }

                return {
                    success: true,
                    message: 'Tour completed and scores updated.',
                    operatorId,
                    serviceRequestId,
                    requestTitle: request.title,
                    guideNotifs,
                    newOperatorScore,
                };
            },
            notification: async () => {
                // Post-transaction: evaluate risk + update compliance (best-effort)
                try {
                    const sr = enrichTourCompat(await prisma.tour.findUnique({
                        where: { id: serviceRequestId },
                        select: { operatorId: true },
                    }));
                    if (sr) {
                        const operatorId = sr.operatorId;
                        const riskResult = await evaluateOperatorRisk(operatorId);
                        const [completedTours, conflictCount, totalTours] = await Promise.all([
                            prisma.tour.count({ where: { operatorId, status: 'COMPLETED' } }),
                            prisma.conflict.count({ where: { OR: [{ filedById: operatorId }, { receivedById: operatorId }] } }),
                            prisma.tour.count({ where: { operatorId } }),
                        ]);
                        const disputeRate = totalTours > 0 ? conflictCount / totalTours : 0;
                        const operatorData = await prisma.user.findUnique({ where: { id: operatorId }, select: { kybStatus: true } });
                        const complianceLevel = computeComplianceLevel({
                            kybStatus: operatorData?.kybStatus || 'NOT_STARTED',
                            completedTours,
                            disputeRate,
                            riskLevel: riskResult.level,
                        });
                        await persistRiskEvaluation(operatorId, riskResult.score, complianceLevel);
                    }
                } catch (err) {
                    console.error('Risk evaluation after tour completion failed (best-effort):', err);
                }
            },
        }));

        // Post-transaction: send trust score notifications (non-critical, best-effort)
        for (const g of result.guideNotifs ?? []) {
            await createDomainNotification({
                userId: g.guideId,
                domain: NotificationDomain.GOVERNANCE,
                targetUrl: '/dashboard/guide/tours',
                type: 'TRUST_SCORE_CHANGE',
                title: 'Trust Score Update',
                message: `You earned +${g.points} Trust Points for completing ${result.requestTitle}.`,
                relatedId: result.serviceRequestId,
            }).catch(() => { });
        }

        await createDomainNotification({
            userId: result.operatorId,
            domain: NotificationDomain.GOVERNANCE,
            targetUrl: '/dashboard/operator/tours',
            type: 'TRUST_SCORE_CHANGE',
            title: 'Trust Score Update',
            message: `Tour completed. Trust score updated to ${result.newOperatorScore}.`,
            relatedId: result.serviceRequestId,
        }).catch(() => { });

        return result;
    }

    /**
     * Logic for Late Cancellation Penalty
     */
    static async cancelTourWithPenalty(serviceRequestId: string, operatorId: string) {
        return executeSimpleMutation({
            entityName: 'ServiceRequest',
            entityId: serviceRequestId,
            actorId: operatorId,
            actorRole: 'OPERATOR',
            auditAction: 'LATE_CANCELLATION_PENALTY',
            metadata: { serviceRequestId },
            atomicMutation: async (tx) => {
                const request = await tx.serviceRequest.findUnique({
                    where: { id: serviceRequestId },
                    include: { operator: true }
                });

                if (!request || request.operatorId !== operatorId) {
                    throw new Error('Unauthorized or Request not found');
                }

                if (['COMPLETED', 'CANCELLED'].includes(request.status)) {
                    throw new Error('Tour is already closed.');
                }

                const now = new Date();
                const hoursUntilStart = differenceInHours(new Date(request.startDate), now);
                let penaltyPoints = 0;
                let isLastMinute = false;

                if (hoursUntilStart < 6) {
                    penaltyPoints = 20;
                    isLastMinute = true;
                } else if (hoursUntilStart < 24) {
                    penaltyPoints = 10;
                    isLastMinute = true;
                }

                await tx.serviceRequest.update({
                    where: { id: serviceRequestId },
                    data: { status: 'CANCELLED' }
                });

                if (isLastMinute) {
                    const newScore = Math.max(request.operator.trustScore - penaltyPoints, 0);

                    await tx.user.update({
                        where: { id: operatorId },
                        data: { trustScore: newScore }
                    });

                    await tx.trustEvent.create({
                        data: {
                            userId: operatorId,
                            changeValue: -penaltyPoints,
                            newScore: newScore,
                            type: 'MANUAL_ADJUSTMENT',
                            description: `Last-minute cancellation (${hoursUntilStart}h before): ${request.title}`,
                            relatedRequestId: serviceRequestId
                        }
                    });
                }

                return {
                    success: true,
                    penaltyApplied: penaltyPoints,
                    message: isLastMinute ? `Cancelled with ${penaltyPoints} pts penalty.` : 'Cancelled successfully.'
                };
            },
        });
    }

    /**
     * Get Trust Evolution History
     */
    static async getTrustHistory(userId: string) {
        return await (prisma as any).trustEvent.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            select: {
                createdAt: true,
                newScore: true,
                changeValue: true,
                type: true,
                description: true,
                legalBase: true,
                complianceScore: true,
                performanceScore: true,
                financialBehavior: true,
                operationalPenalty: true,
                financialPenalty: true,
                riskPenalty: true,
                decayPenalty: true,
            }
        });
    }
}
