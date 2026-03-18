/**
 * AvailabilityDomain — Guide Availability Mutations
 * All mutations through executeSimpleMutation kernel.
 */

import { prisma } from '@/lib/prisma';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';

/**
 * Set a day as AVAILABLE for a guide
 */
async function setAvailable(userId: string, date: Date, note?: string) {
    return executeSimpleMutation({
        entityName: 'AvailabilityBlock',
        actorId: userId,
        actorRole: 'TOUR_GUIDE',
        atomicMutation: async (tx) => {
            // Upsert: create or update for this date
            return tx.availabilityBlock.upsert({
                where: { userId_date: { userId, date } },
                create: { userId, date, status: 'AVAILABLE', note: note || null },
                update: { status: 'AVAILABLE', note: note || null },
            });
        },
        auditAction: 'AVAILABILITY_SET',
    });
}

/**
 * Remove availability for a specific date
 */
async function removeAvailability(userId: string, date: Date) {
    return executeSimpleMutation({
        entityName: 'AvailabilityBlock',
        actorId: userId,
        actorRole: 'TOUR_GUIDE',
        atomicMutation: async (tx) => {
            return tx.availabilityBlock.deleteMany({ where: { userId, date } });
        },
        auditAction: 'AVAILABILITY_REMOVED',
    });
}

/**
 * Get availability for a guide within a date range
 */
async function getAvailability(guideId: string, startDate: Date, endDate: Date) {
    return prisma.availabilityBlock.findMany({
        where: {
            userId: guideId,
            date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: 'asc' },
    });
}

/**
 * Check if a guide is available on a specific date
 */
async function isAvailableOn(guideId: string, date: Date): Promise<boolean> {
    const block = await prisma.availabilityBlock.findFirst({
        where: { userId: guideId, date, status: 'AVAILABLE' },
    });
    return !!block;
}

/**
 * Get all AVAILABLE dates for a guide (operator view — only shows available)
 */
async function getPublicAvailability(guideId: string, startDate: Date, endDate: Date) {
    return prisma.availabilityBlock.findMany({
        where: {
            userId: guideId,
            date: { gte: startDate, lte: endDate },
            status: 'AVAILABLE',
        },
        select: { date: true, note: true },
        orderBy: { date: 'asc' },
    });
}

export const AvailabilityDomain = {
    setAvailable,
    removeAvailability,
    getAvailability,
    isAvailableOn,
    getPublicAvailability,
};
