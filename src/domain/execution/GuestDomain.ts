import { findTourCompat, enrichTourCompat, getAssignedGuideId } from '@/lib/tour-compat';
/**
 * GuestDomain — Tour Guest Management & Check-in
 *
 * Manages guest lists per tour, self-check-in via public tokens,
 * guide check-in, no-show marking, and headcount validation.
 */

import { prisma } from '@/lib/prisma';
import { createTourEvent, TOUR_EVENT_TYPES, ACTOR_ROLES } from '@/lib/tour-events';

// ── Types ────────────────────────────────────────────────────────────

export interface GuestInput {
    guestName: string;
    bookingRef?: string;
    email?: string;
    phone?: string;
    notes?: string;
}

export interface GuestHeadcount {
    total: number;
    checkedIn: number;
    pending: number;
    noShow: number;
    earlyLeave: number;
    allAccountedFor: boolean;
}

// ── Add Guest (Operator only) ────────────────────────────────────────

export async function addGuest(tourId: string, operatorId: string, input: GuestInput) {
    const tour = enrichTourCompat(await prisma.tour.findUnique({
        where: { id: tourId },
        select: { id: true, operatorId: true, status: true },
    }));
    if (!tour) throw new Error('NOT_FOUND');
    if (tour.operatorId !== operatorId) throw new Error('FORBIDDEN');

    // Allow adding guests before tour is completed
    const blockedStatuses = ['COMPLETED', 'CLOSED', 'CANCELLED', 'EXPIRED'];
    if (blockedStatuses.includes(tour.status)) throw new Error('TOUR_CLOSED');

    const guest = await prisma.tourGuest.create({
        data: {
            tourId,
            guestName: input.guestName,
            bookingRef: input.bookingRef || null,
            email: input.email || null,
            phone: input.phone || null,
            notes: input.notes || null,
        },
    });

    return guest;
}

// ── Remove Guest (Operator only, before tour starts) ─────────────────

export async function removeGuest(tourId: string, operatorId: string, guestId: string) {
    const tour = enrichTourCompat(await prisma.tour.findUnique({
        where: { id: tourId },
        select: { id: true, operatorId: true, status: true },
    }));
    if (!tour) throw new Error('NOT_FOUND');
    if (tour.operatorId !== operatorId) throw new Error('FORBIDDEN');

    // Only allow removal before tour is in progress
    const activeStatuses = ['IN_PROGRESS', 'COMPLETED', 'CLOSED'];
    if (activeStatuses.includes(tour.status)) throw new Error('TOUR_ACTIVE');

    const guest = await prisma.tourGuest.findFirst({
        where: { id: guestId, tourId },
    });
    if (!guest) throw new Error('GUEST_NOT_FOUND');

    await prisma.tourGuest.delete({ where: { id: guestId } });

    return { deleted: true };
}

// ── Guide Check-in Guest ─────────────────────────────────────────────

export async function guideCheckInGuest(tourId: string, guideId: string, guestId: string) {
    const tour = enrichTourCompat(await prisma.tour.findUnique({
        where: { id: tourId },
        select: { id: true, assignedGuideId: true, status: true, title: true },
    }));
    if (!tour) throw new Error('NOT_FOUND');

    // Allow operator or assigned guide to check in guests
    const isGuide = tour.assignedGuideId === guideId;
    if (!isGuide) {
        // Check if they're in the team
        const teamMember = await prisma.tourTeamMember.findFirst({
            where: { tourId, userId: guideId, status: 'ACTIVE' },
        });
        if (!teamMember) throw new Error('FORBIDDEN');
    }

    const guest = await prisma.tourGuest.findFirst({
        where: { id: guestId, tourId },
    });
    if (!guest) throw new Error('GUEST_NOT_FOUND');
    if (guest.status === 'CHECKED_IN') throw new Error('ALREADY_CHECKED_IN');

    const now = new Date();
    const updated = await prisma.tourGuest.update({
        where: { id: guestId },
        data: { status: 'CHECKED_IN', checkedInAt: now, checkedInBy: guideId },
    });

    return updated;
}

// ── Guest Self-Check-in (Public, no auth) ────────────────────────────

export async function guestSelfCheckIn(checkInToken: string) {
    const guest = await prisma.tourGuest.findUnique({
        where: { checkInToken },
        include: {
            tour: {
                select: {
                    id: true, title: true, status: true, startDate: true,
                    endDate: true, location: true, operator: { select: { name: true } },
                },
            },
        },
    });
    if (!guest) throw new Error('INVALID_TOKEN');
    if (guest.status === 'CHECKED_IN') throw new Error('ALREADY_CHECKED_IN');

    // Only allow check-in for tours that are not cancelled/expired
    const blockedStatuses = ['CANCELLED', 'EXPIRED'];
    if (blockedStatuses.includes(guest.tour.status)) throw new Error('TOUR_UNAVAILABLE');

    const now = new Date();
    const updated = await prisma.tourGuest.update({
        where: { id: guest.id },
        data: { status: 'CHECKED_IN', checkedInAt: now, checkedInBy: 'SELF' },
    });

    return {
        guest: updated,
        tour: guest.tour,
    };
}

// ── Get Guest Info by Token (Public, no auth) ────────────────────────

export async function getGuestByToken(checkInToken: string) {
    const guest = await prisma.tourGuest.findUnique({
        where: { checkInToken },
        include: {
            tour: {
                select: {
                    id: true, title: true, status: true, startDate: true,
                    endDate: true, location: true, province: true,
                    operator: { select: { name: true } },
                    tourTeamMembers: {
                        where: { status: 'ACTIVE' },
                        include: { user: { select: { name: true } } },
                        take: 3,
                    },
                },
            },
        },
    });
    if (!guest) throw new Error('INVALID_TOKEN');

    return guest;
}

// ── Mark No-Show (Guide) ─────────────────────────────────────────────

export async function markNoShow(tourId: string, guideId: string, guestId: string) {
    const tour = enrichTourCompat(await prisma.tour.findUnique({
        where: { id: tourId },
        select: { id: true, assignedGuideId: true, status: true },
    }));
    if (!tour) throw new Error('NOT_FOUND');

    const isGuide = tour.assignedGuideId === guideId;
    if (!isGuide) {
        const teamMember = await prisma.tourTeamMember.findFirst({
            where: { tourId, userId: guideId, status: 'ACTIVE' },
        });
        if (!teamMember) throw new Error('FORBIDDEN');
    }

    const guest = await prisma.tourGuest.findFirst({
        where: { id: guestId, tourId },
    });
    if (!guest) throw new Error('GUEST_NOT_FOUND');

    const updated = await prisma.tourGuest.update({
        where: { id: guestId },
        data: { status: 'NO_SHOW', checkedInBy: guideId },
    });

    return updated;
}

// ── Mark Early Leave (Guide) ──────────────────────────────────────────

export async function markEarlyLeave(tourId: string, guideId: string, guestId: string, notes: string) {
    const tour = enrichTourCompat(await prisma.tour.findUnique({
        where: { id: tourId },
        select: { id: true, assignedGuideId: true, status: true },
    }));
    if (!tour) throw new Error('NOT_FOUND');

    const isGuide = tour.assignedGuideId === guideId;
    if (!isGuide) {
        const teamMember = await prisma.tourTeamMember.findFirst({
            where: { tourId, userId: guideId, status: 'ACTIVE' },
        });
        if (!teamMember) throw new Error('FORBIDDEN');
    }

    const guest = await prisma.tourGuest.findFirst({
        where: { id: guestId, tourId },
    });
    if (!guest) throw new Error('GUEST_NOT_FOUND');
    
    // Only checked in guests can leave early
    if (guest.status !== 'CHECKED_IN') throw new Error('GUEST_NOT_CHECKED_IN');

    const updated = await prisma.tourGuest.update({
        where: { id: guestId },
        data: { status: 'EARLY_LEAVE', notes: notes },
    });

    return updated;
}

// ── Get Guest List ───────────────────────────────────────────────────

export async function getGuestList(tourId: string) {
    const guests = await prisma.tourGuest.findMany({
        where: { tourId },
        orderBy: { createdAt: 'asc' },
    });

    return guests;
}

// ── Get Headcount ────────────────────────────────────────────────────

export async function getGuestHeadcount(tourId: string): Promise<GuestHeadcount> {
    const guests = await prisma.tourGuest.findMany({
        where: { tourId },
        select: { status: true },
    });

    const total = guests.length;
    const checkedIn = guests.filter(g => g.status === 'CHECKED_IN').length;
    const pending = guests.filter(g => g.status === 'PENDING').length;
    const noShow = guests.filter(g => g.status === 'NO_SHOW').length;
    const earlyLeave = guests.filter(g => g.status === 'EARLY_LEAVE').length;

    return {
        total,
        checkedIn,
        pending,
        noShow,
        earlyLeave,
        allAccountedFor: pending === 0,
    };
}
