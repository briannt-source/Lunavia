import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/domain/services/notification.service";

/**
 * Scheduled job to automatically change tour status to IN_PROGRESS or CANCELLED
 * when tour startDate is reached
 * This should be run every minute via cron or similar
 * 
 * Logic:
 * 1. If tour has at least one ACCEPTED application or APPROVED assignment → IN_PROGRESS
 * 2. If tour has no guides and no pending applications → CANCELLED (notify operator)
 * 3. If tour has pending applications but no accepted guides → Notify operator (don't auto-cancel)
 */
export async function autoStartTours() {
  const now = new Date();
  
  // Find tours that should start (status is OPEN or CLOSED, startDate <= now)
  const toursToStart = await prisma.tour.findMany({
    where: {
      status: {
        in: ["OPEN", "CLOSED"],
      },
      startDate: {
        lte: now,
      },
    },
    include: {
      applications: {
        include: {
          guide: {
            include: {
              profile: true,
            },
          },
        },
      },
      assignments: {
        where: {
          status: "APPROVED",
        },
        include: {
          guide: {
            include: {
              profile: true,
            },
          },
        },
      },
      operator: {
        include: {
          profile: true,
        },
      },
    },
  });

  const results = [];

  for (const tour of toursToStart) {
    try {
      // Count accepted guides
      const acceptedApplications = tour.applications.filter(
        (app) => app.status === "ACCEPTED"
      );
      const approvedAssignments = tour.assignments.filter(
        (assign) => assign.status === "APPROVED"
      );
      const hasAcceptedGuides = acceptedApplications.length > 0 || approvedAssignments.length > 0;

      // Count pending applications
      const pendingApplications = tour.applications.filter(
        (app) => app.status === "PENDING"
      );
      const hasPendingApplications = pendingApplications.length > 0;

      // Format date and time for notifications
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

      if (hasAcceptedGuides) {
        // Tour has guides → Start tour
        await prisma.tour.update({
          where: { id: tour.id },
          data: {
            status: "IN_PROGRESS",
          },
        });

        // Send notification to operator and guides (via NotificationService)
        await NotificationService.notifyTourStarted(tour.id);

        results.push({
          tourId: tour.id,
          title: tour.title,
          status: "STARTED",
          guidesCount: acceptedApplications.length + approvedAssignments.length,
        });
      } else if (hasPendingApplications) {
        // Tour has pending applications but no accepted guides
        // Notify operator but don't auto-cancel (give operator a chance to accept)
        const { SendNotificationUseCase } = await import(
          "@/application/use-cases/notification/send-notification.use-case"
        );
        const useCase = new SendNotificationUseCase();

        await useCase.execute({
          userId: tour.operatorId,
          type: "TOUR_START_WARNING",
          title: "Tour departure time reached - No guide accepted yet",
          message: `Tour "${tour.title}" đã đến giờ khởi hành (${startDateTime}) nhưng chưa có guide nào được chấp nhận. Hiện có ${pendingApplications.length} ứng tuyển đang chờ bạn duyệt. Vui lòng kiểm tra và chấp nhận guide ngay hoặc hủy tour nếu không tìm được guide phù hợp.`,
          link: `/tours/${tour.id}/applications`,
        });

        results.push({
          tourId: tour.id,
          title: tour.title,
          status: "WARNING_NO_GUIDES",
          pendingApplicationsCount: pendingApplications.length,
          message: "Notified operator - has pending applications",
        });
      } else {
        // No guides and no pending applications → Cancel tour
        await prisma.tour.update({
          where: { id: tour.id },
          data: {
            status: "CANCELLED",
          },
        });

        // Notify operator
        await NotificationService.notifyTourCancelled(
          tour.id,
          `Tour departure time reached (${startDateTime}) nhưng không có guide nào ứng tuyển hoặc được chấp nhận. Tour đã được tự động hủy. Vui lòng tìm phương án khác hoặc tạo tour mới.`
        );

        results.push({
          tourId: tour.id,
          title: tour.title,
          status: "CANCELLED_NO_GUIDES",
          message: "Tour cancelled - no guides found",
        });
      }
    } catch (error: any) {
      results.push({
        tourId: tour.id,
        title: tour.title,
        status: "ERROR",
        error: error.message,
      });
    }
  }

  return results;
}


