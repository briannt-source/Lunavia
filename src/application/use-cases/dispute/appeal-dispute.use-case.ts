import { DisputeService } from "@/domain/services/dispute.service";
import { NotificationService } from "@/domain/services/notification.service";

export interface AppealDisputeInput {
  originalDisputeId: string;
  userId: string;
  appealDescription: string;
}

export class AppealDisputeUseCase {
  async execute(input: AppealDisputeInput) {
    // Create appeal
    const appealDispute = await DisputeService.appealDispute(
      input.originalDisputeId,
      input.userId,
      input.appealDescription
    );

    // Notify admins about appeal
    await NotificationService.notifyDisputeAppealed(input.originalDisputeId);

    return appealDispute;
  }
}

