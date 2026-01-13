import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/assignments
 * Get assignments for the current user (guide)
 * Supports filtering by status
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only guides can view their assignments
    if (session.user.role !== "TOUR_GUIDE") {
      return NextResponse.json(
        { error: "Only guides can view their assignments" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Build where clause
    const where: any = { guideId: session.user.id };
    if (status) {
      where.status = status;
    }

    const assignments = await prisma.assignment.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(assignments);
  } catch (error: any) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}












