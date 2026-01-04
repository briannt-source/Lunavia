import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/applications
 * Get applications for the current user (guide)
 * Supports filtering by status and role
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only guides can view their applications
    if (session.user.role !== "TOUR_GUIDE") {
      return NextResponse.json(
        { error: "Only guides can view their applications" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role");

    // Build where clause
    const where: any = { guideId: session.user.id };
    if (status) {
      where.status = status;
    }
    if (role) {
      where.role = role;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        tour: {
          include: {
            operator: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}







