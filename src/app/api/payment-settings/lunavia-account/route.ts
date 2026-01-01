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

    // Get active Lunavia bank account for top-up display
    const account = await prisma.lunaviaBankAccount.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!account) {
      return NextResponse.json({ error: "No active bank account found" }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error: any) {
    console.error("Error fetching Lunavia account:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}






