import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";
import { prisma } from "@/lib/prisma";

/** POST /api/admin/verification/:id/approve — Approve a verification document */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const doc = await prisma.verification.update({
      where: { id }, data: { status: "APPROVED", reviewedBy: admin.id, reviewedAt: new Date() },
    });
    // Also update user verification status
    await prisma.user.update({ where: { id: doc.userId }, data: { verifiedStatus: "APPROVED" } });
    return NextResponse.json(doc);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
