import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/operator/wallet/withdraw/:transactionId/cancel — Cancel a withdrawal request
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId } = await params;

    const request = await prisma.withdrawalRequest.findUnique({
      where: { id: transactionId },
    });

    if (!request) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    if (request.userId !== session.user.id) {
      return NextResponse.json({ error: "You can only cancel your own requests" }, { status: 403 });
    }

    if (request.status !== "PENDING") {
      return NextResponse.json({ error: "Only pending requests can be cancelled" }, { status: 400 });
    }

    const updated = await prisma.withdrawalRequest.update({
      where: { id: transactionId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error cancelling withdrawal request:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
