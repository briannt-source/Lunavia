import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function PUT(
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

    // Verify ownership
    const existing = await prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // If setting as default, unset other defaults
    if (body.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const paymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: {
        type: body.type,
        accountName: body.accountName,
        accountNumber: body.accountNumber,
        bankName: body.bankName || null,
        branchName: body.branchName || null,
        isDefault: body.isDefault ?? false,
      },
    });

    return NextResponse.json(paymentMethod);
  } catch (error: any) {
    console.error("Error updating payment method:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.paymentMethod.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}







