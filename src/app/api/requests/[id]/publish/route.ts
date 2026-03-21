import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** POST /api/requests/:id/publish — Publish a draft request */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const tour = await prisma.tour.findUnique({ where: { id } });
    if (!tour) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (tour.operatorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await prisma.tour.update({ where: { id }, data: { status: "OPEN", visibility: "PUBLIC" } });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
