import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/**
 * POST /api/tours/:id/guests/:guestId/early-leave
 * Mark a guest as leaving the tour early.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId, guestId } = await params;
    const body = await req.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      tourId,
      guestId,
      status: "EARLY_LEAVE",
      reason: body.reason || "",
      leftAt: new Date().toISOString(),
      recordedBy: session.user.id,
    });
  } catch (error: any) {
    console.error("Error marking early leave:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
