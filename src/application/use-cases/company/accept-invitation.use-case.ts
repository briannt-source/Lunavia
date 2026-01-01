import { prisma } from "@/lib/prisma";

export interface AcceptInvitationInput {
  guideId: string;
  invitationId: string;
  companyEmail?: string;
}

export class AcceptInvitationUseCase {
  async execute(input: AcceptInvitationInput) {
    // Get invitation
    const invitation = await prisma.companyInvitation.findUnique({
      where: { id: input.invitationId },
      include: {
        company: true,
      },
    });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status !== "PENDING") {
      throw new Error(`Invitation is already ${invitation.status}`);
    }

    // If guideId is set in invitation, verify it matches
    if (invitation.guideId && invitation.guideId !== input.guideId) {
      throw new Error("Invitation is for a different guide");
    }

    // Check if guide is already a member
    const existingMember = await prisma.companyMember.findUnique({
      where: { guideId: input.guideId },
    });

    if (existingMember) {
      throw new Error("Guide is already a member of a company");
    }

    // Update invitation status
    await prisma.companyInvitation.update({
      where: { id: input.invitationId },
      data: {
        guideId: input.guideId,
        status: "APPROVED",
      },
    });

    // Create company member
    const companyMember = await prisma.companyMember.create({
      data: {
        companyId: invitation.companyId,
        guideId: input.guideId,
        companyEmail: input.companyEmail,
        status: "APPROVED",
        approvedAt: new Date(),
      },
    });

    // Update user employment type and companyId
    await prisma.user.update({
      where: { id: input.guideId },
      data: {
        employmentType: "IN_HOUSE",
        companyId: invitation.companyId,
      },
    });

    return companyMember;
  }
}








