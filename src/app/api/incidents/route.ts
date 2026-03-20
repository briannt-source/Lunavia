import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/incidents
 * List incidents (EmergencyReports) with optional filters: status, id, tourId
 * Used by /dashboard/admin/incidents
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const id = searchParams.get("id");
    const tourId = searchParams.get("tourId");

    // Single incident by ID
    if (id) {
      const incident = await prisma.emergencyReport.findUnique({
        where: { id },
        include: {
          tour: { select: { id: true, title: true, operatorId: true } },
          guide: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: { select: { name: true } },
            },
          },
        },
      });

      if (!incident) {
        return NextResponse.json({ error: "Incident not found" }, { status: 404 });
      }

      return NextResponse.json({
        incidents: [formatIncident(incident)],
      });
    }

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (tourId) where.tourId = tourId;

    // Non-admin users can only see their own incidents
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      where.OR = [
        { guideId: session.user.id },
        { tour: { operatorId: session.user.id } },
      ];
    }

    const incidents = await prisma.emergencyReport.findMany({
      where,
      include: {
        tour: { select: { id: true, title: true, operatorId: true } },
        guide: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      incidents: incidents.map(formatIncident),
    });
  } catch (error: any) {
    console.error("Error fetching incidents:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/incidents
 * Report a new incident during tour execution
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tourId, type, description, severity, location, latitude, longitude } = body;

    if (!tourId || !type || !description) {
      return NextResponse.json(
        { error: "tourId, type, and description are required" },
        { status: 400 }
      );
    }

    const incident = await prisma.emergencyReport.create({
      data: {
        tourId,
        guideId: session.user.id,
        type: type || "INCIDENT",
        description,
        severity: severity || "LOW",
        location,
        latitude,
        longitude,
      },
    });

    return NextResponse.json({ incident }, { status: 201 });
  } catch (error: any) {
    console.error("Error reporting incident:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function formatIncident(incident: any) {
  return {
    ...incident,
    reporter: incident.guide
      ? {
          id: incident.guide.id,
          name: incident.guide.profile?.name || incident.guide.email,
          email: incident.guide.email,
          role: incident.guide.role,
        }
      : null,
  };
}
