import { prisma } from "@/lib/prisma";

export interface RequestJoinCompanyInput {
  guideId: string;
  companyId: string;
  message?: string;
}

export class RequestJoinCompanyUseCase {
  async execute(input: RequestJoinCompanyInput) {
    // Check if guide exists
    const guide = await prisma.user.findUnique({
      where: { id: input.guideId },
    });

    if (!guide || guide.role !== "TOUR_GUIDE") {
      throw new Error("Guide not found");
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: input.companyId },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    // Check if already a member
    const existingMember = await prisma.companyMember.findUnique({
      where: { guideId: input.guideId },
    });

    if (existingMember) {
      throw new Error("Guide is already a member of a company");
    }

    // Check if request already exists
    const existingRequest = await prisma.joinRequest.findUnique({
      where: {
        companyId_guideId: {
          companyId: input.companyId,
          guideId: input.guideId,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        throw new Error("Join request already pending");
      }
      // If rejected, create new request
    }

    // Create join request
    const joinRequest = await prisma.joinRequest.upsert({
      where: {
        companyId_guideId: {
          companyId: input.companyId,
          guideId: input.guideId,
        },
      },
      update: {
        message: input.message,
        status: "PENDING",
      },
      create: {
        companyId: input.companyId,
        guideId: input.guideId,
        message: input.message,
        status: "PENDING",
      },
    });

    return joinRequest;
  }
}









