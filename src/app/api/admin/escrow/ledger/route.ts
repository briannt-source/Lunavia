import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/escrow/ledger
 * Returns escrow ledger entries using EscrowAccount model.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type") || "all"; // escrow | revenue | all

    const skip = (page - 1) * limit;

    const where: any = {};
    if (type === "escrow") where.status = { in: ["PENDING", "LOCKED"] };
    if (type === "revenue") where.status = "RELEASED";

    const [items, total] = await Promise.all([
      prisma.escrowAccount.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          tour: { select: { id: true, title: true, code: true } },
          operator: { select: { id: true, email: true, profile: { select: { name: true } } } },
        },
      }).catch(() => []),
      prisma.escrowAccount.count({ where }).catch(() => 0),
    ]);

    return NextResponse.json({
      items: (items as any[]).map((item: any) => ({
        id: item.id,
        tourId: item.tourId,
        tourTitle: item.tour?.title || "Unknown",
        tourCode: item.tour?.code || "",
        operatorName: item.operator?.profile?.name || item.operator?.email || "Unknown",
        amount: Number(item.amount),
        netAmount: Number(item.netAmount || 0),
        platformFee: Number(item.platformFee || 0),
        type: item.status === "RELEASED" ? "REVENUE" : "ESCROW",
        status: item.status,
        createdAt: item.createdAt?.toISOString?.() || "",
        updatedAt: item.updatedAt?.toISOString?.() || "",
      })),
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });
  } catch (error: any) {
    console.error("[escrow/ledger] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
