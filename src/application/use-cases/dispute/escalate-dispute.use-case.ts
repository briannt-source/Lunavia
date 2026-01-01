import { DisputeService } from "@/domain/services/dispute.service";
import { NotificationService } from "@/domain/services/notification.service";

export interface EscalateDisputeInput {
  disputeId: string;
  escalatedBy: string; // Admin user ID or system
}

export class EscalateDisputeUseCase {
  async execute(input: EscalateDisputeInput) {
    const dispute = await DisputeService.escalateDispute(
      input.disputeId,
      input.escalatedBy
    );

    // Notify admins about escalation
    await NotificationService.notifyNewDispute(dispute.id);

    return dispute;
  }
}

