import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** GET/POST /api/bank-info — Get or update bank info via PaymentMethod model */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const method = await prisma.paymentMethod.findFirst({
      where: { userId: session.user.id, type: "BANK", isDefault: true },
    });
    return NextResponse.json({
      bankName: method?.bankName || "",
      accountNumber: method?.accountNumber || "",
      accountName: method?.accountName || "",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();

    // Find existing default bank method or create new
    const existing = await prisma.paymentMethod.findFirst({
      where: { userId: session.user.id, type: "BANK", isDefault: true },
    });

    if (existing) {
      const updated = await prisma.paymentMethod.update({
        where: { id: existing.id },
        data: {
          bankName: body.bankName || existing.bankName,
          accountNumber: body.accountNumber || existing.accountNumber,
          accountName: body.accountName || existing.accountName,
        },
      });
      return NextResponse.json(updated);
    }

    const created = await prisma.paymentMethod.create({
      data: {
        userId: session.user.id,
        type: "BANK",
        accountName: body.accountName || "",
        accountNumber: body.accountNumber || "",
        bankName: body.bankName || "",
        isDefault: true,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
