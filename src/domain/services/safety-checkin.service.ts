import { prisma } from "@/lib/prisma";
import { CheckInStatus } from "@prisma/client";
import { NotificationService } from "./notification.service";

// ══════════════════════════════════════════════════════════════════════
// Safety Check-In Service — Operator-Driven or Reminder-Based
//
// Two modes:
//   1) Itinerary-based: Schedule check-ins from operator-defined stops
//   2) Reminder-only: Periodic reminders when no stops configured
// ══════════════════════════════════════════════════════════════════════

export interface ScheduleCheckInInput {
  tourId: string;
  guideId: string;
  scheduledAt: Date;
  locationName?: string;
}

export interface CheckInInput {
  checkInId: string;
  guideId: string;
  status: CheckInStatus;
  location?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export class SafetyCheckInService {
  private static readonly DEFAULT_INTERVAL_HOURS = 3; // Fallback: reminder every 3 hours
  private static readonly MAX_MISSED_CHECK_INS = 3; // Escalate after 3 missed

  // ── Itinerary-Based Scheduling ──────────────────────────────────

  /**
   * Schedule check-ins from itinerary stops (operator-driven).
   * Reads tour segments (if any) and creates SafetyCheckIn for each stop.
   * Falls back to interval-based scheduling if no segments exist.
   */
  static async scheduleFromItinerary(tourId: string, guideId: string) {
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        itinerary: true,
        operatorId: true,
      },
    });

    if (!tour) throw new Error("Tour not found");

    // Try to fetch segments from the segments API store
    let segments: any[] = [];
    try {
      // Segments are stored in itinerary JSON field as array
      if (tour.itinerary && Array.isArray(tour.itinerary)) {
        segments = tour.itinerary.filter(
          (s: any) => s && typeof s === "object" && s.plannedStartTime
        );
      }
    } catch {
      segments = [];
    }

    // Clear existing unfinished check-ins to prevent duplicates
    await prisma.safetyCheckIn.deleteMany({
      where: {
        tourId,
        guideId,
        checkedInAt: null,
        missed: false,
      },
    });

    if (segments.length > 0) {
      // ── Mode 1: Itinerary-based ──
      return this.scheduleFromSegments(tourId, guideId, segments);
    } else {
      // ── Mode 2: Interval-based fallback ──
      return this.scheduleIntervalBased(tourId, guideId, tour);
    }
  }

  /**
   * Create check-ins from itinerary segments.
   * Each segment with a plannedStartTime gets a check-in.
   */
  private static async scheduleFromSegments(
    tourId: string,
    guideId: string,
    segments: any[]
  ) {
    const checkIns: any[] = [];

    for (const segment of segments) {
      const scheduledAt = new Date(segment.plannedStartTime);
      if (isNaN(scheduledAt.getTime())) continue;

      const checkIn = await prisma.safetyCheckIn.create({
        data: {
          tourId,
          guideId,
          scheduledAt,
          location: segment.locationName || segment.title || null,
          status: CheckInStatus.SAFE,
        },
      });

      checkIns.push(checkIn);
    }

    // Create timeline event
    await this.createTimelineEvent(
      tourId,
      "SYSTEM",
      "CHECKINS_SCHEDULED",
      `${checkIns.length} check-ins scheduled from itinerary`,
      { mode: "itinerary", count: checkIns.length }
    );

    return { mode: "itinerary" as const, checkIns };
  }

  /**
   * Create interval-based check-ins (fallback when no stops defined).
   */
  private static async scheduleIntervalBased(
    tourId: string,
    guideId: string,
    tour: { startDate: Date; endDate: Date | null }
  ) {
    const checkIns: any[] = [];
    const startDate = new Date(tour.startDate);
    const endDate = tour.endDate ? new Date(tour.endDate) : new Date(startDate.getTime() + 8 * 60 * 60 * 1000); // default 8h

    const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const numberOfCheckIns = Math.ceil(durationHours / this.DEFAULT_INTERVAL_HOURS);

    for (let i = 1; i <= numberOfCheckIns; i++) {
      const scheduledAt = new Date(startDate);
      scheduledAt.setHours(scheduledAt.getHours() + i * this.DEFAULT_INTERVAL_HOURS);

      if (scheduledAt > endDate) break;

      const checkIn = await prisma.safetyCheckIn.create({
        data: {
          tourId,
          guideId,
          scheduledAt,
          status: CheckInStatus.SAFE,
        },
      });

      checkIns.push(checkIn);
    }

    await this.createTimelineEvent(
      tourId,
      "SYSTEM",
      "CHECKINS_SCHEDULED",
      `${checkIns.length} reminder check-ins scheduled (every ${this.DEFAULT_INTERVAL_HOURS}h)`,
      { mode: "reminder", count: checkIns.length, intervalHours: this.DEFAULT_INTERVAL_HOURS }
    );

    return { mode: "reminder" as const, checkIns };
  }

  // Legacy method for backward compatibility
  static async scheduleCheckInsForTour(tourId: string, guideId: string) {
    return this.scheduleFromItinerary(tourId, guideId);
  }

  // ── Check-In Execution ─────────────────────────────────────────

  /**
   * Perform check-in (guide action).
   */
  static async performCheckIn(input: CheckInInput) {
    const checkIn = await prisma.safetyCheckIn.findUnique({
      where: { id: input.checkInId },
      include: {
        tour: {
          select: { id: true, operatorId: true, title: true },
        },
      },
    });

    if (!checkIn) throw new Error("Check-in not found");
    if (checkIn.guideId !== input.guideId) {
      throw new Error("Unauthorized: You can only check in for your own check-ins");
    }

    const updated = await prisma.safetyCheckIn.update({
      where: { id: input.checkInId },
      data: {
        status: input.status,
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
        notes: input.notes,
        checkedInAt: new Date(),
        missed: false,
      },
    });

    // Create timeline event
    await this.createTimelineEvent(
      checkIn.tourId,
      input.guideId,
      "GUIDE_CHECKIN",
      `Guide checked in: ${input.status}${input.location ? ` at ${input.location}` : ""}`,
      { checkInId: input.checkInId, status: input.status, location: input.location }
    );

    // Handle emergency status
    if (input.status === CheckInStatus.EMERGENCY) {
      const { EmergencyService } = await import("./emergency.service");
      await EmergencyService.createSOS({
        tourId: checkIn.tourId,
        guideId: checkIn.guideId,
        description: input.notes || "Emergency reported during safety check-in",
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
      });
    }

    // Handle needs attention status
    if (input.status === CheckInStatus.NEEDS_ATTENTION) {
      await NotificationService.notifyEmergency(
        checkIn.tour.operatorId,
        checkIn.tourId,
        "MEDIUM"
      );
    }

    return updated;
  }

  // ── Missed Check-In Handling ────────────────────────────────────

  /**
   * Mark check-in as missed and escalate if needed.
   */
  static async markCheckInMissed(checkInId: string) {
    const checkIn = await prisma.safetyCheckIn.findUnique({
      where: { id: checkInId },
      include: {
        tour: {
          select: { id: true, operatorId: true, title: true },
        },
        guide: {
          select: { id: true, email: true },
        },
      },
    });

    if (!checkIn) throw new Error("Check-in not found");

    // Update check-in
    const updated = await prisma.safetyCheckIn.update({
      where: { id: checkInId },
      data: {
        missed: true,
        missedAt: new Date(),
        status: CheckInStatus.MISSED,
      },
    });

    // Create timeline event
    await this.createTimelineEvent(
      checkIn.tourId,
      checkIn.guideId,
      "CHECKIN_MISSED",
      `Guide missed scheduled check-in`,
      { checkInId, scheduledAt: checkIn.scheduledAt }
    );

    // Notify operator
    await NotificationService.notifyEmergency(
      checkIn.tour.operatorId,
      checkIn.tourId,
      "MEDIUM"
    );

    // Check escalation threshold
    const missedCount = await prisma.safetyCheckIn.count({
      where: {
        tourId: checkIn.tourId,
        guideId: checkIn.guideId,
        missed: true,
      },
    });

    if (missedCount >= this.MAX_MISSED_CHECK_INS) {
      // Escalate to emergency
      const { EmergencyService } = await import("./emergency.service");
      await EmergencyService.createSOS({
        tourId: checkIn.tourId,
        guideId: checkIn.guideId,
        description: `Multiple missed check-ins (${missedCount}). Guide may be in trouble.`,
      });

      await this.createTimelineEvent(
        checkIn.tourId,
        "SYSTEM",
        "CHECKIN_ESCALATED",
        `${missedCount} missed check-ins → Emergency protocol triggered`,
        { missedCount, threshold: this.MAX_MISSED_CHECK_INS }
      );
    }

    return updated;
  }

  // ── Scan for Overdue Check-Ins ──────────────────────────────────

  /**
   * Find and mark all overdue check-ins across active tours.
   * Should be called by a cron/scheduler endpoint.
   */
  static async processOverdueCheckIns(gracePeriodMinutes: number = 60) {
    const cutoff = new Date(Date.now() - gracePeriodMinutes * 60 * 1000);

    const overdueCheckIns = await prisma.safetyCheckIn.findMany({
      where: {
        scheduledAt: { lt: cutoff },
        checkedInAt: null,
        missed: false,
        tour: {
          status: "IN_PROGRESS",
        },
      },
      select: { id: true },
    });

    const results = {
      processed: 0,
      errors: 0,
    };

    for (const ci of overdueCheckIns) {
      try {
        await this.markCheckInMissed(ci.id);
        results.processed++;
      } catch (err) {
        console.error(`Failed to mark check-in ${ci.id} as missed:`, err);
        results.errors++;
      }
    }

    return results;
  }

  // ── Queries ────────────────────────────────────────────────────

  /**
   * Get pending check-ins for a guide.
   */
  static async getPendingCheckIns(guideId: string, tourId?: string) {
    const where: any = {
      guideId,
      missed: false,
      checkedInAt: null,
      scheduledAt: { lte: new Date() },
    };
    if (tourId) where.tourId = tourId;

    return prisma.safetyCheckIn.findMany({
      where,
      include: {
        tour: { select: { id: true, title: true, code: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });
  }

  /**
   * Get all check-ins for a tour with completion stats.
   */
  static async getTourCheckInSummary(tourId: string) {
    const checkIns = await prisma.safetyCheckIn.findMany({
      where: { tourId },
      orderBy: { scheduledAt: "asc" },
    });

    const total = checkIns.length;
    const completed = checkIns.filter((c) => c.checkedInAt !== null).length;
    const missed = checkIns.filter((c) => c.missed).length;
    const pending = total - completed - missed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 100;

    return {
      total,
      completed,
      missed,
      pending,
      completionRate,
      checkIns,
    };
  }

  // ── Timeline Helper ────────────────────────────────────────────

  private static async createTimelineEvent(
    tourId: string,
    actorId: string | null,
    eventType: string,
    title: string,
    metadata?: Record<string, any>
  ) {
    try {
      await prisma.tourTimelineEvent.create({
        data: {
          tourId,
          actorId: actorId === "SYSTEM" ? null : actorId,
          actorRole: actorId === "SYSTEM" ? "SYSTEM" : "GUIDE",
          eventType,
          title,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
    } catch (err) {
      console.error("[SafetyCheckIn] Timeline event creation failed:", err);
    }
  }
}
