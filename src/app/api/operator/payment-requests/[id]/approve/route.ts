import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
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

    // Get report with wallets
    const report = await prisma.tourReport.findUnique({
      where: { id: reportId },
      include: {
        tour: {
          include: {
            operator: {
              include: {
                wallet: true,
              },
            },
          },
        },
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
    // Note: WalletService.transfer already creates the payment, but we need it for notification
    // Get the payment created by WalletService or create a reference
    if (!report.tour.operator.wallet || !report.guide.wallet) {
      return NextResponse.json(
        { error: "Wallets not found" },
        { status: 500 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        fromWalletId: report.tour.operator.wallet.id,
        toWalletId: report.guide.wallet.id,
        amount: report.paymentRequestAmount || 0,
        platformFee: 0,
        netAmount: report.paymentRequestAmount || 0,
        status: "COMPLETED",
        tourId: report.tourId,
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

