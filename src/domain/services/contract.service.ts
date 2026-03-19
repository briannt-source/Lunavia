import { prisma } from "@/lib/prisma";
import { ContractTemplateService } from "./contract-template.service";

export interface CreateContractFromTemplateInput {
  operatorId: string;
  tourId: string;
  templateId: string;
  variables: Record<string, string | number | Date>;
  operatorSignatureUrl?: string;
  operatorSignedIp?: string;
  expiresAt?: Date;
}

export interface CreateCustomContractInput {
  operatorId: string;
  tourId: string;
  title: string;
  content: string;
  operatorSignatureUrl?: string;
  operatorSignedIp?: string;
  expiresAt?: Date;
}

export interface UpdateContractInput {
  contractId: string;
  operatorId: string;
  title?: string;
  content?: string;
  expiresAt?: Date;
}

export interface SignContractInput {
  contractId: string;
  userId: string; // Operator or guide
  signatureUrl: string;
  signedIp?: string;
}

export interface AcceptContractWithSignatureInput {
  contractId: string;
  guideId: string;
  signatureUrl: string;
  signedIp?: string;
}

export class ContractService {
  /**
   * Create contract from template
   */
  static async createContractFromTemplate(input: CreateContractFromTemplateInput) {
    // Get template
    const template = await ContractTemplateService.getTemplateById(input.templateId);
    if (!template) {
      throw new Error("Contract template not found");
    }

    if (!template.isActive) {
      throw new Error("Contract template is not active");
    }

    // Validate variables (exclude acceptance-related variables as they're not available yet)
    const requiredVariables = ContractTemplateService.extractVariables(template.content);
    const acceptanceVariables = requiredVariables.filter((v) => v.startsWith("acceptance."));
    const nonAcceptanceVariables = requiredVariables.filter((v) => !v.startsWith("acceptance."));
    
    const missing = nonAcceptanceVariables.filter(
      (varName) => !(varName in input.variables)
    );

    if (missing.length > 0) {
      throw new Error(
        `Missing required variables: ${missing.join(", ")}`
      );
    }

    // Add default values for acceptance variables
    const allVariables = {
      ...input.variables,
      ...Object.fromEntries(
        acceptanceVariables.map((v) => [v, "Chưa ký"])
      ),
    };

    // Replace variables in template
    const finalContent = ContractTemplateService.replaceVariables({
      templateContent: template.content,
      variables: allVariables,
    });

    // Get tour for title
    const tour = enrichTourCompat(await prisma.tour.findUnique({
      where: { id: input.tourId },
      include: { operator: true },
    }));

    if (!tour) {
      throw new Error("Tour not found");
    }

    if (tour.operatorId !== input.operatorId) {
      throw new Error("Unauthorized: You don't own this tour");
    }

    // Get assignment for this tour (required for Contract)
    const assignment = await prisma.assignment.findFirst({
      where: { tourId: input.tourId },
      orderBy: { createdAt: "desc" },
    });

    if (!assignment) {
      throw new Error("No assignment found for this tour. Contract requires an assignment.");
    }

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        tourId: input.tourId,
        assignmentId: assignment.id,
        operatorId: input.operatorId,
        guideId: assignment.guideId,
        contractTemplateId: input.templateId,
        terms: {
          title: `Hợp đồng cho tour: ${tour.title}`,
          content: finalContent,
          templateContent: template.content,
          operatorSignatureUrl: input.operatorSignatureUrl,
          operatorSignedAt: input.operatorSignatureUrl ? new Date() : null,
          operatorSignedIp: input.operatorSignedIp,
          expiresAt: input.expiresAt,
          version: 1,
        },
      },
    });

    // Create contract history
    await prisma.contractHistory.create({
      data: {
        contractId: contract.id,
        version: 1,
        content: finalContent,
        changedBy: input.operatorId,
        changeNote: "Contract created from template",
      },
    });

    // Create contract acceptances for all accepted guides
    const applications = await prisma.application.findMany({
      where: {
        tourId: input.tourId,
        status: "ACCEPTED",
      },
    });

    const assignments = await prisma.assignment.findMany({
      where: {
        tourId: input.tourId,
        status: "APPROVED",
      },
    });

    const guideIds = [
      ...applications.map((a) => a.guideId),
      ...assignments.map((a) => a.guideId),
    ];

    // Create acceptances
    for (const guideId of guideIds) {
      await prisma.contractAcceptance.create({
        data: {
          contractId: contract.id,
          guideId,
          status: "NOT_VIEWED",
        },
      });
    }

    return contract;
  }

  /**
   * Create custom contract (not from template)
   */
  static async createCustomContract(input: CreateCustomContractInput) {
    // Get tour
    const tour = enrichTourCompat(await prisma.tour.findUnique({
      where: { id: input.tourId },
    }));

    if (!tour) {
      throw new Error("Tour not found");
    }

    if (tour.operatorId !== input.operatorId) {
      throw new Error("Unauthorized: You don't own this tour");
    }

    // Get assignment for this tour (required for Contract)
    const assignment = await prisma.assignment.findFirst({
      where: { tourId: input.tourId },
      orderBy: { createdAt: "desc" },
    });

    if (!assignment) {
      throw new Error("No assignment found for this tour. Contract requires an assignment.");
    }

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        tourId: input.tourId,
        assignmentId: assignment.id,
        operatorId: input.operatorId,
        guideId: assignment.guideId,
        terms: {
          title: input.title,
          content: input.content,
          operatorSignatureUrl: input.operatorSignatureUrl,
          operatorSignedAt: input.operatorSignatureUrl ? new Date() : null,
          operatorSignedIp: input.operatorSignedIp,
          expiresAt: input.expiresAt,
          version: 1,
        },
      },
    });

    // Create contract history
    await prisma.contractHistory.create({
      data: {
        contractId: contract.id,
        version: 1,
        content: input.content,
        changedBy: input.operatorId,
        changeNote: "Custom contract created",
      },
    });

    // Create contract acceptances for all accepted guides
    const applications = await prisma.application.findMany({
      where: {
        tourId: input.tourId,
        status: "ACCEPTED",
      },
    });

    const assignments = await prisma.assignment.findMany({
      where: {
        tourId: input.tourId,
        status: "APPROVED",
      },
    });

    const guideIds = [
      ...applications.map((a) => a.guideId),
      ...assignments.map((a) => a.guideId),
    ];

    for (const guideId of guideIds) {
      await prisma.contractAcceptance.create({
        data: {
          contractId: contract.id,
          guideId,
          status: "NOT_VIEWED",
        },
      });
    }

    return contract;
  }

  /**
   * Update contract (creates new version)
   */
  static async updateContract(input: UpdateContractInput) {
    const contract = await prisma.contract.findUnique({
      where: { id: input.contractId },
      include: { tour: true },
    });

    if (!contract) {
      throw new Error("Contract not found");
    }

    if (contract.tour.operatorId !== input.operatorId) {
      throw new Error("Unauthorized: You don't own this contract");
    }

    // Get current terms
    const currentTerms = (contract.terms as any) || {};
    const newTerms = {
      ...currentTerms,
      ...(input.title && { title: input.title }),
      ...(input.content && { content: input.content }),
      ...(input.expiresAt && { expiresAt: input.expiresAt }),
      version: (currentTerms.version || 0) + 1,
    };

    // Update contract
    const updatedContract = await prisma.contract.update({
      where: { id: input.contractId },
      data: {
        terms: newTerms,
      },
    });

    // Create contract history
    await prisma.contractHistory.create({
      data: {
        contractId: updatedContract.id,
        version: newTerms.version,
        content: newTerms.content || currentTerms.content || "",
        changedBy: input.operatorId,
        changeNote: input.title ? `Contract updated: ${input.title}` : "Contract content updated",
      },
    });

    return updatedContract;
  }

  /**
   * Sign contract (operator or guide)
   */
  static async signContract(input: SignContractInput) {
    const contract = await prisma.contract.findUnique({
      where: { id: input.contractId },
      include: { tour: true },
    });

    if (!contract) {
      throw new Error("Contract not found");
    }

    // Check if user is operator
    if (contract.tour.operatorId === input.userId) {
      // Operator signing
      const currentTerms = (contract.terms as any) || {};
      return prisma.contract.update({
        where: { id: input.contractId },
        data: {
          signedAt: new Date(),
          terms: {
            ...currentTerms,
            operatorSignatureUrl: input.signatureUrl,
            operatorSignedAt: new Date(),
            operatorSignedIp: input.signedIp,
          },
        },
      });
    } else {
      // Guide signing (update acceptance)
      const acceptance = await prisma.contractAcceptance.findUnique({
        where: {
          contractId_guideId: {
            contractId: input.contractId,
            guideId: input.userId,
          },
        },
      });

      if (!acceptance) {
        throw new Error("Contract acceptance not found");
      }

      return prisma.contractAcceptance.update({
        where: {
          contractId_guideId: {
            contractId: input.contractId,
            guideId: input.userId,
          },
        },
        data: {
          signatureUrl: input.signatureUrl,
          signedAt: new Date(),
          signedIp: input.signedIp,
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });
    }
  }

  /**
   * Accept contract with signature (guide)
   */
  static async acceptContractWithSignature(input: AcceptContractWithSignatureInput) {
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

    // Update acceptance with signature
    return prisma.contractAcceptance.update({
      where: {
        contractId_guideId: {
          contractId: input.contractId,
          guideId: input.guideId,
        },
      },
      data: {
        status: "ACCEPTED",
        signatureUrl: input.signatureUrl,
        signedAt: new Date(),
        signedIp: input.signedIp,
        acceptedAt: new Date(),
      },
    });
  }

  /**
   * Get contract with history
   */
  static async getContractWithHistory(contractId: string) {
    return prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        tour: true,
        ContractTemplate: true,
        ContractAcceptance: {
          include: {
            guide: {
              include: {
                profile: true,
              },
            },
          },
        },
        ContractHistory: {
          orderBy: {
            version: "desc",
          },
        },
      },
    });
  }

  /**
   * Get contracts expiring soon (for renewal reminders)
   */
  static async getContractsExpiringSoon(days: number = 30) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    // Note: expiresAt is stored in terms JSON, so we can't filter directly
    // For MVP, return all contracts and filter in application layer if needed
    return prisma.contract.findMany({
      where: {
        status: "DRAFT", // Only return draft contracts for renewal
      },
      include: {
        tour: {
          include: {
            operator: true,
          },
        },
      },
    });
  }

  /**
   * Mark renewal reminder as sent
   */
  static async markRenewalReminderSent(contractId: string) {
    return prisma.contract.update({
      where: { id: contractId },
      data: {
      },
    });
  }
}

