import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/domain/services/notification.service";

export interface CreateStandbyRequestInput {
  operatorId: string;
  title: string;
  city: string;
  requiredDate: Date;
  budget: number;
  standbyFee?: number; // Optional standby fee
  mainGuideId?: string;
  subGuideId?: string;
  description?: string;
}

export class CreateStandbyRequestUseCase {
  async execute(input: CreateStandbyRequestInput) {
    // Verify operator
    const operator = await prisma.user.findUnique({
      where: { id: input.operatorId },
      include: {
        wallet: true,
      },
    });

    if (!operator || (operator.role !== "TOUR_OPERATOR" && operator.role !== "TOUR_AGENCY")) {
      throw new Error("Only tour operators can create standby requests");
    }

    // Check if operator has enough balance (budget + standby fee)
    const totalCost = input.budget + (input.standbyFee || 0);
    if (operator.wallet && operator.wallet.balance < totalCost) {
      throw new Error(
        `Insufficient balance. Required: ${totalCost.toLocaleString("vi-VN")} VND (Budget: ${input.budget.toLocaleString("vi-VN")} VND + Standby Fee: ${(input.standbyFee || 0).toLocaleString("vi-VN")} VND)`
      );
    }

    // Validate dates
    const requiredDate = new Date(input.requiredDate);
    const now = new Date();
    if (requiredDate <= now) {
      throw new Error("Required date must be in the future");
    }

    // Validate guides if provided
    if (input.mainGuideId) {
      const mainGuide = await prisma.user.findUnique({
        where: { id: input.mainGuideId },
      });
      if (!mainGuide || mainGuide.role !== "TOUR_GUIDE") {
        throw new Error("Main guide not found or invalid");
      }
    }

    if (input.subGuideId) {
      const subGuide = await prisma.user.findUnique({
        where: { id: input.subGuideId },
      });
      if (!subGuide || subGuide.role !== "TOUR_GUIDE") {
        throw new Error("Sub guide not found or invalid");
      }
    }

    // Create standby request
    const standbyRequest = await prisma.standbyRequest.create({
      data: {
        operatorId: input.operatorId,
        title: input.title,
        city: input.city,
        requiredDate: requiredDate,
        budget: input.budget,
        standbyFee: input.standbyFee,
        mainGuideId: input.mainGuideId,
        subGuideId: input.subGuideId,
        description: input.description,
        status: "PENDING",
      },
      include: {
        operator: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Notify guides if assigned
    if (input.mainGuideId) {
      await NotificationService.notifyNewStandbyRequest(
        input.mainGuideId,
        standbyRequest.id
      );
    }
    if (input.subGuideId) {
      await NotificationService.notifyNewStandbyRequest(
        input.subGuideId,
        standbyRequest.id
      );
    }

    return standbyRequest;
  }
}

