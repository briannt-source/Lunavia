/**
 * TrustDecayScheduler — Background Trust Decay for Inactive Operators
 *
 * Applies trust score decay to users inactive for >180 days.
 * Idempotent: uses lastDecayAppliedAt to prevent double-decay on same day.
 *
 * Formula:
 *   monthsInactive = floor((now - lastActivityAt - 180d) / 30d)
 *   decay = min(monthsInactive * 2, 20)
 *   newScore = max(0, min(currentTrust - decay, getTrustMax(category)))
 */

import { prisma } from '@/lib/prisma';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { getTrustMax, computeComplianceLevel } from '@/domain/operator/OperatorGovernance';
import { evaluateOperatorRisk, persistRiskEvaluation } from '@/domain/risk/RiskEngine';

const INACTIVITY_THRESHOLD_DAYS = 180;
const DECAY_PER_MONTH = 2;
const MAX_DECAY = 20;

interface DecayResult {
    totalEvaluated: number;
    totalDecayed: number;
    skippedAlreadyDecayed: number;
    errors: number;
    details: Array<{
        userId: string;
        previousScore: number;
        newScore: number;
        decay: number;
        monthsInactive: number;
    }>;
}

export async function runTrustDecay(): Promise<DecayResult> {
    console.log('[TRUST_DECAY] Starting trust decay scheduler...');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inactivityCutoff = new Date(
        now.getTime() - INACTIVITY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
    );

    // Find users inactive for more than 180 days
    const candidates = await prisma.user.findMany({
        where: {
            lastActivityAt: {
                not: null,
                lt: inactivityCutoff,
            },
            trustScore: { gt: 0 }, // No point decaying 0
        },
        select: {
            id: true,
            trustScore: true,
            operatorCategory: true,
            lastActivityAt: true,
            lastDecayAppliedAt: true,
            role: true,
        },
    });

    const result: DecayResult = {
        totalEvaluated: candidates.length,
        totalDecayed: 0,
        skippedAlreadyDecayed: 0,
        errors: 0,
        details: [],
    };

    for (const user of candidates) {
        try {
            // Idempotency: skip if already decayed today
            if (
                user.lastDecayAppliedAt &&
                new Date(user.lastDecayAppliedAt) >= todayStart
            ) {
                result.skippedAlreadyDecayed++;
                continue;
            }

            const lastActivity = new Date(user.lastActivityAt!);
            const daysSinceActivity = Math.floor(
                (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
            );
            const daysOverThreshold = daysSinceActivity - INACTIVITY_THRESHOLD_DAYS;
            const monthsInactive = Math.floor(daysOverThreshold / 30);

            if (monthsInactive <= 0) continue; // Edge case: not enough time passed

            const decay = Math.min(monthsInactive * DECAY_PER_MONTH, MAX_DECAY);
            const trustCap = getTrustMax(user.operatorCategory);
            const previousScore = user.trustScore;
            const newScore = Math.max(0, Math.min(previousScore - decay, trustCap));

            if (newScore === previousScore) continue; // No actual change

            // Apply decay via kernel
            await executeSimpleMutation({
                entityName: 'User',
                entityId: user.id,
                actorId: 'SYSTEM',
                actorRole: 'SYSTEM',
                auditAction: 'TRUST_DECAY_APPLIED',
                metadata: { monthsInactive, daysSinceActivity, decay, previousScore, newScore },
                atomicMutation: async (tx) => {
                    // Update trust score
                    await tx.user.update({
                        where: { id: user.id },
                        data: {
                            trustScore: newScore,
                            lastDecayAppliedAt: now,
                        },
                    });

                    // Create trust event
                    await tx.trustEvent.create({
                        data: {
                            userId: user.id,
                            type: 'DECAY',
                            changeValue: -decay,
                            newScore,
                            description: `INACTIVITY_DECAY: ${monthsInactive} months inactive, ${daysSinceActivity} days since last activity`,
                            decayPenalty: decay,
                        },
                    });

                    return { ok: true };
                },
                notification: async () => {
                    // Recompute risk (non-critical)
                    try {
                        const riskResult = await evaluateOperatorRisk(user.id);

                        const updatedUser = await prisma.user.findUnique({
                            where: { id: user.id },
                            select: { kybStatus: true },
                        });

                        const completedTours = await prisma.serviceRequest.count({
                            where: { operatorId: user.id, status: 'COMPLETED' },
                        });

                        const totalTours = await prisma.serviceRequest.count({
                            where: { operatorId: user.id },
                        });

                        const disputeRate = totalTours > 0
                            ? (await prisma.serviceRequest.count({
                                where: {
                                    operatorId: user.id,
                                    status: { in: ['CANCELLED', 'FORCE_CANCELLED'] },
                                },
                            })) / totalTours
                            : 0;

                        const compLevel = computeComplianceLevel({
                            kybStatus: updatedUser?.kybStatus || 'NOT_STARTED',
                            completedTours,
                            disputeRate,
                            riskLevel: riskResult.level,
                        });

                        await persistRiskEvaluation(user.id, riskResult.score, compLevel);
                    } catch (riskErr) {
                        console.error(`[TRUST_DECAY] Risk recompute failed for ${user.id}:`, riskErr);
                    }
                },
            });

            result.totalDecayed++;
            result.details.push({
                userId: user.id,
                previousScore,
                newScore,
                decay,
                monthsInactive,
            });
        } catch (err) {
            console.error(`[TRUST_DECAY] Error processing user ${user.id}:`, err);
            result.errors++;
        }
    }

    console.log('[TRUST_DECAY] Complete', {
        evaluated: result.totalEvaluated,
        decayed: result.totalDecayed,
        skipped: result.skippedAlreadyDecayed,
        errors: result.errors,
    });

    return result;
}
