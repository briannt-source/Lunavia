import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/segments/:segmentId/checkin — Check in for a specific tour segment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ segmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { segmentId } = await params;
    const body = await req.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      segmentId,
      checkedInAt: new Date().toISOString(),
      checkedInBy: session.user.id,
      notes: body.notes || "",
      location: body.location || null,
    });
  } catch (error: any) {
    console.error("Error checking in segment:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
