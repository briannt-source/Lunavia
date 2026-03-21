import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/verification/pending — Pending verifications */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const docs = await prisma.verification.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(docs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
