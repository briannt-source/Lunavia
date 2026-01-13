import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export interface InviteGuideToCompanyInput {
  operatorId: string;
  companyId: string;
  guideId?: string;
  email?: string;
}

export class InviteGuideToCompanyUseCase {
  async execute(input: InviteGuideToCompanyInput) {
    // Verify operator owns the company
    const company = await prisma.company.findUnique({
      where: { id: input.companyId },
      include: { operator: true },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    if (company.operatorId !== input.operatorId) {
      throw new Error("Unauthorized: Operator does not own this company");
    }

    // If guideId provided, verify guide exists
    if (input.guideId) {
      const guide = await prisma.user.findUnique({
        where: { id: input.guideId },
      });

      if (!guide || guide.role !== "TOUR_GUIDE") {
        throw new Error("Guide not found");
      }

      // Check if already a member
      const existingMember = await prisma.companyMember.findUnique({
        where: { guideId: input.guideId },
      });

      if (existingMember) {
        throw new Error("Guide is already a member of a company");
      }
    }

    // Generate invite token
    const inviteToken = randomBytes(32).toString("hex");

    // Create invitation
    const invitation = await prisma.companyInvitation.create({
      data: {
        companyId: input.companyId,
        guideId: input.guideId,
        email: input.email,
        inviteToken,
        invitedBy: input.operatorId,
        status: "PENDING",
      },
    });

    return {
      ...invitation,
      inviteLink: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/signup?company=${company.companyId}&token=${inviteToken}&type=in_house`,
    };
  }
}














