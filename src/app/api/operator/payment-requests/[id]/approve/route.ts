import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WalletService } from "@/domain/services/wallet.service";
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

    if (!["TOUR_OPERATOR", "TOUR_AGENCY"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Only operators can approve payments" },
        { status: 403 }
      );
    }

    const { id: reportId } = await params;

    // Get report
    const report = await prisma.tourReport.findUnique({
      where: { id: reportId },
      include: {
        tour: true,
        guide: {
          include: {
            wallet: true,
          },
        },
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

    if (!report.paymentRequestAmount) {
      return NextResponse.json(
        { error: "No payment amount specified" },
        { status: 400 }
      );
    }

    // Process payment
    await WalletService.transfer(
      session.user.id,
      report.guideId,
      report.paymentRequestAmount,
      report.tourId
    );

    // Update report
    await prisma.tourReport.update({
      where: { id: reportId },
      data: {
        paymentRequestStatus: "APPROVED",
      },
    });

    // Create payment record for notification
    const payment = await prisma.payment.create({
      data: {
        fromUserId: session.user.id,
        toUserId: report.guideId,
        amount: report.paymentRequestAmount,
        type: "TOUR_PAYMENT",
        tourId: report.tourId,
        description: `Thanh toán cho tour "${report.tour.title}"`,
      },
    });

    // Notify guide
    await NotificationService.notifyPaymentSent(report.guideId, payment.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error approving payment:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

