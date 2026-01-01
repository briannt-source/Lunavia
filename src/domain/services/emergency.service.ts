import { prisma } from "@/lib/prisma";
import { EmergencyType, EmergencySeverity, EmergencyStatus } from "@prisma/client";
import { NotificationService } from "./notification.service";

export interface CreateSOSInput {
  tourId: string;
  guideId: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  location?: string;
}

export interface RespondToEmergencyInput {
  emergencyId: string;
  responderId: string;
  response: string;
  status: EmergencyStatus;
}

export interface ResolveEmergencyInput {
  emergencyId: string;
  resolverId: string;
  resolutionNotes: string;
}

export class EmergencyService {
  /**
   * Create SOS emergency (one-tap)
   */
  static async createSOS(input: CreateSOSInput) {
    // Get tour
    const tour = await prisma.tour.findUnique({
      where: { id: input.tourId },
      include: { operator: true },
    });

    if (!tour) {
      throw new Error("Tour not found");
    }

    // Create emergency report
    const emergency = await prisma.emergencyReport.create({
      data: {
        tourId: input.tourId,
        guideId: input.guideId,
        type: EmergencyType.SOS,
        severity: EmergencySeverity.CRITICAL,
        status: EmergencyStatus.PENDING,
        description: input.description || "SOS button activated",
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
        locationAccuracy: input.locationAccuracy,
        escalationLevel: 1,
      },
    });

    // Notify operator immediately
    await NotificationService.notifyEmergency(
      tour.operatorId,
      input.tourId,
      "CRITICAL"
    );

    // Notify support team (admins)
    const admins = await prisma.adminUser.findMany({
      where: {
        role: {
          in: ["SUPER_ADMIN", "MODERATOR", "SUPPORT_STAFF"],
        },
      },
    });

    for (const admin of admins) {
      // TODO: Send notification to admin
    }

    // Notify emergency contacts
    const contacts = await prisma.emergencyContact.findMany({
      where: {
        userId: input.guideId,
        isActive: true,
      },
      orderBy: {
        priority: "asc",
      },
    });

    // Update contactsNotified
    await prisma.emergencyReport.update({
      where: { id: emergency.id },
      data: {
        contactsNotified: contacts.map((c) => c.id),
      },
    });

    // TODO: Send SMS/call to emergency contacts

    return emergency;
  }

  /**
   * Respond to emergency
   */
  static async respondToEmergency(input: RespondToEmergencyInput) {
    const emergency = await prisma.emergencyReport.findUnique({
      where: { id: input.emergencyId },
      include: {
        guide: true,
        tour: {
          include: {
            operator: true,
          },
        },
      },
    });

    if (!emergency) {
      throw new Error("Emergency not found");
    }

    // Update emergency
    const updated = await prisma.emergencyReport.update({
      where: { id: input.emergencyId },
      data: {
        status: input.status,
        operatorResponse: input.response,
        respondedBy: input.responderId,
        respondedAt: new Date(),
      },
    });

    // Notify guide
    await NotificationService.notifyEmergencyResponse(
      emergency.guideId,
      input.emergencyId,
      input.response
    );

    return updated;
  }

  /**
   * Resolve emergency
   */
  static async resolveEmergency(input: ResolveEmergencyInput) {
    const emergency = await prisma.emergencyReport.findUnique({
      where: { id: input.emergencyId },
    });

    if (!emergency) {
      throw new Error("Emergency not found");
    }

    return prisma.emergencyReport.update({
      where: { id: input.emergencyId },
      data: {
        status: EmergencyStatus.RESOLVED,
        resolvedBy: input.resolverId,
        resolvedAt: new Date(),
        resolutionNotes: input.resolutionNotes,
      },
    });
  }

  /**
   * Escalate emergency
   */
  static async escalateEmergency(
    emergencyId: string,
    escalatedBy: string,
    newLevel?: number
  ) {
    const emergency = await prisma.emergencyReport.findUnique({
      where: { id: emergencyId },
    });

    if (!emergency) {
      throw new Error("Emergency not found");
    }

    const escalationLevel = newLevel || emergency.escalationLevel + 1;

    return prisma.emergencyReport.update({
      where: { id: emergencyId },
      data: {
        escalated: true,
        escalatedAt: new Date(),
        escalatedBy,
        escalationLevel: Math.min(escalationLevel, 5), // Max level 5
      },
    });
  }

  /**
   * Get active emergencies
   */
  static async getActiveEmergencies(limit?: number) {
    // Use raw query to avoid enum type issues
    const activeStatuses = ["PENDING", "ACKNOWLEDGED", "IN_PROGRESS"];
    return prisma.emergencyReport.findMany({
      where: {
        status: {
          in: activeStatuses as any,
        },
      },
      include: {
        guide: {
          include: {
            profile: true,
          },
        },
        tour: {
          include: {
            operator: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  }
}

