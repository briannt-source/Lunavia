import { prisma } from "@/lib/prisma";

/**
 * Domain Service for Company operations
 * Handles Company ID generation and company-related business logic
 */
export class CompanyService {
  /**
   * Generate Company ID from company name
   * Format: First letter of each word + sequence number
   * Example: "Sea You Travel JSC" -> "SYT-001", "SYT-002", etc.
   */
  static async generateCompanyId(companyName: string): Promise<string> {
    // Extract first letter of each word
    const words = companyName.trim().split(/\s+/);
    const initials = words
      .map((word) => word.charAt(0).toUpperCase())
      .filter((char) => /[A-Z]/.test(char))
      .join("");

    if (initials.length === 0) {
      throw new Error("Company name must contain at least one letter");
    }

    // Find the highest sequence number for this prefix
    const existingCompanies = await prisma.company.findMany({
      where: {
        companyId: {
          startsWith: initials + "-",
        },
      },
      orderBy: {
        companyId: "desc",
      },
      take: 1,
    });

    let sequence = 1;
    if (existingCompanies.length > 0) {
      const lastCompanyId = existingCompanies[0].companyId;
      const lastSequence = parseInt(lastCompanyId.split("-")[1] || "0");
      sequence = lastSequence + 1;
    }

    // Format: SYT-001, SYT-002, etc.
    const companyId = `${initials}-${sequence.toString().padStart(3, "0")}`;

    // Ensure uniqueness
    const exists = await prisma.company.findUnique({
      where: { companyId },
    });

    if (exists) {
      // If exists, increment and try again
      return this.generateCompanyId(companyName + " "); // Add space to force new sequence
    }

    return companyId;
  }

  /**
   * Check for duplicate company information
   */
  static async checkDuplicateCompanyInfo(data: {
    name?: string;
    businessLicenseNumber?: string;
    travelLicenseNumber?: string;
    email?: string;
  }): Promise<{
    hasDuplicate: boolean;
    duplicateFields: string[];
    reason?: string;
  }> {
    const duplicateFields: string[] = [];
    const conditions: any[] = [];

    // Check duplicate name (case-insensitive)
    if (data.name) {
      const existingByName = await prisma.company.findFirst({
        where: {
          name: {
            equals: data.name.trim(),
            mode: "insensitive",
          },
        },
      });
      if (existingByName) {
        duplicateFields.push("name");
        conditions.push(`Tên công ty "${data.name}" đã được sử dụng`);
      }
    }

    // Check duplicate business license number
    if (data.businessLicenseNumber) {
      const existingByLicense = await prisma.company.findFirst({
        where: {
          businessLicenseNumber: {
            equals: data.businessLicenseNumber.trim(),
            mode: "insensitive",
          },
        },
      });
      if (existingByLicense) {
        duplicateFields.push("businessLicenseNumber");
        conditions.push(
          `Số đăng ký kinh doanh "${data.businessLicenseNumber}" đã được sử dụng`
        );
      }
    }

    // Check duplicate travel license number
    if (data.travelLicenseNumber) {
      const existingByTravelLicense = await prisma.company.findFirst({
        where: {
          travelLicenseNumber: {
            equals: data.travelLicenseNumber.trim(),
            mode: "insensitive",
          },
        },
      });
      if (existingByTravelLicense) {
        duplicateFields.push("travelLicenseNumber");
        conditions.push(
          `Số giấy phép lữ hành "${data.travelLicenseNumber}" đã được sử dụng`
        );
      }
    }

    // Check duplicate email
    if (data.email) {
      const existingByEmail = await prisma.company.findFirst({
        where: {
          email: {
            equals: data.email.trim().toLowerCase(),
            mode: "insensitive",
          },
        },
      });
      if (existingByEmail) {
        duplicateFields.push("email");
        conditions.push(`Email "${data.email}" đã được sử dụng`);
      }
    }

    return {
      hasDuplicate: duplicateFields.length > 0,
      duplicateFields,
      reason: conditions.join(". "),
    };
  }

  /**
   * Check if operator can create company
   */
  static async canCreateCompany(operatorId: string): Promise<{
    canCreate: boolean;
    reason?: string;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: operatorId },
    });

    if (!user) {
      return { canCreate: false, reason: "User not found" };
    }

    if (user.role !== "TOUR_OPERATOR" && user.role !== "TOUR_AGENCY") {
      return {
        canCreate: false,
        reason: "Chỉ Tour Operator/Agency được tạo company",
      };
    }

    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { operatorId },
    });

    if (existingCompany) {
      return {
        canCreate: false,
        reason: "Company đã tồn tại cho operator này",
      };
    }

    return { canCreate: true };
  }

  /**
   * Create company for operator
   */
  static async createCompany(
    operatorId: string,
    data: {
      name: string;
      logo?: string;
      email?: string;
      website?: string;
      address?: string;
      businessLicenseNumber?: string;
      travelLicenseNumber?: string;
    }
  ) {
    const canCreate = await this.canCreateCompany(operatorId);
    if (!canCreate.canCreate) {
      throw new Error(canCreate.reason);
    }

    // Check for duplicate information
    const duplicateCheck = await this.checkDuplicateCompanyInfo({
      name: data.name,
      businessLicenseNumber: data.businessLicenseNumber,
      travelLicenseNumber: data.travelLicenseNumber,
      email: data.email,
    });

    if (duplicateCheck.hasDuplicate) {
      throw new Error(
        `Thông tin công ty bị trùng lặp: ${duplicateCheck.reason}. Vui lòng kiểm tra lại thông tin để tránh giả mạo.`
      );
    }

    const companyId = await this.generateCompanyId(data.name);

    try {
      return await prisma.company.create({
        data: {
          companyId,
          operatorId,
          name: data.name.trim(),
          email: data.email?.trim().toLowerCase() || undefined,
          website: data.website?.trim() || undefined,
          address: data.address?.trim() || undefined,
          businessLicenseNumber: data.businessLicenseNumber?.trim() || undefined,
          travelLicenseNumber: data.travelLicenseNumber?.trim() || undefined,
          logo: data.logo,
        },
      });
    } catch (error: any) {
      // Handle Prisma unique constraint errors
      if (error.code === "P2002") {
        const field = error.meta?.target?.[0];
        let fieldName = "thông tin";
        if (field === "email") fieldName = "Email công ty";
        else if (field === "businessLicenseNumber")
          fieldName = "Số đăng ký kinh doanh";
        else if (field === "travelLicenseNumber")
          fieldName = "Số giấy phép lữ hành";

        throw new Error(
          `${fieldName} đã được sử dụng bởi công ty khác. Vui lòng kiểm tra lại để tránh trùng lặp và giả mạo.`
        );
      }
      throw error;
    }
  }
}




