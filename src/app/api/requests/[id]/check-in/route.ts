import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** POST /api/requests/:id/check-in — Guide check-in for a tour */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: tourId } = await params;
    const body = await req.json().catch(() => ({}));

    const checkIn = await prisma.safetyCheckIn.create({
      data: {
        tourId,
        guideId: session.user.id,
        status: "COMPLETED",
        notes: body.notes || "",
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
      },
    });
    return NextResponse.json(checkIn, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
