import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { GuideBlacklistService } from "@/domain/governance/GuideBlacklistService";

/**
 * DELETE /api/operator/blacklist/[id]
 * Remove a guide from the operator's blacklist
 * Note: [id] here is the guideId (as used by the frontend)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TOUR_OPERATOR") {
      return NextResponse.json({ error: "Only operators can manage blacklists" }, { status: 403 });
    }

    const { id: guideId } = await params;

    const result = await GuideBlacklistService.unblacklistGuide(
      session.user.id,
      guideId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error removing from blacklist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove from blacklist" },
      { status: error.message?.includes("not blacklisted") ? 404 : 500 }
    );
  }
}
