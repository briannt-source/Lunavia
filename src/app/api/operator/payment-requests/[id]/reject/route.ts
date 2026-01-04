import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["TOUR_OPERATOR", "TOUR_AGENCY"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Only operators can reject payments" },
        { status: 403 }
      );
    }

    const { id: reportId } = await params;
    const body = await req.json();

    // Get report
    const report = await prisma.tourReport.findUnique({
      where: { id: reportId },
      include: {
        tour: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Verify operator owns the tour
    if (report.tour.operatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update report
    await prisma.tourReport.update({
      where: { id: reportId },
      data: {
        paymentRequestStatus: "REJECTED",
        operatorNotes: body.reason || "Yêu cầu thanh toán bị từ chối",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error rejecting payment:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}







