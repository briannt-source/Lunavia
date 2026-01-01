import { prisma } from "@/lib/prisma";
import { ContractService } from "@/domain/services/contract.service";
import { NotificationService } from "@/domain/services/notification.service";

export interface AcceptContractWithSignatureInput {
  guideId: string;
  contractId: string;
  signatureUrl: string;
  signedIp?: string;
}

export class AcceptContractWithSignatureUseCase {
  async execute(input: AcceptContractWithSignatureInput) {
    // Accept contract with signature
    const acceptance = await ContractService.acceptContractWithSignature({
      contractId: input.contractId,
      guideId: input.guideId,
      signatureUrl: input.signatureUrl,
      signedIp: input.signedIp,
    });

    // Notify operator
    const contract = await prisma.contract.findUnique({
      where: { id: input.contractId },
      include: { tour: true },
    });

    if (contract) {
      await NotificationService.notifyContractAccepted(
        contract.tour.operatorId,
        input.contractId,
        input.guideId
      );
    }

    return acceptance;
  }
}

