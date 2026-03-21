import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** POST /api/requests/:id/apply — Guide applies to a request */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: tourId } = await params;
    const body = await req.json().catch(() => ({}));

    const existing = await prisma.application.findFirst({
      where: { tourId, guideId: session.user.id },
    });
    if (existing) return NextResponse.json({ error: "Already applied" }, { status: 400 });

    const application = await prisma.application.create({
      data: {
        tourId,
        guideId: session.user.id,
        role: body.role || "MAIN",
        status: "PENDING",
        message: body.message || "",
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
