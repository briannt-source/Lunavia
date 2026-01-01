import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/domain/services/notification.service";

export interface RejectStandbyRequestInput {
  guideId: string;
  standbyRequestId: string;
  reason?: string;
}

export class RejectStandbyRequestUseCase {
  async execute(input: RejectStandbyRequestInput) {
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

    // Update standby request
    const updatedRequest = await prisma.standbyRequest.update({
      where: { id: input.standbyRequestId },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
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
    await NotificationService.notifyStandbyRequestRejected(
      standbyRequest.operatorId,
      input.guideId,
      standbyRequest.id,
      input.reason
    );

    return updatedRequest;
  }
}

