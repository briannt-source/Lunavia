import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/domain/services/notification.service";

export interface RejectVerificationInput {
  adminId: string;
  verificationId: string;
  adminNotes: string; // Required reason for rejection
}

export class RejectVerificationUseCase {
  async execute(input: RejectVerificationInput) {
    // Verify admin
    const admin = await prisma.adminUser.findUnique({
      where: { id: input.adminId },
    });

    if (!admin) {
      throw new Error("Admin not found");
    }

    if (!input.adminNotes || input.adminNotes.trim().length === 0) {
      throw new Error("Admin notes are required for rejection");
    }

    // Get verification
    const verification = await prisma.verification.findUnique({
      where: { id: input.verificationId },
      include: { user: true },
    });

    if (!verification) {
      throw new Error("Verification not found");
    }

    if (verification.status !== "PENDING") {
      throw new Error(`Verification is already ${verification.status}`);
    }

    // Preserve file counts from adminNotes if they exist
    const existingNotes = verification.adminNotes || "";
    const fileCountsMatch = existingNotes.match(/FILE_COUNTS:[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+/);
    const fileCountsStr = fileCountsMatch ? fileCountsMatch[0] : "";
    
    // Combine file counts with rejection reason
    const newAdminNotes = fileCountsStr 
      ? `${fileCountsStr}\n\nRejection: ${input.adminNotes}`
      : input.adminNotes;
    
    // Update verification
    await prisma.verification.update({
      where: { id: input.verificationId },
      data: {
        status: "REJECTED",
        rejectionReason: input.adminNotes,
        adminNotes: newAdminNotes,
      },
    });

    // Update user verified status
    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        verifiedStatus: "REJECTED",
      },
    });

    // Notify user
    await NotificationService.notifyVerificationStatus(
      verification.userId,
      "REJECTED"
    );

    return verification;
  }
}

