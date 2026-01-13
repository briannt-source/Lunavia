import { prisma } from "@/lib/prisma";

export interface ViewContractInput {
  guideId: string;
  contractId: string;
}

export class ViewContractUseCase {
  async execute(input: ViewContractInput) {
    // Get contract
    const contract = await prisma.contract.findUnique({
      where: { id: input.contractId },
      include: {
        tour: {
          include: {
            applications: {
              where: {
                guideId: input.guideId,
                status: "ACCEPTED",
              },
            },
            assignments: {
              where: {
                guideId: input.guideId,
                status: "APPROVED",
              },
            },
          },
        },
      },
    });

    if (!contract) {
      throw new Error("Contract not found");
    }

    // Check if guide is assigned/accepted for this tour
    const isAssigned =
      contract.tour.applications.length > 0 ||
      contract.tour.assignments.length > 0;

    if (!isAssigned) {
      throw new Error("You are not assigned to this tour");
    }

    // Create or update acceptance record
    const acceptance = await prisma.contractAcceptance.upsert({
      where: {
        contractId_guideId: {
          contractId: input.contractId,
          guideId: input.guideId,
        },
      },
      update: {
        status: "VIEWED",
        viewedAt: new Date(),
      },
      create: {
        contractId: input.contractId,
        guideId: input.guideId,
        status: "VIEWED",
        viewedAt: new Date(),
      },
    });

    return {
      contract,
      acceptance,
    };
  }
}














