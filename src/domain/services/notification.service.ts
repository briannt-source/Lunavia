import { prisma } from "@/lib/prisma";
import { SendNotificationUseCase } from "@/application/use-cases/notification/send-notification.use-case";

/**
 * Domain Service for sending notifications
 * Handles automatic notifications for various events
 * Respects user notification preferences
 */
export class NotificationService {
  /**
   * Check if user wants to receive email notification for a specific type
   */
  private static async shouldSendEmail(
    userId: string,
    notificationType: string
  ): Promise<boolean> {
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings || !settings.inAppNotifications) {
      return false; // Don't send if in-app notifications are disabled
    }

    // Map notification types to settings fields
    const typeMap: Record<string, keyof typeof settings> = {
      NEW_APPLICATION: "emailNewApplication",
      APPLICATION_ACCEPTED: "emailApplicationStatus",
      APPLICATION_REJECTED: "emailApplicationStatus",
      PAYMENT_RECEIVED: "emailPayment",
      PAYMENT_SENT: "emailPayment",
      TOUR_STARTED: "emailTourStarted",
      TOUR_CANCELLED: "emailTourCancelled",
      NEW_MESSAGE: "emailMessage",
      REPORT_SUBMITTED: "emailReportSubmitted",
      PAYMENT_REQUEST: "emailPaymentRequest",
      EMERGENCY: "emailEmergency",
      SOS: "emailEmergency",
      STANDBY_REQUEST: "emailNewApplication", // Use same setting as new application
      STANDBY_ACCEPTED: "emailApplicationStatus", // Use same setting as application status
      STANDBY_REJECTED: "emailApplicationStatus",
      DISPUTE_CREATED: "emailPayment", // Use payment setting
      DISPUTE_RESOLVED: "emailPayment",
      DISPUTE_APPEALED: "emailPayment",
      NEW_REVIEW: "emailPayment", // Use payment setting for reviews
      NEW_CONTRACT: "emailPayment", // Use payment setting for contracts
      CONTRACT_ACCEPTED: "emailPayment", // Use payment setting for contracts
      EMERGENCY_RESPONSE: "emailEmergency", // Use emergency setting
    } as Record<string, keyof typeof settings>;

    const settingKey = typeMap[notificationType];
    if (!settingKey) {
      return true; // Default to true for unknown types
    }

    const settingValue = settings[settingKey];
    return typeof settingValue === 'boolean' ? settingValue : true;
  }

  /**
   * Send notification when application is created
   */
  static async notifyNewApplication(operatorId: string, applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        guide: {
          include: { profile: true },
        },
        tour: true,
      },
    });

    if (!application) return;

    // Always create in-app notification
    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: operatorId,
      type: "NEW_APPLICATION",
      title: "Ứng tuyển mới",
      message: `${application.guide.profile?.name || application.guide.email} đã ứng tuyển cho tour "${application.tour.title}"`,
      link: `/tours/${application.tourId}/applications`,
    });

    // Send email only if user has enabled it
    const shouldEmail = await this.shouldSendEmail(operatorId, "NEW_APPLICATION");
    if (shouldEmail) {
      // TODO: Implement email sending service
      // await EmailService.send({
      //   to: user.email,
      //   subject: "Ứng tuyển mới",
      //   template: "new-application",
      //   data: { ... }
      // });
    }
  }

  /**
   * Send notification when application is accepted/rejected
   */
  static async notifyApplicationStatus(
    guideId: string,
    applicationId: string,
    status: "ACCEPTED" | "REJECTED"
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        tour: true,
      },
    });

    if (!application) return;

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: guideId,
      type: `APPLICATION_${status}`,
      title: status === "ACCEPTED" ? "Ứng tuyển được chấp nhận" : "Ứng tuyển bị từ chối",
      message:
        status === "ACCEPTED"
          ? `Bạn đã được chấp nhận cho tour "${application.tour.title}"`
          : `Ứng tuyển của bạn cho tour "${application.tour.title}" đã bị từ chối`,
      link: `/tours/${application.tourId}`,
    });

    const shouldEmail = await this.shouldSendEmail(guideId, `APPLICATION_${status}`);
    if (shouldEmail) {
      // TODO: Send email
    }
  }

  /**
   * Send notification when assignment is created
   */
  static async notifyNewAssignment(guideId: string, assignmentId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        tour: true,
      },
    });

    if (!assignment) return;

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: guideId,
      type: "NEW_ASSIGNMENT",
      title: "Phân công mới",
      message: `Bạn đã được phân công cho tour "${assignment.tour.title}"`,
      link: `/assignments/${assignmentId}`,
    });
  }

  /**
   * Send notification when payment is sent
   */
  static async notifyPaymentSent(guideId: string, paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        tour: true,
      },
    });

    if (!payment) return;

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: guideId,
      type: "PAYMENT_RECEIVED",
      title: "Thanh toán nhận được",
      message: `Bạn đã nhận được ${payment.amount.toLocaleString("vi-VN")} VND cho tour "${payment.tour?.title || ""}"`,
      link: `/wallet`,
    });

    const shouldEmail = await this.shouldSendEmail(guideId, "PAYMENT_RECEIVED");
    if (shouldEmail) {
      // TODO: Send email
    }
  }

  /**
   * Send notification when verification status changes
   */
  static async notifyVerificationStatus(
    userId: string,
    status: "APPROVED" | "REJECTED"
  ) {
    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId,
      type: `VERIFICATION_${status}`,
      title:
        status === "APPROVED"
          ? "Xác minh được duyệt"
          : "Xác minh bị từ chối",
      message:
        status === "APPROVED"
          ? "Yêu cầu xác minh của bạn đã được duyệt"
          : "Yêu cầu xác minh của bạn đã bị từ chối. Vui lòng kiểm tra và nộp lại.",
      link: `/dashboard/profile`,
    });
  }

  /**
   * Send notification when tour starts (status changes to IN_PROGRESS)
   */
  static async notifyTourStarted(tourId: string) {
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        operator: true,
        applications: {
          where: { status: "ACCEPTED" },
          include: {
            guide: true,
          },
        },
        assignments: {
          where: { status: "APPROVED" },
          include: {
            guide: true,
          },
        },
      },
    });

    if (!tour) return;

    const useCase = new SendNotificationUseCase();

    // Format date and time
    const formatDateTime = (date: Date | null) => {
      if (!date) return "";
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(date));
    };

    const startDateTime = formatDateTime(tour.startDate);
    const endDateTime = tour.endDate ? formatDateTime(tour.endDate) : "";

    // Notify operator
    await useCase.execute({
      userId: tour.operatorId,
      type: "TOUR_STARTED",
      title: "Tour đã đến giờ khởi hành",
      message: `Tour "${tour.title}" đã đến giờ khởi hành. Ngày và giờ khởi hành: ${startDateTime}${endDateTime ? `. Ngày và giờ kết thúc: ${endDateTime}` : ""}`,
      link: `/tours/${tourId}`,
    });

    const shouldEmailOperator = await this.shouldSendEmail(tour.operatorId, "TOUR_STARTED");
    if (shouldEmailOperator) {
      // TODO: Send email to operator
    }

    // Notify all accepted guides
    const allGuides = [
      ...tour.applications.map((app) => app.guide),
      ...tour.assignments.map((assign) => assign.guide),
    ];

    // Remove duplicates (in case guide has both application and assignment)
    const uniqueGuides = Array.from(
      new Map(allGuides.map((guide) => [guide.id, guide])).values()
    );

    for (const guide of uniqueGuides) {
      await useCase.execute({
        userId: guide.id,
        type: "TOUR_STARTED",
        title: "Tour đã bắt đầu chạy",
        message: `Tour "${tour.title}" đã bắt đầu chạy. Ngày và giờ khởi hành: ${startDateTime}${endDateTime ? `. Ngày và giờ kết thúc: ${endDateTime}` : ""}. Hãy đảm bảo bạn đến đúng giờ và tuân thủ quy định của tour operator. Chúc bạn một chuyến đi tốt lành và hoàn thành tốt nhiệm vụ!`,
        link: `/tours/${tourId}`,
      });

      const shouldEmailGuide = await this.shouldSendEmail(guide.id, "TOUR_STARTED");
      if (shouldEmailGuide) {
        // TODO: Send email to guide
      }
    }
  }

  /**
   * Send notification when tour is blocked
   */
  static async notifyTourBlocked(
    tourId: string,
    reason: string,
    notes?: string
  ) {
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        operator: true,
        applications: {
          where: { status: { in: ["PENDING", "ACCEPTED"] } },
          include: { guide: true },
        },
      },
    });

    if (!tour) return;

    const useCase = new SendNotificationUseCase();

    // Notify operator
    await useCase.execute({
      userId: tour.operatorId,
      type: "TOUR_BLOCKED",
      title: "Tour của bạn đã bị đóng",
      message: `Tour "${tour.title}" đã bị đóng bởi admin/moderator. Lý do: ${reason}. ${notes ? `Ghi chú: ${notes}` : ""}`,
      link: `/tours/${tourId}`,
    });

    const shouldEmailOperator = await this.shouldSendEmail(tour.operatorId, "TOUR_CANCELLED");
    if (shouldEmailOperator) {
      // TODO: Send email
    }

    // Notify guides
    for (const app of tour.applications) {
      await useCase.execute({
        userId: app.guideId,
        type: "TOUR_BLOCKED",
        title: "Tour bạn đã ứng tuyển đã bị đóng",
        message: `Tour "${tour.title}" mà bạn đã ứng tuyển đã bị đóng bởi admin/moderator.`,
        link: `/tours/${tourId}`,
      });

      const shouldEmailGuide = await this.shouldSendEmail(app.guideId, "TOUR_CANCELLED");
      if (shouldEmailGuide) {
        // TODO: Send email
      }
    }
  }

  /**
   * Send notification when tour is unblocked
   */
  static async notifyTourUnblocked(tourId: string) {
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) return;

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: tour.operatorId,
      type: "TOUR_UNBLOCKED",
      title: "Tour của bạn đã được mở lại",
      message: `Tour "${tour.title}" đã được mở lại bởi admin/moderator.`,
      link: `/tours/${tourId}`,
    });

    const shouldEmail = await this.shouldSendEmail(tour.operatorId, "TOUR_CANCELLED");
    if (shouldEmail) {
      // TODO: Send email
    }
  }

  /**
   * Send notification when tour is cancelled (no guides)
   */
  static async notifyTourCancelled(tourId: string, reason?: string) {
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        operator: true,
      },
    });

    if (!tour) return;

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: tour.operatorId,
      type: "TOUR_CANCELLED",
      title: "Tour đã bị hủy",
      message: `Tour "${tour.title}" đã bị hủy. ${reason || "Không tìm được guide phù hợp."}`,
      link: `/tours/${tourId}`,
    });

    const shouldEmail = await this.shouldSendEmail(tour.operatorId, "TOUR_CANCELLED");
    if (shouldEmail) {
      // TODO: Send email
    }
  }

  /**
   * Send notification when report is submitted
   */
  static async notifyReportSubmitted(operatorId: string, tourId: string, guideId: string) {
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) return;

    // Get guide info separately
    const guide = await prisma.user.findUnique({
      where: { id: guideId },
      include: { profile: true },
    });

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: operatorId,
      type: "REPORT_SUBMITTED",
      title: "Báo cáo tour mới",
      message: `${guide?.profile?.name || guide?.email || "Guide"} đã nộp báo cáo cho tour "${tour.title}"`,
      link: `/tours/${tourId}/reports`,
    });

    const shouldEmail = await this.shouldSendEmail(operatorId, "REPORT_SUBMITTED");
    if (shouldEmail) {
      // TODO: Send email
    }
  }

  /**
   * Send notification when payment is requested
   */
  static async notifyPaymentRequest(operatorId: string, tourId: string, amount: number) {
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) return;

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: operatorId,
      type: "PAYMENT_REQUEST",
      title: "Yêu cầu thanh toán mới",
      message: `Guide yêu cầu thanh toán ${amount.toLocaleString("vi-VN")} VND cho tour "${tour.title}"`,
      link: `/tours/${tourId}/reports`,
    });

    const shouldEmail = await this.shouldSendEmail(operatorId, "PAYMENT_REQUEST");
    if (shouldEmail) {
      // TODO: Send email
    }
  }

  /**
   * Send notification when emergency report is created
   */
  static async notifyEmergency(operatorId: string, tourId: string, severity: string) {
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) return;

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: operatorId,
      type: "EMERGENCY",
      title: `Báo cáo khẩn cấp - ${severity}`,
      message: `Có báo cáo khẩn cấp từ tour "${tour.title}"`,
      link: `/tours/${tourId}/emergencies`,
    });

    const shouldEmail = await this.shouldSendEmail(operatorId, "EMERGENCY");
    if (shouldEmail) {
      // TODO: Send email (always send for emergencies regardless of settings)
    }
  }

  /**
   * Send notification when new message is received
   */
  static async notifyNewMessage(userId: string, conversationId: string, senderName: string) {
    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId,
      type: "NEW_MESSAGE",
      title: "Tin nhắn mới",
      message: `Bạn có tin nhắn mới từ ${senderName}`,
      link: `/messages/${conversationId}`,
    });

    const shouldEmail = await this.shouldSendEmail(userId, "NEW_MESSAGE");
    if (shouldEmail) {
      // TODO: Send email
    }
  }

  /**
   * Send notification when new standby request is created
   */
  static async notifyNewStandbyRequest(guideId: string, standbyRequestId: string) {
    const standbyRequest = await prisma.standbyRequest.findUnique({
      where: { id: standbyRequestId },
      include: {
        operator: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!standbyRequest) return;

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: guideId,
      type: "STANDBY_REQUEST",
      title: "Yêu cầu Standby mới",
      message: `Bạn có yêu cầu standby mới từ ${standbyRequest.operator.profile?.name || standbyRequest.operator.email}: "${standbyRequest.title}"`,
      link: `/standby-requests/${standbyRequestId}`,
    });

    const shouldEmail = await this.shouldSendEmail(guideId, "STANDBY_REQUEST");
    if (shouldEmail) {
      // TODO: Send email
    }
  }

  /**
   * Send notification when standby request is accepted
   */
  static async notifyStandbyRequestAccepted(
    operatorId: string,
    guideId: string,
    standbyRequestId: string
  ) {
    const standbyRequest = await prisma.standbyRequest.findUnique({
      where: { id: standbyRequestId },
      include: {
        operator: true,
      },
    });

    if (!standbyRequest) return;

    const guide = await prisma.user.findUnique({
      where: { id: guideId },
      include: {
        profile: true,
      },
    });

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: operatorId,
      type: "STANDBY_ACCEPTED",
      title: "Standby request được chấp nhận",
      message: `${guide?.profile?.name || guide?.email || "Guide"} đã chấp nhận yêu cầu standby "${standbyRequest.title}"`,
      link: `/standby-requests/${standbyRequestId}`,
    });

    const shouldEmail = await this.shouldSendEmail(operatorId, "STANDBY_ACCEPTED");
    if (shouldEmail) {
      // TODO: Send email
    }
  }

  /**
   * Send notification when standby request is rejected
   */
  static async notifyStandbyRequestRejected(
    operatorId: string,
    guideId: string,
    standbyRequestId: string,
    reason?: string
  ) {
    const standbyRequest = await prisma.standbyRequest.findUnique({
      where: { id: standbyRequestId },
      include: {
        operator: true,
      },
    });

    if (!standbyRequest) return;

    const guide = await prisma.user.findUnique({
      where: { id: guideId },
      include: {
        profile: true,
      },
    });

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: operatorId,
      type: "STANDBY_REJECTED",
      title: "Standby request bị từ chối",
      message: `${guide?.profile?.name || guide?.email || "Guide"} đã từ chối yêu cầu standby "${standbyRequest.title}"${reason ? `. Lý do: ${reason}` : ""}`,
      link: `/standby-requests/${standbyRequestId}`,
    });

    const shouldEmail = await this.shouldSendEmail(operatorId, "STANDBY_REJECTED");
    if (shouldEmail) {
      // TODO: Send email
    }
  }

  /**
   * Send notification when new dispute is created (to admin/moderator)
   */
  static async notifyNewDispute(disputeId: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        tour: true,
      },
    });

    if (!dispute) return;

    // Notify all admins/moderators with DISPUTES permission
    const admins = await prisma.adminUser.findMany({
      where: {
        permissions: {
          has: "DISPUTES",
        },
      },
    });

    const useCase = new SendNotificationUseCase();

    for (const admin of admins) {
      // Find admin user in User table
      const adminUser = await prisma.user.findFirst({
        where: {
          email: admin.email,
          role: { in: ["TOUR_OPERATOR", "TOUR_AGENCY"] }, // Admin users might have this role
        },
      });

      if (adminUser) {
        await useCase.execute({
          userId: adminUser.id,
          type: "DISPUTE_CREATED",
          title: "Dispute mới",
          message: `Có dispute mới từ ${dispute.user.profile?.name || dispute.user.email}: ${dispute.type}${dispute.tour ? ` - Tour: ${dispute.tour.title}` : ""}`,
          link: `/dashboard/admin/disputes/${disputeId}`,
        });
      }
    }
  }

  /**
   * Send notification when dispute is created (to the other party)
   */
  static async notifyDisputeCreated(userId: string, disputeId: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        tour: true,
      },
    });

    if (!dispute) return;

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId,
      type: "DISPUTE_CREATED",
      title: "Dispute mới",
      message: `Có dispute mới liên quan đến bạn${dispute.tour ? ` - Tour: ${dispute.tour.title}` : ""}`,
      link: `/disputes/${disputeId}`,
    });

    const shouldEmail = await this.shouldSendEmail(userId, "DISPUTE_CREATED");
    if (shouldEmail) {
      // TODO: Send email
    }
  }

  /**
   * Send notification when dispute is resolved
   */
  static async notifyDisputeResolved(userId: string, disputeId: string, resolution: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        tour: true,
      },
    });

    if (!dispute) return;

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId,
      type: "DISPUTE_RESOLVED",
      title: "Dispute đã được giải quyết",
      message: `Dispute của bạn đã được giải quyết: ${resolution}${dispute.tour ? ` - Tour: ${dispute.tour.title}` : ""}`,
      link: `/disputes/${disputeId}`,
    });

    const shouldEmail = await this.shouldSendEmail(userId, "DISPUTE_RESOLVED");
    if (shouldEmail) {
      // TODO: Send email
    }
  }

  /**
   * Send notification when new review is created
   */
  static async notifyNewReview(recipientId: string, reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        reviewer: { include: { profile: true } },
        tour: true,
      },
    });
    if (!review) return;

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: recipientId,
      type: "NEW_REVIEW",
      title: "Bạn có đánh giá mới",
      message: `${review.reviewer.profile?.name || review.reviewer.email} đã đánh giá bạn ${review.overallRating} sao${review.tour ? ` cho tour "${review.tour.title}"` : ""}.`,
      link: `/dashboard/reviews/${reviewId}`,
    });

    const shouldEmail = await this.shouldSendEmail(recipientId, "NEW_REVIEW");
    if (shouldEmail) {
      /* TODO: Send email */
    }
  }

  /**
   * Send notification when dispute is appealed
   */
  static async notifyContractAccepted(operatorId: string, contractId: string, guideId: string) {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        tour: true,
        acceptances: {
          where: { guideId },
          include: {
            guide: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });
    if (!contract || contract.acceptances.length === 0) return;

    const guide = contract.acceptances[0].guide;

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: operatorId,
      type: "CONTRACT_ACCEPTED",
      title: "Hợp đồng đã được ký",
      message: `${guide.profile?.name || guide.email} đã ký hợp đồng cho tour "${contract.tour.title}".`,
      link: `/contracts/${contractId}`,
    });

    const shouldEmail = await this.shouldSendEmail(operatorId, "CONTRACT_ACCEPTED");
    if (shouldEmail) {
      /* TODO: Send email */
    }
  }

  static async notifyEmergencyResponse(recipientId: string, emergencyId: string, response: string) {
    const emergency = await prisma.emergencyReport.findUnique({
      where: { id: emergencyId },
      include: {
        tour: true,
      },
    });
    if (!emergency) return;

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: recipientId,
      type: "EMERGENCY_RESPONSE",
      title: "Phản hồi khẩn cấp",
      message: `Đội hỗ trợ đã phản hồi về tình huống khẩn cấp của bạn: ${response}`,
      link: `/emergency/${emergencyId}`,
    });

    const shouldEmail = await this.shouldSendEmail(recipientId, "EMERGENCY_RESPONSE");
    if (shouldEmail) {
      /* TODO: Send email */
    }
  }

  static async notifyNewContract(recipientId: string, contractId: string) {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        tour: true,
      },
    });
    if (!contract) return;

    const useCase = new SendNotificationUseCase();
    await useCase.execute({
      userId: recipientId,
      type: "NEW_CONTRACT",
      title: "Hợp đồng mới cần ký",
      message: `Bạn có hợp đồng mới cần ký cho tour "${contract.tour.title}".`,
      link: `/contracts/${contractId}`,
    });

    const shouldEmail = await this.shouldSendEmail(recipientId, "NEW_CONTRACT");
    if (shouldEmail) {
      /* TODO: Send email */
    }
  }

  static async notifyDisputeAppealed(disputeId: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        appeal: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!dispute || !dispute.appeal) return;

    // Notify admins about appeal
    await this.notifyNewDispute(dispute.appeal.id);
  }
}




