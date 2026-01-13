/**
 * Audit Logs API Route (Read-Only)
 * 
 * Provides read-only access to audit logs for observability.
 * Admin-only endpoint with filtering and pagination.
 * 
 * No business logic, no state mutation.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// Note: Audit log viewing is an admin action, but not yet in ApiAction enum
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

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const actorId = searchParams.get("actorId");
    const action = searchParams.get("action");
    const targetType = searchParams.get("targetType");
    const targetId = searchParams.get("targetId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100); // Max 100 per page

    // Build where clause
    const where: any = {};

    if (actorId) {
      where.actorId = actorId;
    }

    if (action) {
      where.action = action;
    }

    if (targetType) {
      where.targetType = targetType;
    }

    if (targetId) {
      where.targetId = targetId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Execute read-only queries
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        actorId: log.actorId,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        beforeState: log.beforeState,
        afterState: log.afterState,
        reason: log.reason,
        createdAt: log.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

