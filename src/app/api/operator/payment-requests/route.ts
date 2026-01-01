import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    if (role !== "TOUR_OPERATOR" && role !== "TOUR_AGENCY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all tours owned by operator
    const tours = await prisma.tour.findMany({
      where: { operatorId: session.user.id },
      select: { id: true },
    });

    const tourIds = tours.map((t) => t.id);

    // Get query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Build where clause
    const where: any = {
      tourId: { in: tourIds },
      paymentRequestAmount: { not: null },
    };

    if (status) {
      where.paymentRequestStatus = status;
    }

    // Get tour reports with payment requests
    const reports = await prisma.tourReport.findMany({
      where,
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            city: true,
          },
        },
        guide: {
          include: {
            profile: {
              select: {
                id: true,
                name: true,
                photoUrl: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    // Transform to match frontend expectations
    const transformed = reports.map((report) => ({
      id: report.id,
      tourId: report.tourId,
      guideId: report.guideId,
      amount: report.paymentRequestAmount,
      status: report.paymentRequestStatus,
      createdAt: report.submittedAt,
      tour: report.tour,
      guide: report.guide,
      tourReport: {
        paymentDueAt: report.paymentDueAt,
        paymentLockedAmount: report.paymentLockedAmount,
      },
    }));

    return NextResponse.json(transformed);
  } catch (error: any) {
    console.error("Error fetching payment requests:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

