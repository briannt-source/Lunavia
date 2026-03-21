import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/** POST /api/verification/submit — Submit verification documents */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { prisma } = await import("@/lib/prisma");
    const doc = await prisma.verificationDocument.create({
      data: {
        userId: session.user.id,
        type: body.type || "ID_CARD",
        status: "PENDING",
        fileUrl: body.fileUrl || "",
        notes: body.notes || "",
      },
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
