import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(paymentMethods);
  } catch (error: any) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      accountName,
      accountNumber,
      bankName,
      branchName,
      isDefault,
    } = body;

    if (!type || !accountName || !accountNumber) {
      return NextResponse.json(
        { error: "Type, account name, and account number are required" },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: session.user.id,
        type,
        accountName,
        accountNumber,
        bankName: bankName || null,
        branchName: branchName || null,
        isDefault: isDefault ?? false,
      },
    });

    return NextResponse.json(paymentMethod, { status: 201 });
  } catch (error: any) {
    console.error("Error creating payment method:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}






