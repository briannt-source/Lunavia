import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/marketplace/operators/:id
 * Public operator profile for marketplace.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ operatorId: string }> }
) {
  try {
    const { operatorId } = await params;

    const operator = await prisma.user.findUnique({
      where: { id: operatorId, role: { in: ["TOUR_OPERATOR", "TOUR_AGENCY"] } },
      include: {
        profile: true,
        operatorTours: {
          where: { status: { in: ["OPEN", "COMPLETED"] }, visibility: "PUBLIC" },
          select: { id: true, title: true, city: true, startDate: true, status: true, pax: true },
          orderBy: { startDate: "desc" },
          take: 10,
        },
        _count: {
          select: {
            operatorTours: true,
          },
        },
      },
    });

    if (!operator) {
      return NextResponse.json({ error: "Operator not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: operator.id,
      name: operator.profile?.name || operator.name || "Operator",
      avatar: operator.profile?.avatarUrl || operator.image,
      about: operator.profile?.about || "",
      city: operator.profile?.city || "",
      trustScore: operator.trustScore,
      totalTours: operator._count?.operatorTours || 0,
      verifiedStatus: operator.verifiedStatus,
      recentTours: operator.operatorTours,
      joinedAt: operator.createdAt,
    });
  } catch (error: any) {
    console.error("Error fetching operator detail:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
