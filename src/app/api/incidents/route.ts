import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { TourIncidentService } from "@/domain/governance/TourIncidentService";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/incidents
 * List incidents with optional filters: status, id, tourId
 * Uses the dedicated TourIncident governance model (separate from EmergencyReport)
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
      const incident = await prisma.tourIncident.findUnique({
        where: { id },
        include: {
          tour: { select: { id: true, title: true, operatorId: true } },
          reporter: {
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
        { reportedBy: session.user.id },
        { tour: { operatorId: session.user.id } },
      ];
    }

    const incidents = await prisma.tourIncident.findMany({
      where,
      include: {
        tour: { select: { id: true, title: true, operatorId: true } },
        reporter: {
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
 * Report a new incident via TourIncidentService
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tourId, type, description } = body;

    if (!tourId || !type || !description) {
      return NextResponse.json(
        { error: "tourId, type, and description are required" },
        { status: 400 }
      );
    }

    const incident = await TourIncidentService.reportIncident({
      tourId,
      reportedBy: session.user.id,
      type,
      description,
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
    reporter: incident.reporter
      ? {
          id: incident.reporter.id,
          name: incident.reporter.profile?.name || incident.reporter.email,
          email: incident.reporter.email,
          role: incident.reporter.role,
        }
      : null,
  };
}
