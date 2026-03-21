import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/** POST /api/operator/wallet/withdraw — Request withdrawal */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();

    const { prisma } = await import("@/lib/prisma");
    const request = await prisma.withdrawalRequest.create({
      data: {
        userId: session.user.id,
        amount: parseFloat(body.amount),
        bankName: body.bankName || "",
        accountNumber: body.accountNumber || "",
        accountHolder: body.accountHolder || "",
        status: "PENDING",
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
