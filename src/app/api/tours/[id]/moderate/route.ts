import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/domain/services/notification.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;
    const body = await req.json();
    const { action, reason, notes } = body;

    // Check if user is admin or moderator
    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_")
      ? role.replace("ADMIN_", "")
      : role;
    const isModerator = adminRole === "MODERATOR" || adminRole === "SUPER_ADMIN";

    if (!isModerator) {
      return NextResponse.json(
        { error: "Only admin and moderator can perform this action" },
        { status: 403 }
      );
    }

    // Get admin user info
    let adminUserId = session.user.id;
    if (role && role.startsWith("ADMIN_")) {
      const adminUser = await prisma.adminUser.findUnique({
        where: { email: session.user?.email || "" },
      });
      if (adminUser) {
        adminUserId = adminUser.id;
      }
    }

    // Find tour
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        operator: true,
      },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    if (action === "block") {
      // Validate reason
      const validReasons = [
        "MISINFORMATION",
        "INAPPROPRIATE_CONTENT",
        "POLICY_VIOLATION",
        "MISSING_INFO",
        "SPAM",
        "FALSE_CLAIMS",
        "COPYRIGHT_VIOLATION",
        "UNAUTHORIZED_CONTACT",
        "LEGAL_VIOLATION",
        "UNETHICAL_BEHAVIOR",
        "OTHER",
      ];

      if (!reason || !validReasons.includes(reason)) {
        return NextResponse.json(
          { error: "Please select a valid reason for closing tour" },
          { status: 400 }
        );
      }

      // Block tour
      const updatedTour = await prisma.tour.update({
        where: { id: tourId },
        data: {
          isBlocked: true,
          blockedBy: adminUserId,
          blockedAt: new Date(),
          blockReason: reason as any,
          blockNotes: notes || null,
        },
      });

      // Notify operator and guides
      await NotificationService.notifyTourBlocked(
        tourId,
        getReasonText(reason),
        notes
      );

      return NextResponse.json({
        message: "Tour closed successfully",
        tour: updatedTour,
      });
    } else if (action === "unblock") {
      // Unblock tour
      const updatedTour = await prisma.tour.update({
        where: { id: tourId },
        data: {
          isBlocked: false,
          unblockedBy: adminUserId,
          unblockedAt: new Date(),
          // Keep block history but clear current block
          blockNotes: notes ? `${tour.blockNotes || ""}\n\nReopened: ${notes}`.trim() : tour.blockNotes,
        },
      });

      // Notify operator
      await NotificationService.notifyTourUnblocked(tourId);

      return NextResponse.json({
        message: "Tour reopened successfully",
        tour: updatedTour,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Only 'block' or 'unblock' accepted" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error moderating tour:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function getReasonText(reason: string): string {
  const reasonMap: Record<string, string> = {
    MISINFORMATION: "Misinformation",
    INAPPROPRIATE_CONTENT: "Inappropriate content",
    POLICY_VIOLATION: "Policy violation",
    MISSING_INFO: "Missing information",
    SPAM: "Spam/System abuse",
    FALSE_CLAIMS: "False claims",
    COPYRIGHT_VIOLATION: "Copyright violation",
    UNAUTHORIZED_CONTACT: "Unauthorized contact information",
    LEGAL_VIOLATION: "Legal violation",
    UNETHICAL_BEHAVIOR: "Unethical behavior",
    OTHER: "Other reason",
  };
  return reasonMap[reason] || reason;
}

