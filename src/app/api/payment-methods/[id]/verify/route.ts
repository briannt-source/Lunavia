import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

    const { id } = await params;
    const body = await req.json();
    const { accountOwnerName } = body;

    // Verify ownership
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!paymentMethod) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    if (paymentMethod.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Verify account owner name matches user's name
    const userName = paymentMethod.user.profile?.name || "";
    const isVerified = accountOwnerName?.trim().toLowerCase() === userName.trim().toLowerCase();

    if (!isVerified) {
      return NextResponse.json(
        { error: "Tên chủ tài khoản không khớp với tên trong hồ sơ của bạn. Vui lòng kiểm tra lại." },
        { status: 400 }
      );
    }

    // Update payment method as verified
    const updated = await prisma.paymentMethod.update({
      where: { id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error verifying payment method:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}






