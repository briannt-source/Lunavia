/**
 * Ops Overview API Route (Read-Only)
 * 
 * Provides read-only operational overview for observability.
 * Admin-only endpoint with simple counts.
 * 
 * No business logic, no state mutation.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// Note: Ops overview is an admin action, but not yet in ApiAction enum
// For now, we'll check admin role directly (this can be added to ApiAction later)
async function checkAdminAccess(session: any): Promise<NextResponse | null> {
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any)?.role;
  const adminRole = role?.startsWith("ADMIN_")
    ? role.replace("ADMIN_", "")
    : null;

  if (!adminRole) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  return null; // Allow
}

export async function GET(req: NextRequest) {
  try {
    // Authentication and admin check
    const session = await getServerSession(authOptions);
    const accessCheck = await checkAdminAccess(session);
    if (accessCheck) {
      return accessCheck;
    }

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Execute read-only queries (simple counts only)
    const [toursByState, sosLast24h, disputesByStatus] = await Promise.all([
      // Tours by state
      prisma.tour.groupBy({
        by: ["status"],
        _count: true,
      }),
      // SOS triggered in last 24 hours (count audit logs with TRIGGER_SOS action)
      prisma.auditLog.count({
        where: {
          action: "TRIGGER_SOS",
          createdAt: {
            gte: twentyFourHoursAgo,
          },
        },
      }),
      // Disputes by status
      prisma.dispute.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    // Format tours by state
    const toursByStateMap = toursByState.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Format disputes by status
    const disputesByStatusMap = disputesByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      tours: {
        byState: toursByStateMap,
      },
      sos: {
        triggeredLast24h: sosLast24h,
      },
      disputes: {
        byStatus: disputesByStatusMap,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching ops overview:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

