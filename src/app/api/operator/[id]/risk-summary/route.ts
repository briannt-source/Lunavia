import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/** GET /api/operator/:id/risk-summary — Risk summary for an operator */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: operatorId } = await params;
    const { prisma } = await import("@/lib/prisma");
    const [emergencies, disputes] = await Promise.all([
      prisma.emergency.count({ where: { tour: { operatorId }, status: "ACTIVE" } }),
      prisma.dispute.count({ where: { tour: { operatorId }, status: { in: ["PENDING", "IN_REVIEW"] } } }),
    ]);
    return NextResponse.json({ operatorId, emergencies, disputes, riskLevel: emergencies > 0 ? "HIGH" : disputes > 0 ? "MEDIUM" : "LOW" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
