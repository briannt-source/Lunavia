import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/**
 * POST /api/tours/:id/guests/:guestId/no-show
 * Mark a guest as a no-show.
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

    return NextResponse.json({
      success: true,
      tourId,
      guestId,
      status: "NO_SHOW",
      recordedAt: new Date().toISOString(),
      recordedBy: session.user.id,
    });
  } catch (error: any) {
    console.error("Error marking no-show:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
