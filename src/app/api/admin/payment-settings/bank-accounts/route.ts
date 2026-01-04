import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    if (role !== "ADMIN_SUPER_ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only SUPER_ADMIN can view bank accounts" },
        { status: 403 }
      );
    }

    const accounts = await prisma.lunaviaBankAccount.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(accounts);
  } catch (error: any) {
    console.error("Error fetching bank accounts:", error);
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

    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_") ? role.replace("ADMIN_", "") : role;
    if (adminRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only SUPER_ADMIN can create bank accounts" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { bankName, accountName, accountNumber, branchName, qrCodeUrl, notes, isActive } = body;

    if (!bankName || !accountName || !accountNumber) {
      return NextResponse.json(
        { error: "Bank name, account name, and account number are required" },
        { status: 400 }
      );
    }

    const account = await prisma.lunaviaBankAccount.create({
      data: {
        bankName,
        accountName,
        accountNumber,
        branchName: branchName || null,
        qrCodeUrl: qrCodeUrl || null,
        notes: notes || null,
        isActive: isActive ?? true,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error: any) {
    console.error("Error creating bank account:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

