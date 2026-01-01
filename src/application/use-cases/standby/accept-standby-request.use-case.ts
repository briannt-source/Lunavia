import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/domain/services/notification.service";
import { AvailabilityService } from "@/domain/services/availability.service";

export interface AcceptStandbyRequestInput {
  guideId: string;
  standbyRequestId: string;
}

export class AcceptStandbyRequestUseCase {
  async execute(input: AcceptStandbyRequestInput) {
    // Get standby request
    const standbyRequest = await prisma.standbyRequest.findUnique({
      where: { id: input.standbyRequestId },
      include: {
        operator: true,
      },
    });

    if (!standbyRequest) {
      throw new Error("Standby request not found");
    }

    if (standbyRequest.status !== "PENDING") {
      throw new Error(`Standby request is already ${standbyRequest.status}`);
    }

    // Verify guide is assigned to this request
    const isMainGuide = standbyRequest.mainGuideId === input.guideId;
    const isSubGuide = standbyRequest.subGuideId === input.guideId;

    if (!isMainGuide && !isSubGuide) {
      throw new Error("You are not assigned to this standby request");
    }

    // Check guide availability
    const requiredDate = new Date(standbyRequest.requiredDate);
    const availability = await AvailabilityService.isAvailable(
      input.guideId,
      requiredDate,
      requiredDate
    );

    if (!availability.available) {
      throw new Error(
        `You are not available on ${requiredDate.toLocaleDateString("vi-VN")}. ${availability.reason}`
      );
    }

    // Update standby request
    const updatedRequest = await prisma.standbyRequest.update({
      where: { id: input.standbyRequestId },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
      include: {
        operator: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Notify operator
    await NotificationService.notifyStandbyRequestAccepted(
      standbyRequest.operatorId,
      input.guideId,
      standbyRequest.id
    );

    // If standby fee exists, pay guide immediately
    if (standbyRequest.standbyFee && standbyRequest.standbyFee > 0) {
      const { WalletService } = await import("@/domain/services/wallet.service");
      await WalletService.transfer(
        standbyRequest.operatorId,
        input.guideId,
        standbyRequest.standbyFee,
        undefined,
        standbyRequest.id
      );
    }

    return updatedRequest;
  }
}

