import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";
import { prisma } from "@/lib/prisma";

/** POST /api/admin/tours/:id/resolve-dispute — Resolve a dispute on a tour */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id: tourId } = await params;
    const body = await req.json().catch(() => ({}));
    const disputes = await prisma.dispute.updateMany({
      where: { tourId, status: { in: ["PENDING", "IN_REVIEW"] } },
      data: { status: "RESOLVED", resolution: body.resolution || "", resolvedBy: admin.id, resolvedAt: new Date() },
    });
    return NextResponse.json({ success: true, resolved: disputes.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
