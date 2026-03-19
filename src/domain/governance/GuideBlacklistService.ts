import { findTourCompat, enrichTourCompat, getAssignedGuideId } from '@/lib/tour-compat';
// ══════════════════════════════════════════════════════════════════════
// GuideBlacklistService — Operator-specific guide blocking
//
// Allows operators to prevent problematic guides from applying.
// Enforced at application time via isBlacklisted() check.
// ══════════════════════════════════════════════════════════════════════

import { prisma } from '@/lib/prisma';

export class GuideBlacklistService {

    /**
     * Add a guide to an operator's blacklist.
     * Creates GUIDE_BLACKLISTED timeline event on most recent shared tour.
     */
    static async blacklistGuide(operatorId: string, guideId: string, reason: string) {
        // Prevent self-blacklisting
        if (operatorId === guideId) throw new Error('Cannot blacklist yourself');

        // Verify guide exists and is a guide
        const guide = await prisma.user.findUnique({
            where: { id: guideId },
            select: { id: true, name: true, role: { select: { name: true } } },
        });
        if (!guide) throw new Error('Guide not found');
        if (guide.role.name !== 'TOUR_GUIDE') throw new Error('User is not a tour guide');

        // Check if already blacklisted
        const existing = await prisma.guideBlacklist.findUnique({
            where: { operatorId_guideId: { operatorId, guideId } },
        });
        if (existing) throw new Error('Guide is already blacklisted');

        const entry = await prisma.guideBlacklist.create({
            data: { operatorId, guideId, reason },
        });

        // Create timeline event on most recent shared tour (if any)
        const recentTour = await prisma.tour.findFirst({
            where: { operatorId, assignedGuideId: guideId },
            orderBy: { createdAt: 'desc' },
            select: { id: true },
        });
        if (recentTour) {
            await prisma.tourTimelineEvent.create({
                data: {
                    tourId: recentTour.id,
                    actorId: operatorId,
                    actorRole: 'OPERATOR',
                    eventType: 'GUIDE_BLACKLISTED',
                    title: 'Guide Blacklisted',
                    description: `Guide ${guide.name || guideId} blacklisted: ${reason}`,
                    metadata: JSON.stringify({ guideId, reason }),
                },
            });
        }

        return entry;
    }

    /**
     * Remove a guide from an operator's blacklist.
     */
    static async unblacklistGuide(operatorId: string, guideId: string) {
        const entry = await prisma.guideBlacklist.findUnique({
            where: { operatorId_guideId: { operatorId, guideId } },
        });
        if (!entry) throw new Error('Guide is not blacklisted');

        await prisma.guideBlacklist.delete({
            where: { id: entry.id },
        });

        // Create timeline event
        const recentTour = await prisma.tour.findFirst({
            where: { operatorId, assignedGuideId: guideId },
            orderBy: { createdAt: 'desc' },
            select: { id: true },
        });
        if (recentTour) {
            await prisma.tourTimelineEvent.create({
                data: {
                    tourId: recentTour.id,
                    actorId: operatorId,
                    actorRole: 'OPERATOR',
                    eventType: 'GUIDE_UNBLACKLISTED',
                    title: 'Guide Removed from Blacklist',
                    description: `Guide ${guideId} removed from blacklist`,
                    metadata: JSON.stringify({ guideId }),
                },
            });
        }

        return { success: true };
    }

    /**
     * Check if a guide is blacklisted by an operator.
     * Used at guide application time.
     */
    static async isBlacklisted(operatorId: string, guideId: string): Promise<boolean> {
        const entry = await prisma.guideBlacklist.findUnique({
            where: { operatorId_guideId: { operatorId, guideId } },
        });
        return !!entry;
    }

    /**
     * Get all blacklisted guides for an operator.
     */
    static async getBlacklist(operatorId: string) {
        return prisma.guideBlacklist.findMany({
            where: { operatorId },
            include: {
                guide: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                        trustScore: true,
                        reliabilityScore: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
