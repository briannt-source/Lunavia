import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/requests/:id — Get a specific tour/request
 * PUT /api/requests/:id — Update a request
 * DELETE /api/requests/:id — Delete/cancel a request
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        operator: { include: { profile: true } },
        applications: {
          include: { guide: { include: { profile: true } } },
        },
        assignments: {
          include: { guide: { include: { profile: true } } },
        },
        _count: { select: { applications: true } },
      },
    });

    if (!tour) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(tour);
  } catch (error: any) {
    console.error("Error fetching request:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const tour = await prisma.tour.findUnique({ where: { id } });
    if (!tour) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (tour.operatorId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const updated = await prisma.tour.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.city && { city: body.city }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.pax && { pax: parseInt(body.pax) }),
        ...(body.status && { status: body.status }),
        ...(body.visibility && { visibility: body.visibility }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating request:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const tour = await prisma.tour.findUnique({ where: { id } });
    if (!tour) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (tour.operatorId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.tour.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true, message: "Request cancelled" });
  } catch (error: any) {
    console.error("Error deleting request:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
