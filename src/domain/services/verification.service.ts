import { prisma } from "@/lib/prisma";
import { LegalRole, VerificationStatus } from "@prisma/client";

/**
 * Domain Service for KYC/KYB verification
 */
export class VerificationService {
  /**
   * Check if user can perform action based on verification status
   */
  static async canPerformAction(
    userId: string,
    action: "create_tour" | "apply_tour"
  ): Promise<{
    canPerform: boolean;
    reason?: string;
    requiredStatus: VerificationStatus;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        verifications: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return {
        canPerform: false,
        reason: "User not found",
        requiredStatus: "NOT_SUBMITTED",
      };
    }

    // For operators: KYB required
    if (
      (user.role === "TOUR_OPERATOR" || user.role === "TOUR_AGENCY") &&
      action === "create_tour"
    ) {
      if (user.verifiedStatus !== "APPROVED") {
        return {
          canPerform: false,
          reason:
            user.verifiedStatus === "NOT_SUBMITTED"
              ? "KYB must be completed before creating tours"
              : user.verifiedStatus === "PENDING"
              ? "KYB is pending review"
              : "KYB has been rejected. Please review and resubmit",
          requiredStatus: "APPROVED",
        };
      }
    }

    // For guides: KYC required
    if (user.role === "TOUR_GUIDE" && action === "apply_tour") {
      if (user.verifiedStatus !== "APPROVED") {
        return {
          canPerform: false,
          reason:
            user.verifiedStatus === "NOT_SUBMITTED"
              ? "KYC must be completed before applying for tours"
              : user.verifiedStatus === "PENDING"
              ? "KYC is pending review"
              : "KYC has been rejected. Please review and resubmit",
          requiredStatus: "APPROVED",
        };
      }
    }

    return {
      canPerform: true,
      requiredStatus: "APPROVED",
    };
  }

  /**
   * Get verification requirements based on user role
   */
  static getVerificationRequirements(role: LegalRole): {
    type: "KYC" | "KYB";
    documents: {
      label: string;
      key: string;
      required: boolean;
      description?: string;
    }[];
  } {
    if (role === "TOUR_OPERATOR" || role === "TOUR_AGENCY") {
      return {
        type: "KYB",
        documents: [
          {
            label: "Real Photo",
            key: "photoUrl",
            required: true,
            description: "Clear portrait photo of the representative",
          },
          {
            label: "National ID / Passport",
            key: "idDocumentUrl",
            required: true,
            description: "Personal legal documents of the representative",
          },
          {
            label: "Business License",
            key: "licenseUrl",
            required: true,
            description: "Business registration license",
          },
          {
            label: "Int'l/Domestic Travel License",
            key: "travelLicenseUrl",
            required: true,
            description: "International or domestic travel license",
          },
          {
            label: "Proof of Address",
            key: "proofOfAddressUrl",
            required: true,
            description: "Documents proving company address (utility bills, lease agreements, etc.)",
          },
        ],
      };
    }

    return {
      type: "KYC",
      documents: [
        {
          label: "Real Photo",
          key: "photoUrl",
          required: true,
          description: "A clear portrait photo of yourself",
        },
        {
          label: "National ID / Passport",
          key: "idDocumentUrl",
          required: true,
          description: "Personal legal documents",
        },
        {
          label: "Tour Guide License",
          key: "licenseUrl",
          required: true,
          description: "Tour guide license (required)",
        },
        {
          label: "Proof of Address",
          key: "proofOfAddressUrl",
          required: true,
          description: "Proof of residential address (utility bills, household register, etc.)",
        },
      ],
    };
  }
}

