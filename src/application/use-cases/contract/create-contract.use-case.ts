import { prisma } from "@/lib/prisma";

export interface CreateContractInput {
  operatorId: string;
  tourId: string;
  title: string;
  content: string;
  template?: string;
}

export class CreateContractUseCase {
  async execute(input: CreateContractInput) {
    // Get tour
    const tour = await prisma.tour.findUnique({
      where: { id: input.tourId },
    });

    if (!tour) {
      throw new Error("Tour not found");
    }

    // Verify operator owns the tour
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

    // Check if contract already exists
    const existingContract = await prisma.contract.findFirst({
      where: { tourId: input.tourId },
    });

    // Create or update contract
    const contract = existingContract
      ? await prisma.contract.update({
          where: { id: existingContract.id },
          data: {
            terms: {
              title: input.title,
              content: input.content,
              template: input.template || input.content,
            },
          },
        })
      : await prisma.contract.create({
          data: {
            tourId: input.tourId,
            assignmentId: assignment.id,
            operatorId: input.operatorId,
            guideId: assignment.guideId,
            terms: {
              title: input.title,
              content: input.content,
              template: input.template || input.content,
            },
          },
        });

    return contract;
  }
}








