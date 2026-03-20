import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { GuideBlacklistService } from "@/domain/governance/GuideBlacklistService";

/**
 * GET /api/operator/blacklist
 * List all blacklisted guides for the current operator
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TOUR_OPERATOR") {
      return NextResponse.json({ error: "Only operators can manage blacklists" }, { status: 403 });
    }

    const blacklist = await GuideBlacklistService.getBlacklist(session.user.id);
    return NextResponse.json({ blacklist });
  } catch (error: any) {
    console.error("Error fetching blacklist:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/operator/blacklist
 * Add a guide to the operator's blacklist
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TOUR_OPERATOR") {
      return NextResponse.json({ error: "Only operators can manage blacklists" }, { status: 403 });
    }

    const body = await req.json();
    const { guideId, reason } = body;

    if (!guideId || !reason) {
      return NextResponse.json(
        { error: "guideId and reason are required" },
        { status: 400 }
      );
    }

    const entry = await GuideBlacklistService.blacklistGuide(
      session.user.id,
      guideId,
      reason
    );

    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    console.error("Error blacklisting guide:", error);
    const status = error.message?.includes("not found") ? 404
      : error.message?.includes("already") ? 409
      : 400;
    return NextResponse.json(
      { error: error.message || "Failed to blacklist guide" },
      { status }
    );
  }
}
