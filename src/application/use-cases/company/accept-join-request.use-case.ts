import { prisma } from "@/lib/prisma";

export interface AcceptJoinRequestInput {
  operatorId: string;
  requestId: string;
  companyEmail?: string;
}

export class AcceptJoinRequestUseCase {
  async execute(input: AcceptJoinRequestInput) {
    // Get join request
    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id: input.requestId },
      include: {
        company: {
          include: { operator: true },
        },
      },
    });

    if (!joinRequest) {
      throw new Error("Join request not found");
    }

    // Verify operator owns the company
    if (joinRequest.company.operatorId !== input.operatorId) {
      throw new Error("Unauthorized: Operator does not own this company");
    }

    if (joinRequest.status !== "PENDING") {
      throw new Error(`Join request is already ${joinRequest.status}`);
    }

    // Check if guide is already a member of another company
    const existingMember = await prisma.companyMember.findUnique({
      where: { guideId: joinRequest.guideId },
    });

    if (existingMember && existingMember.companyId !== joinRequest.companyId) {
      throw new Error("Guide is already a member of another company");
    }

    // Update join request status
    await prisma.joinRequest.update({
      where: { id: input.requestId },
      data: {
        status: "APPROVED",
      },
    });

    // Create or update company member
    const companyMember = await prisma.companyMember.upsert({
      where: { guideId: joinRequest.guideId },
      update: {
        companyId: joinRequest.companyId,
        companyEmail: input.companyEmail,
        status: "APPROVED",
        approvedAt: new Date(),
      },
      create: {
        companyId: joinRequest.companyId,
        guideId: joinRequest.guideId,
        companyEmail: input.companyEmail,
        status: "APPROVED",
        approvedAt: new Date(),
      },
    });

    // Update user employment type and companyId
    await prisma.user.update({
      where: { id: joinRequest.guideId },
      data: {
        employmentType: "IN_HOUSE",
        companyId: joinRequest.companyId,
      },
    });

    return companyMember;
  }
}








