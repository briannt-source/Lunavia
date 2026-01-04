import { prisma } from "@/lib/prisma";

export interface AcceptContractInput {
  guideId: string;
  contractId: string;
}

export class AcceptContractUseCase {
  async execute(input: AcceptContractInput) {
    // Get contract acceptance
    const acceptance = await prisma.contractAcceptance.findUnique({
      where: {
        contractId_guideId: {
          contractId: input.contractId,
          guideId: input.guideId,
        },
      },
      include: {
        contract: {
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
        },
      },
    });

    if (!acceptance) {
      throw new Error("Contract acceptance not found. Please view the contract first.");
    }

    // Check if guide is assigned/accepted for this tour
    const isAssigned =
      acceptance.contract.tour.applications.length > 0 ||
      acceptance.contract.tour.assignments.length > 0;

    if (!isAssigned) {
      throw new Error("You are not assigned to this tour");
    }

    if (acceptance.status === "ACCEPTED") {
      throw new Error("Contract is already accepted");
    }

    // Update acceptance
    await prisma.contractAcceptance.update({
      where: {
        contractId_guideId: {
          contractId: input.contractId,
          guideId: input.guideId,
        },
      },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    });

    return acceptance;
  }
}









