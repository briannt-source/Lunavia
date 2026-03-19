/**
 * GuideAvailabilityDomain — Guide Matching & Availability Tracking
 *
 * Tracks guide availability and matches guides for tours.
 *
 * Availability states: AVAILABLE | BOOKED | UNAVAILABLE
 *
 * Matching logic ranks by:
 *   1. reliabilityScore
 *   2. trustScore
 *   3. recent activity
 *
 * Used by: guide marketplace, SOS broadcast, replacement suggestions
 */

import { prisma } from '@/lib/prisma';

// ── Check Guide Availability ──────────────────────────────────────────

async function getGuideAvailability(guideId: string, date: Date): Promise<string> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Check availability block
    const block = await prisma.guideAvailability.findFirst({
        where: {
            userId: guideId,
            date: { gte: startOfDay, lt: endOfDay },
        },
    });

    if (block) return block.status; // AVAILABLE | UNAVAILABLE

    // Check if guide has an assigned tour on this date
    const assignedTour = await prisma.tour.findFirst({
        where: {
            assignedGuideId: guideId,
            startTime: { gte: startOfDay, lt: endOfDay },
            status: { notIn: ['CANCELLED', 'DRAFT'] },
        },
    });

    return assignedTour ? 'BOOKED' : 'AVAILABLE';
}

// ── Find Available Guides ─────────────────────────────────────────────

interface GuideMatchCriteria {
    date: Date;
    language?: string;
    province?: string;
    preferredProvince?: string;
    excludeGuideIds?: string[];
    startTime?: Date;
    endTime?: Date;
    limit?: number;
}

async function findAvailableGuides(criteria: GuideMatchCriteria) {
    const { date, language, province, preferredProvince, excludeGuideIds = [], startTime, endTime, limit = 20 } = criteria;
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Find guides with AVAILABLE blocks or no blocks
    const unavailableGuideIds = await prisma.guideAvailability.findMany({
        where: {
            date: { gte: startOfDay, lt: endOfDay },
            status: 'UNAVAILABLE',
        },
        select: { userId: true },
    });
    const unavailableSet = new Set(unavailableGuideIds.map(b => b.userId));

    // Find guides booked for overlapping tours
    const bookedFilter: any = {
        startTime: { lt: endTime || endOfDay },
        endTime: { gt: startTime || startOfDay },
        status: { notIn: ['CANCELLED', 'DRAFT'] },
    };
    const bookedTours = await prisma.tour.findMany({
        where: bookedFilter,
        select: { assignedGuideId: true },
    });
    const bookedSet = new Set(bookedTours.map(t => t.assignedGuideId).filter(Boolean));

    // Build guide query
    const guideFilter: any = {
        role: { name: 'TOUR_GUIDE' },
        isActive: true,
        id: { notIn: [...excludeGuideIds, ...Array.from(unavailableSet), ...Array.from(bookedSet)] },
    };

    if (language) {
        guideFilter.languages = { has: language };
    }
    if (province) {
        guideFilter.province = province;
    }

    const guides = await (prisma as any).user.findMany({
        where: guideFilter,
        select: {
            id: true,
            name: true,
            email: true,
            province: true,
            languages: true,
            reliabilityScore: true,
            trustScore: true,
            avatarUrl: true,
        },
    });

    const scoredGuides = guides.map((g: any) => {
        let matchScore = ((g.reliabilityScore || 50) * 0.6 + (g.trustScore || 50) * 0.4);
        
        // Boost local guide matches
        if (preferredProvince && g.province === preferredProvince) {
            matchScore += 50;
        }

        return {
            ...g,
            availability: 'AVAILABLE',
            matchScore,
        };
    });

    // Sort by final match score descending
    scoredGuides.sort((a: { matchScore: number }, b: { matchScore: number }) => b.matchScore - a.matchScore);

    return scoredGuides.slice(0, limit);
}

// ── Set Guide Availability ────────────────────────────────────────────

async function setAvailability(guideId: string, date: Date, status: string, note?: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    return prisma.guideAvailability.upsert({
        where: {
            userId_date: { userId: guideId, date: startOfDay },
        },
        update: { status, note: note || null },
        create: { userId: guideId, date: startOfDay, status, note: note || null },
    });
}

// ── Exports ───────────────────────────────────────────────────────────

export const GuideAvailabilityDomain = {
    getGuideAvailability,
    findAvailableGuides,
    setAvailability,
};
