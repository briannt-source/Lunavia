import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/**
 * POST /api/tours/:id/guests/:guestId/checkin
 * Check in a guest for the tour.
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
      status: "CHECKED_IN",
      checkedInAt: new Date().toISOString(),
      checkedInBy: session.user.id,
    });
  } catch (error: any) {
    console.error("Error checking in guest:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
