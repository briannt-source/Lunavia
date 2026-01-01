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
              ? "Cần hoàn tất KYB trước khi tạo tour"
              : user.verifiedStatus === "PENDING"
              ? "KYB đang chờ duyệt"
              : "KYB bị từ chối. Vui lòng kiểm tra và nộp lại",
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
              ? "Cần hoàn tất KYC trước khi ứng tuyển tour"
              : user.verifiedStatus === "PENDING"
              ? "KYC đang chờ duyệt"
              : "KYC bị từ chối. Vui lòng kiểm tra và nộp lại",
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
            label: "Hình ảnh thật",
            key: "photoUrl",
            required: true,
            description: "Ảnh chân dung rõ ràng của người đại diện",
          },
          {
            label: "CMND/CCCD/Hộ chiếu",
            key: "idDocumentUrl",
            required: true,
            description: "Giấy tờ pháp lý cá nhân của người đại diện",
          },
          {
            label: "Giấy phép kinh doanh",
            key: "licenseUrl",
            required: true,
            description: "Giấy phép đăng ký kinh doanh",
          },
          {
            label: "Giấy phép lữ hành quốc tế/nội địa",
            key: "travelLicenseUrl",
            required: true,
            description: "Giấy phép lữ hành quốc tế hoặc nội địa",
          },
          {
            label: "Chứng minh nơi ở (Proof of Address)",
            key: "proofOfAddressUrl",
            required: true,
            description: "Giấy tờ chứng minh địa chỉ công ty (hóa đơn điện nước, hợp đồng thuê, v.v.)",
          },
        ],
      };
    }

    return {
      type: "KYC",
      documents: [
        {
          label: "Hình ảnh thật",
          key: "photoUrl",
          required: true,
          description: "Ảnh chân dung rõ ràng của bạn",
        },
        {
          label: "CMND/CCCD/Hộ chiếu",
          key: "idDocumentUrl",
          required: true,
          description: "Giấy tờ pháp lý cá nhân",
        },
        {
          label: "Thẻ HDV du lịch",
          key: "licenseUrl",
          required: true,
          description: "Thẻ hướng dẫn viên du lịch (bắt buộc)",
        },
        {
          label: "Chứng minh nơi ở (Proof of Address)",
          key: "proofOfAddressUrl",
          required: true,
          description: "Giấy tờ chứng minh địa chỉ cư trú (hóa đơn điện nước, sổ hộ khẩu, v.v.)",
        },
      ],
    };
  }
}

