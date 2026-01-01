import { prisma } from "@/lib/prisma";
import { VerificationService } from "@/domain/services/verification.service";

export interface SubmitKybInput {
  operatorId: string;
  photoUrl: string[]; // Array of file URLs (max 5)
  idDocumentUrl: string[]; // Array of file URLs (max 5)
  licenseUrl: string[]; // Array of file URLs (max 5)
  travelLicenseUrl: string[]; // Array of file URLs (max 5, optional for TOUR_AGENCY)
  proofOfAddressUrl: string[]; // Array of file URLs (max 5)
}

export class SubmitKybUseCase {
  async execute(input: SubmitKybInput) {
    // Verify user is an operator
    const user = await prisma.user.findUnique({
      where: { id: input.operatorId },
    });

    if (
      !user ||
      (user.role !== "TOUR_OPERATOR" && user.role !== "TOUR_AGENCY")
    ) {
      throw new Error("Only tour operators/agencies can submit KYB");
    }

    // Validate each field
    const validateField = (field: string[], fieldName: string, required: boolean = true) => {
      if (required && (!field || field.length === 0)) {
        throw new Error(`${fieldName} cần ít nhất 1 file`);
      }
      if (field && field.length > 5) {
        throw new Error(`${fieldName} chỉ được tối đa 5 files`);
      }
    };

    validateField(input.photoUrl, "Hình ảnh thật");
    validateField(input.idDocumentUrl, "CMND/CCCD/Hộ chiếu");
    validateField(input.licenseUrl, "Giấy phép kinh doanh");
    if (user.role === "TOUR_OPERATOR") {
      validateField(input.travelLicenseUrl, "Giấy phép lữ hành quốc tế/nội địa");
    }
    validateField(input.proofOfAddressUrl, "Chứng minh nơi ở");

    // Check if verification exists
    const existing = await prisma.verification.findFirst({
      where: {
        userId: input.operatorId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Prepare documents array
    const documentsArray = [
      ...(input.photoUrl || []).filter(Boolean),
      ...(input.idDocumentUrl || []).filter(Boolean),
      ...(input.licenseUrl || []).filter(Boolean),
      ...(input.travelLicenseUrl || []).filter(Boolean),
      ...(input.proofOfAddressUrl || []).filter(Boolean),
    ];
    
    const fileCounts = `FILE_COUNTS:${(input.photoUrl || []).length}|${(input.idDocumentUrl || []).length}|${(input.licenseUrl || []).length}|${(input.travelLicenseUrl || []).length}|${(input.proofOfAddressUrl || []).length}`;
    
    console.log(`[SubmitKybUseCase] Preparing to save:`, {
      documentsArrayLength: documentsArray.length,
      photoUrlCount: (input.photoUrl || []).length,
      idDocumentUrlCount: (input.idDocumentUrl || []).length,
      licenseUrlCount: (input.licenseUrl || []).length,
      travelLicenseUrlCount: (input.travelLicenseUrl || []).length,
      proofOfAddressUrlCount: (input.proofOfAddressUrl || []).length,
      fileCounts,
    });
    
    let verification;
    if (existing) {
      console.log(`[SubmitKybUseCase] Updating existing verification: ${existing.id}`);
      verification = await prisma.verification.update({
        where: {
          id: existing.id,
        },
        data: {
          status: "PENDING",
          documents: documentsArray,
          photoUrl: input.photoUrl?.[0] || null,
          idDocumentUrl: input.idDocumentUrl?.[0] || null,
          licenseUrl: input.licenseUrl?.[0] || null,
          travelLicenseUrl: input.travelLicenseUrl?.[0] || null,
          proofOfAddressUrl: input.proofOfAddressUrl?.[0] || null,
          adminNotes: fileCounts,
          updatedAt: new Date(),
        },
      });
      console.log(`[SubmitKybUseCase] ✅ Updated verification ${verification.id}`);
    } else {
      console.log(`[SubmitKybUseCase] Creating new verification`);
      verification = await prisma.verification.create({
        data: {
          userId: input.operatorId,
          status: "PENDING",
          documents: documentsArray,
          photoUrl: input.photoUrl?.[0] || null,
          idDocumentUrl: input.idDocumentUrl?.[0] || null,
          licenseUrl: input.licenseUrl?.[0] || null,
          travelLicenseUrl: input.travelLicenseUrl?.[0] || null,
          proofOfAddressUrl: input.proofOfAddressUrl?.[0] || null,
          adminNotes: fileCounts,
        },
      });
      console.log(`[SubmitKybUseCase] ✅ Created verification ${verification.id}`);
    }
    
    // Verify what was saved
    const saved = await prisma.verification.findUnique({
      where: { id: verification.id },
      select: {
        documents: true,
        photoUrl: true,
        idDocumentUrl: true,
        licenseUrl: true,
        travelLicenseUrl: true,
        proofOfAddressUrl: true,
        adminNotes: true,
      },
    });
    
    console.log(`[SubmitKybUseCase] Verification after save:`, {
      documentsArrayLength: Array.isArray(saved?.documents) ? saved.documents.length : 0,
      photoUrl: saved?.photoUrl ? "✅" : "❌",
      idDocumentUrl: saved?.idDocumentUrl ? "✅" : "❌",
      licenseUrl: saved?.licenseUrl ? "✅" : "❌",
      travelLicenseUrl: saved?.travelLicenseUrl ? "✅" : "❌",
      proofOfAddressUrl: saved?.proofOfAddressUrl ? "✅" : "❌",
      adminNotes: saved?.adminNotes ? "✅" : "❌",
    });

    // Update user verified status
    await prisma.user.update({
      where: { id: input.operatorId },
      data: {
        verifiedStatus: "PENDING",
      },
    });

    return verification;
  }
}

