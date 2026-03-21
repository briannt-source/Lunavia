import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** GET/POST /api/bank-info — Get or update bank info */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const profile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } });
    return NextResponse.json({
      bankName: profile?.bankName || "",
      accountNumber: profile?.accountNumber || "",
      accountHolder: profile?.accountHolder || "",
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
    const updated = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        bankName: body.bankName, accountNumber: body.accountNumber, accountHolder: body.accountHolder,
      },
      create: {
        userId: session.user.id, fullName: "", bankName: body.bankName || "",
        accountNumber: body.accountNumber || "", accountHolder: body.accountHolder || "",
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
