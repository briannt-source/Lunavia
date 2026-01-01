import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubmitTourReportUseCase } from "@/application/use-cases/tour-report/submit-tour-report.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TOUR_GUIDE") {
      return NextResponse.json(
        { error: "Only tour guides can submit reports" },
        { status: 403 }
      );
    }

    const { id: tourId } = await params;
    const body = await req.json();

    const useCase = new SubmitTourReportUseCase();
    const report = await useCase.execute({
      guideId: session.user.id,
      tourId,
      overallRating: body.overallRating,
      clientSatisfaction: body.clientSatisfaction,
      highlights: body.highlights,
      challenges: body.challenges,
      recommendations: body.recommendations,
      paymentRequestAmount: body.paymentRequestAmount,
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    console.error("Error submitting tour report:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TOUR_GUIDE") {
      return NextResponse.json(
        { error: "Only tour guides can update reports" },
        { status: 403 }
      );
    }

    const { id: tourId } = await params;
    const body = await req.json();

    // Get existing report
    const existingReport = await prisma.tourReport.findUnique({
      where: {
        tourId_guideId: {
          tourId,
          guideId: session.user.id,
        },
      },
    });

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (existingReport.approvedAt) {
      return NextResponse.json(
        { error: "Cannot update approved report" },
        { status: 400 }
      );
    }

    // Update report
    const updatedReport = await prisma.tourReport.update({
      where: {
        tourId_guideId: {
          tourId,
          guideId: session.user.id,
        },
      },
      data: {
        overallRating: body.overallRating,
        clientSatisfaction: body.clientSatisfaction,
        highlights: body.highlights,
        challenges: body.challenges,
        recommendations: body.recommendations,
        paymentRequestAmount: body.paymentRequestAmount,
        paymentRequestStatus: body.paymentRequestAmount ? "PENDING" : undefined,
      },
      include: {
        guide: {
          include: {
            profile: true,
          },
        },
        tour: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(updatedReport);
  } catch (error: any) {
    console.error("Error updating tour report:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;

    // Get tour
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Check permissions
    const isOperator = tour.operatorId === session.user.id;
    const isGuide = session.user.role === "TOUR_GUIDE";

    if (!isOperator && !isGuide) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get reports
    const where: any = { tourId };
    if (isGuide && !isOperator) {
      where.guideId = session.user.id;
    }

    const reports = await prisma.tourReport.findMany({
      where,
      include: {
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
        tour: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    // If guide, return single report or null
    if (isGuide && !isOperator) {
      return NextResponse.json(reports[0] || null);
    }

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error("Error fetching tour reports:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
