import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** GET /api/guides/invites — List invites received by guide */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const assignments = await prisma.assignment.findMany({
      where: { guideId: session.user.id, status: "PENDING" },
      include: { tour: { select: { id: true, title: true, city: true, startDate: true, operatorId: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(assignments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
