import { DisputeService } from "@/domain/services/dispute.service";

export interface AddEvidenceInput {
  disputeId: string;
  userId: string;
  evidenceUrls: string[];
}

export class AddEvidenceUseCase {
  async execute(input: AddEvidenceInput) {
    return await DisputeService.addEvidence({
      disputeId: input.disputeId,
      evidenceUrls: input.evidenceUrls,
      addedBy: input.userId,
    });
  }
}

