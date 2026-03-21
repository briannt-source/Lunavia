import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";

/** POST /api/admin/verification/review — Submit review for verification */
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    const { prisma } = await import("@/lib/prisma");
    const updated = await prisma.verification.update({
      where: { id: body.documentId },
      data: { status: body.action === "approve" ? "APPROVED" : "REJECTED", reviewedBy: admin.id, reviewedAt: new Date() },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
