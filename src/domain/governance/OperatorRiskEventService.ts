// ══════════════════════════════════════════════════════════════════════
// OperatorRiskEventService — Event-based operator risk tracking
//
// Logs granular risk events, recalculates operator risk score,
// integrates with existing RiskEngine for display signals.
// ══════════════════════════════════════════════════════════════════════

import { prisma } from '@/lib/prisma';
import type { OperatorRiskEventType } from '@prisma/client';

// ── Impact Scores ────────────────────────────────────────────────────

const IMPACT_SCORES: Record<OperatorRiskEventType, number> = {
    COMPLETED_TOUR: 1,
    LATE_PAYMENT: -5,
    TOUR_CANCELLATION: -8,
    DISPUTE_LOST: -10,
    GUIDE_COMPLAINT: -3,
};

// ── Service ──────────────────────────────────────────────────────────

export class OperatorRiskEventService {

    /**
     * Log an operator risk event with standard impact score.
     */
    static async logEvent(
        operatorId: string,
        eventType: OperatorRiskEventType,
        description: string
    ) {
        const impact = IMPACT_SCORES[eventType];

        const event = await prisma.operatorRiskEvent.create({
            data: { operatorId, eventType, impact, description },
        });

        // Recalculate risk score
        await this.recalculateRisk(operatorId);

        return event;
    }

    /**
     * Recalculate operator risk score from last 90 days of events.
     * Score is clamped to 0–100 (higher = worse).
     */
    static async recalculateRisk(operatorId: string) {
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        const events = await prisma.operatorRiskEvent.findMany({
            where: {
                operatorId,
                createdAt: { gte: ninetyDaysAgo },
            },
            select: { impact: true },
        });

        // Sum negative impacts (positive events reduce risk)
        const rawScore = events.reduce((sum, e) => {
            // Only count negative impacts toward risk
            if (e.impact < 0) return sum + Math.abs(e.impact);
            return sum;
        }, 0);

        // Subtract positive impacts (completed tours reduce risk)
        const positiveImpact = events.reduce((sum, e) => {
            if (e.impact > 0) return sum + e.impact;
            return sum;
        }, 0);

        const finalScore = Math.max(0, Math.min(100, rawScore - positiveImpact));

        await prisma.user.update({
            where: { id: operatorId },
            data: { riskScore: finalScore },
        });

        return finalScore;
    }

    /**
     * Get full risk profile for an operator.
     */
    static async getRiskProfile(operatorId: string) {
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        const [user, events, eventCounts] = await Promise.all([
            prisma.user.findUnique({
                where: { id: operatorId },
                select: { id: true, name: true, riskScore: true, trustScore: true, complianceLevel: true },
            }),
            prisma.operatorRiskEvent.findMany({
                where: { operatorId, createdAt: { gte: ninetyDaysAgo } },
                orderBy: { createdAt: 'desc' },
                take: 20,
            }),
            prisma.operatorRiskEvent.groupBy({
                by: ['eventType'],
                where: { operatorId, createdAt: { gte: ninetyDaysAgo } },
                _count: true,
            }),
        ]);

        const riskLevel = (user?.riskScore ?? 0) >= 61 ? 'RED' : (user?.riskScore ?? 0) >= 31 ? 'YELLOW' : 'GREEN';

        return {
            operatorId,
            name: user?.name,
            riskScore: user?.riskScore ?? 0,
            trustScore: user?.trustScore ?? 0,
            riskLevel,
            complianceLevel: user?.complianceLevel ?? 'STANDARD',
            recentEvents: events,
            eventBreakdown: eventCounts.reduce((acc, e) => {
                acc[e.eventType] = e._count;
                return acc;
            }, {} as Record<string, number>),
        };
    }

    /**
     * Get public-facing operator risk summary (for guides to see).
     */
    static async getPublicRiskSummary(operatorId: string) {
        const user = await prisma.user.findUnique({
            where: { id: operatorId },
            select: { trustScore: true, riskScore: true },
        });

        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        const [toursCompleted, disputeCount, latePayments] = await Promise.all([
            prisma.operatorRiskEvent.count({
                where: { operatorId, eventType: 'COMPLETED_TOUR', createdAt: { gte: ninetyDaysAgo } },
            }),
            prisma.operatorRiskEvent.count({
                where: { operatorId, eventType: 'DISPUTE_LOST', createdAt: { gte: ninetyDaysAgo } },
            }),
            prisma.operatorRiskEvent.count({
                where: { operatorId, eventType: 'LATE_PAYMENT', createdAt: { gte: ninetyDaysAgo } },
            }),
        ]);

        const riskLevel = (user?.riskScore ?? 0) >= 61 ? 'HIGH' : (user?.riskScore ?? 0) >= 31 ? 'MODERATE' : 'LOW';

        return {
            trustScore: user?.trustScore ?? 0,
            riskLevel,
            toursCompleted,
            disputeCount,
            latePayments,
        };
    }
}
