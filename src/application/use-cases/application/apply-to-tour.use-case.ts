import { prisma } from "@/lib/prisma";
import { VerificationService } from "@/domain/services/verification.service";
import { AvailabilityService } from "@/domain/services/availability.service";
import { NotificationService } from "@/domain/services/notification.service";
import { GuideBlacklistService } from "@/domain/governance/GuideBlacklistService";

export interface ApplyToTourInput {
  guideId: string;
  tourId: string;
  role: "MAIN" | "SUB";
  coverLetter?: string;
}

export class ApplyToTourUseCase {
  async execute(input: ApplyToTourInput) {
    // Get guide
    const guide = await prisma.user.findUnique({
      where: { id: input.guideId },
      include: {
        profile: true,
        wallet: true,
      },
    });

    if (!guide || guide.role !== "TOUR_GUIDE") {
      throw new Error("Only tour guides can apply to tours");
    }

    // Check KYC status
    const canApply = await VerificationService.canPerformAction(
      input.guideId,
      "apply_tour"
    );

    if (!canApply.canPerform) {
      throw new Error(canApply.reason);
    }

    // Get tour early so we can check blacklist
    const tour = await prisma.tour.findUnique({
      where: { id: input.tourId },
    });

    if (!tour) {
      throw new Error("Tour not found");
    }

    // Check blacklist — operator may have blocked this guide
    const isBlocked = await GuideBlacklistService.isBlacklisted(
      tour.operatorId,
      input.guideId
    );
    if (isBlocked) {
      throw new Error(
        "You cannot apply to this tour. The operator has restricted your application rights."
      );
    }

    // Check minimum balance (500k VND)
    if (!guide.wallet || guide.wallet.balance < 500000) {
      throw new Error("Minimum balance of 500,000 VND required to apply for tours");
    }

    // Check deposit lock requirements via DepositService
    try {
      const { DepositService } = await import("@/domain/services/deposit.service");
      const depositConfig = await prisma.depositConfig.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (depositConfig) {
        const depositCheck = DepositService.canApplyToTour({
          walletBalance: guide.wallet.balance,
          onboardingDepositPaid: guide.onboardingDepositPaid ?? false,
          config: {
            operatorOnboardingLock: depositConfig.operatorOnboardingLock,
            guideOnboardingLock: depositConfig.guideOnboardingLock,
            perTourLockAmount: depositConfig.perTourLockAmount,
          },
        });

        if (!depositCheck.allowed) {
          throw new Error(depositCheck.reason || "Deposit requirement not met");
        }
      }
    } catch (depositError: any) {
      // Only throw if it's a deposit validation error, not a missing-config error
      if (depositError.message && !depositError.message.includes("does not exist")) {
        throw depositError;
      }
      // If DepositConfig table doesn't exist yet, skip the check gracefully
    }

    if (tour.status !== "OPEN") {
      if (tour.status === "CLOSED") {
        throw new Error("This tour is no longer accepting guides");
      }
      throw new Error("Tour is not open for applications");
    }

    // Check if tour has already started (cannot apply after start time)
    const now = new Date();
    const tourStart = new Date(tour.startDate);
    if (tourStart <= now) {
      throw new Error("Cannot apply to tour past departure time. Tour has already started or past departure time.");
    }

    // Check visibility rules
    if (tour.visibility === "PRIVATE") {
      // Only in-house guides of the company can apply
      if (guide.employmentType !== "IN_HOUSE" || guide.companyId !== tour.operatorId) {
        throw new Error("This is a private tour. Only in-house guides can apply");
      }
    }

    // Check if guide already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        tourId_guideId: {
          tourId: input.tourId,
          guideId: input.guideId,
        },
      },
    });

    if (existingApplication) {
      throw new Error("You have already applied to this tour. Please check your application status.");
    }

    // Check for conflicts with other tours (including PENDING applications) within 24 hours
    // tourStart already declared above, reuse it
    const tourEnd = tour.endDate ? new Date(tour.endDate) : new Date(tour.startDate);
    
    // Check all applications (PENDING, ACCEPTED) and assignments for date conflicts
    const conflictingApplications = await prisma.application.findMany({
      where: {
        guideId: input.guideId,
        status: {
          in: ["PENDING", "ACCEPTED"],
        },
        tour: {
          id: { not: input.tourId },
          OR: [
            {
              startDate: { lte: tourEnd },
              endDate: { gte: tourStart },
            },
            {
              startDate: { lte: tourEnd },
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
    });

    const conflictingAssignments = await prisma.assignment.findMany({
      where: {
        guideId: input.guideId,
        status: "APPROVED",
        tour: {
          id: { not: input.tourId },
          OR: [
            {
              startDate: { lte: tourEnd },
              endDate: { gte: tourStart },
            },
            {
              startDate: { lte: tourEnd },
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
    });

    if (conflictingApplications.length > 0 || conflictingAssignments.length > 0) {
      const conflicts = [...conflictingApplications, ...conflictingAssignments];
      const conflictTitles = conflicts.map((c) => c.tour.title).join(", ");
      throw new Error(
        `Bạn không thể ứng tuyển tour này vì đã có tour khác trong cùng khoảng thời gian: ${conflictTitles}. Một hướng dẫn viên không thể tham gia 2 tour cùng lúc.`
      );
    }

    // Check slot availability
    const acceptedCount = await prisma.application.count({
      where: {
        tourId: input.tourId,
        role: input.role,
        status: "ACCEPTED",
      },
    });

    const maxSlots = input.role === "MAIN" ? tour.mainGuideSlots : tour.subGuideSlots;
    if (acceptedCount >= maxSlots) {
      throw new Error(`No more ${input.role === "MAIN" ? "main" : "sub"} guide slots available`);
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        tourId: input.tourId,
        guideId: input.guideId,
        role: input.role,
        coverLetter: input.coverLetter,
        status: "PENDING",
      },
    });

    // Notify operator
    await NotificationService.notifyNewApplication(
      tour.operatorId,
      application.id
    );

    return application;
  }
}

