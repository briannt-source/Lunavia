import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/domain/services/notification.service";

export interface ApproveVerificationInput {
  adminId: string;
  verificationId: string;
  adminNotes?: string;
}

export class ApproveVerificationUseCase {
  async execute(input: ApproveVerificationInput) {
    // Verify admin
    const admin = await prisma.adminUser.findUnique({
      where: { id: input.adminId },
    });

    if (!admin) {
      throw new Error("Admin not found");
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
    
    // Combine file counts with new admin notes
    const newAdminNotes = input.adminNotes 
      ? (fileCountsStr ? `${fileCountsStr}\n\n${input.adminNotes}` : input.adminNotes)
      : (fileCountsStr || null);
    
    // Update verification
    await prisma.verification.update({
      where: { id: input.verificationId },
      data: {
        status: "APPROVED",
        adminNotes: newAdminNotes,
      },
    });

    // Update user verified status
    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        verifiedStatus: "APPROVED",
      },
    });

    // Notify user
    await NotificationService.notifyVerificationStatus(
      verification.userId,
      "APPROVED"
    );

    return verification;
  }
}

