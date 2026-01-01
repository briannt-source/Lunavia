import { prisma } from "@/lib/prisma";
import { VerificationService } from "@/domain/services/verification.service";
import { AvailabilityService } from "@/domain/services/availability.service";
import { NotificationService } from "@/domain/services/notification.service";

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

    // Check minimum balance (500k VND)
    if (!guide.wallet || guide.wallet.balance < 500000) {
      throw new Error("Cần số dư tối thiểu 500,000 VND để ứng tuyển tour");
    }

    // Get tour
    const tour = await prisma.tour.findUnique({
      where: { id: input.tourId },
    });

    if (!tour) {
      throw new Error("Tour not found");
    }

    if (tour.status !== "OPEN") {
      if (tour.status === "CLOSED") {
        throw new Error("Tour này đã ngưng nhận thêm hướng dẫn viên");
      }
      throw new Error("Tour is not open for applications");
    }

    // Check if tour has already started (cannot apply after start time)
    const now = new Date();
    const tourStart = new Date(tour.startDate);
    if (tourStart <= now) {
      throw new Error("Không thể ứng tuyển tour đã quá giờ khởi hành. Tour đã bắt đầu hoặc đã qua thời gian khởi hành.");
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
      throw new Error("Bạn đã ứng tuyển tour này rồi. Vui lòng kiểm tra trạng thái ứng tuyển của bạn.");
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

