import { NextRequest, NextResponse } from "next/server";
import { autoStartTours } from "@/lib/jobs/auto-start-tours";

/**
 * API endpoint for cron job to auto-start tours
 * Should be called by a cron service (e.g., Vercel Cron, external cron)
 * 
 * Security: Add authentication header check in production
 */
export async function GET(req: NextRequest) {
  try {
    // Optional: Add authentication check
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await autoStartTours();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      toursProcessed: results.length,
      results,
    });
  } catch (error: any) {
    console.error("Error in auto-start-tours cron:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}







