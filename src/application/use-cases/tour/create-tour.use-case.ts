import { prisma } from "@/lib/prisma";
import { WalletService } from "@/domain/services/wallet.service";
import { generateTourCode } from "@/lib/tour-code-generator";

export interface CreateTourInput {
  operatorId: string;
  title: string;
  description: string;
  city: string;
  visibility: "PUBLIC" | "PRIVATE";
  status?: "DRAFT" | "OPEN" | "IN_PROGRESS" | "COMPLETED";
  priceMain?: number;
  priceSub?: number;
  currency: string;
  pax: number;
  languages: string[];
  specialties: string[];
  startDate: Date;
  endDate?: Date;
  durationHours?: number;
  files?: string[];
  itinerary?: any[];
  mainGuideSlots?: number;
  subGuideSlots?: number;
  inclusions?: string[];
  exclusions?: string[];
  additionalRequirements?: string;
  guideNotes?: string;
}

export class CreateTourUseCase {
  async execute(input: CreateTourInput) {
    // Check if operator can create tour
    const canCreate = await WalletService.canCreateTour(input.operatorId);
    if (!canCreate.canCreate) {
      throw new Error(canCreate.reason);
    }

    // Generate unique tour code
    const code = await generateTourCode();

    // Create tour
    const tour = await prisma.tour.create({
      data: {
        code,
        operatorId: input.operatorId,
        title: input.title,
        description: input.description,
        city: input.city,
        visibility: input.visibility,
        priceMain: input.priceMain,
        priceSub: input.priceSub,
        currency: input.currency,
        pax: input.pax,
        languages: input.languages,
        specialties: input.specialties,
        startDate: input.startDate,
        endDate: input.endDate,
        durationHours: input.durationHours,
        files: input.files || [],
        itinerary: input.itinerary || [],
        mainGuideSlots: input.mainGuideSlots || 1,
        subGuideSlots: input.subGuideSlots || 0,
        inclusions: input.inclusions || [],
        exclusions: input.exclusions || [],
        additionalRequirements: input.additionalRequirements,
        guideNotes: input.guideNotes,
        status: input.status || "DRAFT",
      },
    });

    return tour;
  }
}

