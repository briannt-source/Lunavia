import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { DisputeService } from "@/domain/services/dispute.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const dispute = await DisputeService.getDisputeById(id);

    if (!dispute) {
      return NextResponse.json({ message: "Dispute not found" }, { status: 404 });
    }

    // Check access: user must be creator, admin, or related party
    const role = (session.user as any)?.role;
    const isAdmin = role && (role.startsWith("ADMIN_") || role === "SUPER_ADMIN" || role === "MODERATOR");

    if (!isAdmin && dispute.userId !== session.user.id) {
      // Check if user is operator or guide related to this dispute
      let hasAccess = false;

      if (dispute.tourId) {
        const { prisma } = await import("@/lib/prisma");
        const tour = await prisma.tour.findUnique({
          where: { id: dispute.tourId },
          include: {
            applications: {
              where: { guideId: session.user.id },
            },
            assignments: {
              where: { guideId: session.user.id },
            },
          },
        });

        if (tour) {
          hasAccess =
            tour.operatorId === session.user.id ||
            tour.applications.length > 0 ||
            tour.assignments.length > 0;
        }
      }

      if (!hasAccess) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(dispute);
  } catch (error: any) {
    console.error("Error fetching dispute:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch dispute" },
      { status: 500 }
    );
  }
}

