import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { WalletService } from "@/domain/services/wallet.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_")
      ? role.replace("ADMIN_", "")
      : role;

    if (adminRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only SUPER_ADMIN can create internal transfers" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { fromUserId, toUserId, amount, reason } = body;

    if (!fromUserId || !toUserId || !amount || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify users exist and have correct roles
    const [fromUser, toUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: fromUserId },
        include: {
          wallet: true,
          profile: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: toUserId },
        include: {
          wallet: true,
          profile: true,
        },
      }),
    ]);

    if (!fromUser || !fromUser.wallet) {
      return NextResponse.json(
        { error: "From user or wallet not found" },
        { status: 404 }
      );
    }

    if (!toUser || !toUser.wallet) {
      return NextResponse.json(
        { error: "To user or wallet not found" },
        { status: 404 }
      );
    }

    // Verify roles: from must be operator/agency, to must be guide
    if (
      fromUser.role !== "TOUR_OPERATOR" &&
      fromUser.role !== "TOUR_AGENCY"
    ) {
      return NextResponse.json(
        { error: "From user must be an operator or agency" },
        { status: 400 }
      );
    }

    if (toUser.role !== "TOUR_GUIDE") {
      return NextResponse.json(
        { error: "To user must be a guide" },
        { status: 400 }
      );
    }

    // Check available balance
    // NOTE: Wallet model doesn't have 'reserved' field in current schema
    const availableBalance = fromUser.wallet.balance;

    if (amount > availableBalance) {
      return NextResponse.json(
        {
          error: `Insufficient available balance. Current: ${availableBalance.toLocaleString("vi-VN")} VND`,
        },
        { status: 400 }
      );
    }

    // Perform transfer
    const payment = await WalletService.transfer(
      fromUserId,
      toUserId,
      amount
    );

    // Create admin transaction records with reason
    // NOTE: Using WalletTransaction model
    await prisma.walletTransaction.create({
      data: {
        walletId: fromUser.wallet.id,
        type: "DEBIT",
        reason: "MANUAL",
        amount: -amount,
      },
    });

    await prisma.walletTransaction.create({
      data: {
        walletId: toUser.wallet.id,
        type: "CREDIT",
        reason: "MANUAL",
        amount,
      },
    });

    return NextResponse.json({
      success: true,
      payment,
      message: "Transfer completed successfully",
    });
  } catch (error: any) {
    console.error("Error creating transfer:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

