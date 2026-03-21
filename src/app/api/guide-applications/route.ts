import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** GET /api/guide-applications — List guide's own applications */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";

    const where: any = { guideId: session.user.id };
    if (status) where.status = status;

    const apps = await prisma.application.findMany({
      where,
      include: { tour: { select: { id: true, title: true, city: true, startDate: true, status: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(apps);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
