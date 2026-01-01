import { prisma } from "@/lib/prisma";
import { VerificationService } from "@/domain/services/verification.service";

export interface SubmitKycInput {
  guideId: string;
  photoUrl: string[]; // Array of file URLs (max 5)
  idDocumentUrl: string[]; // Array of file URLs (max 5)
  licenseUrl: string[]; // Array of file URLs (max 5)
  proofOfAddressUrl: string[]; // Array of file URLs (max 5)
}

export class SubmitKycUseCase {
  async execute(input: SubmitKycInput) {
    // Verify user is a guide
    const user = await prisma.user.findUnique({
      where: { id: input.guideId },
    });

    if (!user || user.role !== "TOUR_GUIDE") {
      throw new Error("Only tour guides can submit KYC");
    }

    // Validate each field
    const validateField = (field: string[], fieldName: string) => {
      if (!field || field.length === 0) {
        throw new Error(`${fieldName} cần ít nhất 1 file`);
      }
      if (field.length > 5) {
        throw new Error(`${fieldName} chỉ được tối đa 5 files`);
      }
    };

    validateField(input.photoUrl, "Hình ảnh thật");
    validateField(input.idDocumentUrl, "CMND/CCCD/Hộ chiếu");
    validateField(input.licenseUrl, "Thẻ HDV du lịch");
    validateField(input.proofOfAddressUrl, "Chứng minh nơi ở");

    // Check if verification exists
    const existing = await prisma.verification.findFirst({
      where: {
        userId: input.guideId,
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
      ...(input.proofOfAddressUrl || []).filter(Boolean),
    ];
    
    const fileCounts = `FILE_COUNTS:${(input.photoUrl || []).length}|${(input.idDocumentUrl || []).length}|${(input.licenseUrl || []).length}|0|${(input.proofOfAddressUrl || []).length}`;
    
    console.log(`[SubmitKycUseCase] Preparing to save:`, {
      documentsArrayLength: documentsArray.length,
      photoUrlCount: (input.photoUrl || []).length,
      idDocumentUrlCount: (input.idDocumentUrl || []).length,
      licenseUrlCount: (input.licenseUrl || []).length,
      proofOfAddressUrlCount: (input.proofOfAddressUrl || []).length,
      fileCounts,
    });
    
    let verification;
    if (existing) {
      console.log(`[SubmitKycUseCase] Updating existing verification: ${existing.id}`);
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
          proofOfAddressUrl: input.proofOfAddressUrl?.[0] || null,
          adminNotes: fileCounts,
          updatedAt: new Date(),
        },
      });
      console.log(`[SubmitKycUseCase] ✅ Updated verification ${verification.id}`);
    } else {
      console.log(`[SubmitKycUseCase] Creating new verification`);
      verification = await prisma.verification.create({
        data: {
          userId: input.guideId,
          status: "PENDING",
          documents: documentsArray,
          photoUrl: input.photoUrl?.[0] || null,
          idDocumentUrl: input.idDocumentUrl?.[0] || null,
          licenseUrl: input.licenseUrl?.[0] || null,
          proofOfAddressUrl: input.proofOfAddressUrl?.[0] || null,
          adminNotes: fileCounts,
        },
      });
      console.log(`[SubmitKycUseCase] ✅ Created verification ${verification.id}`);
    }
    
    // Verify what was saved
    const saved = await prisma.verification.findUnique({
      where: { id: verification.id },
      select: {
        documents: true,
        photoUrl: true,
        idDocumentUrl: true,
        licenseUrl: true,
        proofOfAddressUrl: true,
        adminNotes: true,
      },
    });
    
    console.log(`[SubmitKycUseCase] Verification after save:`, {
      documentsArrayLength: Array.isArray(saved?.documents) ? saved.documents.length : 0,
      photoUrl: saved?.photoUrl ? "✅" : "❌",
      idDocumentUrl: saved?.idDocumentUrl ? "✅" : "❌",
      licenseUrl: saved?.licenseUrl ? "✅" : "❌",
      proofOfAddressUrl: saved?.proofOfAddressUrl ? "✅" : "❌",
      adminNotes: saved?.adminNotes ? "✅" : "❌",
    });

    // Update user verified status
    await prisma.user.update({
      where: { id: input.guideId },
      data: {
        verifiedStatus: "PENDING",
      },
    });

    return verification;
  }
}

