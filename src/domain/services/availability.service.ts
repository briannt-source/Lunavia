import { prisma } from "@/lib/prisma";

/**
 * Domain Service for Guide Availability
 * Handles availability checking, conflict detection, and status updates
 */
export class AvailabilityService {
  /**
   * Check if guide is available for a tour (date range)
   */
  static async isAvailable(
    guideId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    available: boolean;
    reason?: string;
    conflictingTours?: Array<{ id: string; title: string; startDate: Date; endDate: Date | null }>;
  }> {
    const guide = await prisma.user.findUnique({
      where: { id: guideId },
      include: {
        profile: true,
        applications: {
          where: {
            status: "ACCEPTED",
            tour: {
              OR: [
                {
                  startDate: { lte: endDate },
                  endDate: { gte: startDate },
                },
                {
                  startDate: { lte: endDate },
                  endDate: null,
                },
              ],
            },
          },
          include: {
            tour: true,
          },
        },
        assignments: {
          where: {
            status: "APPROVED",
            tour: {
              OR: [
                {
                  startDate: { lte: endDate },
                  endDate: { gte: startDate },
                },
                {
                  startDate: { lte: endDate },
                  endDate: null,
                },
              ],
            },
          },
          include: {
            tour: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
    });

    if (!guide) {
      return { available: false, reason: "Guide not found" };
    }

    // Check profile availability status
    if (guide.profile?.availabilityStatus === "BUSY") {
      return {
        available: false,
        reason: "Guide đang đặt trạng thái BUSY",
      };
    }

    // Check for conflicting accepted applications
    const conflictingApplications = guide.applications.map((app) => ({
      id: app.tour.id,
      title: app.tour.title,
      startDate: app.tour.startDate,
      endDate: app.tour.endDate,
    }));

    // Check for conflicting assignments
    const conflictingAssignments = guide.assignments.map((assignment) => ({
      id: assignment.tour.id,
      title: assignment.tour.title,
      startDate: assignment.tour.startDate,
      endDate: assignment.tour.endDate,
    }));

    const allConflicts = [...conflictingApplications, ...conflictingAssignments];

    if (allConflicts.length > 0) {
      return {
        available: false,
        reason: "Guide đã có tour trong khoảng thời gian này",
        conflictingTours: allConflicts,
      };
    }

    return { available: true };
  }

  /**
   * Update guide availability status
   */
  static async updateAvailabilityStatus(
    guideId: string,
    status: "AVAILABLE" | "BUSY" | "ON_TOUR"
  ) {
    return prisma.profile.update({
      where: { userId: guideId },
      data: {
        availabilityStatus: status,
      },
    });
  }

  /**
   * Set guide to ON_TOUR for a date range
   * Called when application/assignment is accepted
   */
  static async setOnTour(guideId: string, startDate: Date, endDate: Date) {
    // Update profile status
    await this.updateAvailabilityStatus(guideId, "ON_TOUR");

    // Create availability records for the date range
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    const finalDate = endDate || new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // Default 1 day if no endDate

    while (currentDate <= finalDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Upsert availability records
    for (const date of dates) {
      await prisma.guideAvailability.upsert({
        where: {
          guideId_date: {
            guideId,
            date: new Date(date.setHours(0, 0, 0, 0)),
          },
        },
        update: {
          slots: [{ status: "ON_TOUR" }],
        },
        create: {
          guideId,
          date: new Date(date.setHours(0, 0, 0, 0)),
          slots: [{ status: "ON_TOUR" }],
        },
      });
    }
  }
}

