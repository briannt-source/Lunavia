/**
 * POST /api/cron/trust-decay
 *
 * Scheduler endpoint: applies trust score decay to inactive operators.
 * Should be called weekly by a cron service.
 *
 * Protected by CRON_SECRET header or admin session.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { runTrustDecay } from "@/domain/trust/TrustDecayScheduler";

export async function POST(req: NextRequest) {
  try {
    // Auth: either CRON_SECRET or admin session
    const cronSecret = req.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (cronSecret && expectedSecret && cronSecret === expectedSecret) {
      // Authorized via cron secret
    } else {
      const session = await getServerSession(authOptions);
      if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const result = await runTrustDecay();

    return NextResponse.json({
      success: true,
      data: {
        totalEvaluated: result.totalEvaluated,
        totalDecayed: result.totalDecayed,
        skippedAlreadyDecayed: result.skippedAlreadyDecayed,
        errors: result.errors,
      },
      message: `Decay completed: ${result.totalDecayed}/${result.totalEvaluated} users decayed`,
    });
  } catch (error: any) {
    console.error("Error running trust decay:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
