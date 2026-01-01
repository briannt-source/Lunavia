import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return NextResponse.json({
        topUpRequests: [],
        withdrawalRequests: [],
        payments: [],
      });
    }

    // Get top-up requests
    const topUpRequests = await prisma.topUpRequest.findMany({
      where: { userId },
      include: {
        paymentMethod: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Get withdrawal requests
    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      where: { userId },
      include: {
        paymentMethod: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Get payments (both sent and received)
    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          { fromWalletId: wallet.id }, // Payments sent
          { toWalletId: wallet.id },    // Payments received
        ],
      },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
          },
        },
        fromWallet: {
          include: {
            user: {
              select: {
                email: true,
                profile: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        toWallet: {
          include: {
            user: {
              select: {
                email: true,
                profile: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      topUpRequests,
      withdrawalRequests,
      payments,
    });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

