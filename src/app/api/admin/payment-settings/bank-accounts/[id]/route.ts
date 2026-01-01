import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_") ? role.replace("ADMIN_", "") : role;
    if (adminRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only SUPER_ADMIN can update bank accounts" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { bankName, accountName, accountNumber, branchName, qrCodeUrl, notes, isActive } = body;

    const account = await prisma.lunaviaBankAccount.update({
      where: { id },
      data: {
        bankName,
        accountName,
        accountNumber,
        branchName: branchName || null,
        qrCodeUrl: qrCodeUrl || null,
        notes: notes || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(account);
  } catch (error: any) {
    console.error("Error updating bank account:", error);
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

    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_") ? role.replace("ADMIN_", "") : role;
    if (adminRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only SUPER_ADMIN can delete bank accounts" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.lunaviaBankAccount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting bank account:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

