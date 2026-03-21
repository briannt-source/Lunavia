import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/** GET /api/guide/sos-broadcasts/:id — Get single SOS broadcast detail */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const { prisma } = await import("@/lib/prisma");
    const emergency = await prisma.emergencyReport.findUnique({
      where: { id },
      include: { tour: { select: { id: true, title: true, city: true, operatorId: true } } },
    });
    if (!emergency) return NextResponse.json({ error: "SOS broadcast not found" }, { status: 404 });
    return NextResponse.json(emergency);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
