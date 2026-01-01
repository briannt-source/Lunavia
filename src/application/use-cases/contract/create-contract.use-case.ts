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

    // Create contract
    const contract = await prisma.contract.upsert({
      where: { tourId: input.tourId },
      update: {
        title: input.title,
        content: input.content,
        templateContent: input.template || input.content,
      },
      create: {
        tourId: input.tourId,
        title: input.title,
        content: input.content,
        templateContent: input.template || input.content,
      },
    });

    return contract;
  }
}








