import { prisma } from "@/lib/prisma";
import { CheckInStatus } from "@prisma/client";
import { NotificationService } from "./notification.service";

export interface ScheduleCheckInInput {
  tourId: string;
  guideId: string;
  scheduledAt: Date;
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
  private static readonly CHECK_IN_INTERVAL_HOURS = 2; // Default: every 2 hours
  private static readonly MAX_MISSED_CHECK_INS = 3; // Escalate after 3 missed check-ins

  /**
   * Schedule check-ins for a tour
   */
  static async scheduleCheckInsForTour(tourId: string, guideId: string) {
    const tour = enrichTourCompat(await prisma.tour.findUnique({
      where: { id: tourId },
    }));

    if (!tour) {
      throw new Error("Tour not found");
    }

    const checkIns: any[] = [];
    const startDate = new Date(tour.startDate);
    const endDate = tour.endDate ? new Date(tour.endDate) : new Date(tour.startDate);

    // Calculate number of check-ins needed
    const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const numberOfCheckIns = Math.ceil(durationHours / this.CHECK_IN_INTERVAL_HOURS);

    // Schedule check-ins
    for (let i = 1; i <= numberOfCheckIns; i++) {
      const scheduledAt = new Date(startDate);
      scheduledAt.setHours(
        scheduledAt.getHours() + i * this.CHECK_IN_INTERVAL_HOURS
      );

      // Don't schedule check-ins after tour end
      if (scheduledAt > endDate) {
        break;
      }

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

    return checkIns;
  }

  /**
   * Perform check-in
   */
  static async performCheckIn(input: CheckInInput) {
    const checkIn = await prisma.safetyCheckIn.findUnique({
      where: { id: input.checkInId },
      include: {
        tour: {
          include: {
            operator: true,
          },
        },
      },
    });

    if (!checkIn) {
      throw new Error("Check-in not found");
    }

    if (checkIn.guideId !== input.guideId) {
      throw new Error("Unauthorized: You can only check in for your own check-ins");
    }

    // Update check-in
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

    // If status is EMERGENCY, create emergency report
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

    // If status is NEEDS_ATTENTION, notify operator
    if (input.status === CheckInStatus.NEEDS_ATTENTION) {
      await NotificationService.notifyEmergency(
        checkIn.tour.operatorId,
        checkIn.tourId,
        "MEDIUM"
      );
    }

    return updated;
  }

  /**
   * Mark check-in as missed
   */
  static async markCheckInMissed(checkInId: string) {
    const checkIn = await prisma.safetyCheckIn.findUnique({
      where: { id: checkInId },
      include: {
        tour: {
          include: {
            operator: true,
          },
        },
        guide: true,
      },
    });

    if (!checkIn) {
      throw new Error("Check-in not found");
    }

    // Update check-in
    const updated = await prisma.safetyCheckIn.update({
      where: { id: checkInId },
      data: {
        missed: true,
        missedAt: new Date(),
        status: CheckInStatus.MISSED,
      },
    });

    // Notify operator
    await NotificationService.notifyEmergency(
      checkIn.tour.operatorId,
      checkIn.tourId,
      "MEDIUM"
    );

    // Check if we need to escalate
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
    }

    return updated;
  }

  /**
   * Get pending check-ins for a guide
   */
  static async getPendingCheckIns(guideId: string, tourId?: string) {
    const where: any = {
      guideId,
      missed: false,
      checkedInAt: null,
      scheduledAt: {
        lte: new Date(), // Past scheduled time
      },
    };

    if (tourId) {
      where.tourId = tourId;
    }

    return prisma.safetyCheckIn.findMany({
      where,
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });
  }
}

