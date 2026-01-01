import { ContractService } from "@/domain/services/contract.service";
import { NotificationService } from "@/domain/services/notification.service";

export interface CreateContractFromTemplateInput {
  operatorId: string;
  tourId: string;
  templateId: string;
  variables: Record<string, string | number | Date>;
  operatorSignatureUrl?: string;
  operatorSignedIp?: string;
  expiresAt?: Date;
}

export class CreateContractFromTemplateUseCase {
  async execute(input: CreateContractFromTemplateInput) {
    // Create contract from template
    const contract = await ContractService.createContractFromTemplate(input);

    // Notify guides about new contract
    const acceptances = await prisma.contractAcceptance.findMany({
      where: { contractId: contract.id },
      include: { guide: true },
    });

    for (const acceptance of acceptances) {
      await NotificationService.notifyNewContract(
        acceptance.guideId,
        contract.id
      );
    }

    return contract;
  }
}

