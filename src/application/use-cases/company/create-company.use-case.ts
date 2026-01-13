import { CompanyService } from "@/domain/services/company.service";
import { prisma } from "@/lib/prisma";

export interface CreateCompanyInput {
  operatorId: string;
  name: string;
  logo?: string;
  email?: string;
  website?: string;
  address?: string;
  businessLicenseNumber?: string;
  travelLicenseNumber?: string;
}

export class CreateCompanyUseCase {
  async execute(input: CreateCompanyInput) {
    // Check if operator can create company
    const canCreate = await CompanyService.canCreateCompany(input.operatorId);
    if (!canCreate.canCreate) {
      throw new Error(canCreate.reason);
    }

    // Create company using domain service
    const company = await CompanyService.createCompany(input.operatorId, {
      name: input.name,
      logo: input.logo,
      email: input.email,
      website: input.website,
      address: input.address,
      businessLicenseNumber: input.businessLicenseNumber,
      travelLicenseNumber: input.travelLicenseNumber,
    });

    return company;
  }
}














