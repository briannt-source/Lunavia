/**
 * POST /api/cron/process-overdue-checkins
 *
 * Scheduler endpoint: finds and marks overdue safety check-ins as missed.
 * Should be called periodically (e.g., every 15-30 minutes) by a cron service.
 *
 * Protected by CRON_SECRET header or admin session.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { SafetyCheckInService } from "@/domain/services/safety-checkin.service";

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

    const body = await req.json().catch(() => ({}));
    const gracePeriodMinutes = body.gracePeriodMinutes || 60;

    const result = await SafetyCheckInService.processOverdueCheckIns(gracePeriodMinutes);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Processed ${result.processed} overdue check-ins (${result.errors} errors)`,
    });
  } catch (error: any) {
    console.error("Error processing overdue check-ins:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
