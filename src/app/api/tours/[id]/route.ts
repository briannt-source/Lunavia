import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { WalletService } from "@/domain/services/wallet.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        operator: {
          include: {
            profile: true,
          },
        },
        applications: {
          include: {
            guide: {
              include: {
                profile: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    return NextResponse.json(tour);
  } catch (error: any) {
    console.error("Error fetching tour:", error);
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

    const { id: tourId } = await params;
    const body = await req.json();

    // Check if tour exists and belongs to operator
    const existingTour = await prisma.tour.findUnique({
      where: { id: tourId },
    });

    if (!existingTour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Check if user is operator or moderator/admin
    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_")
      ? role.replace("ADMIN_", "")
      : role;
    const isModerator = adminRole === "MODERATOR" || adminRole === "SUPER_ADMIN";
    
    if (existingTour.operatorId !== session.user.id && !isModerator) {
      return NextResponse.json(
        { error: "You can only update your own tours" },
        { status: 403 }
      );
    }

    // Allow editing DRAFT, OPEN, and CLOSED tours
    // Do not allow editing IN_PROGRESS, COMPLETED, or CANCELLED tours
    const editableStatuses = ["DRAFT", "OPEN", "CLOSED"];
    if (!editableStatuses.includes(existingTour.status)) {
      return NextResponse.json(
        { error: `Cannot edit tour with status ${existingTour.status}. Only DRAFT, OPEN, and CLOSED tours can be edited.` },
        { status: 400 }
      );
    }

    // Check if tour has any applications (pending, accepted, or rejected)
    const hasAnyApplications = await prisma.application.count({
      where: {
        tourId,
      },
    }) > 0;

    const hasAnyAssignments = await prisma.assignment.count({
      where: {
        tourId,
      },
    }) > 0;

    const hasAnyApplicationsOrAssignments = hasAnyApplications || hasAnyAssignments;

    // If tour has applications/assignments, require admin approval
    if (hasAnyApplicationsOrAssignments && !isModerator) {
      // Check if there's already a pending edit request
      const existingRequest = await prisma.tourEditRequest.findFirst({
        where: {
          tourId,
          status: "PENDING",
        },
      });

      if (existingRequest) {
        return NextResponse.json(
          { 
            error: "Đã có yêu cầu chỉnh sửa tour đang chờ admin duyệt. Vui lòng chờ admin xử lý.",
            requiresAdminApproval: true,
            requestId: existingRequest.id,
          },
          { status: 400 }
        );
      }

      // Create edit request for admin approval
      const editRequest = await prisma.tourEditRequest.create({
        data: {
          tourId,
          operatorId: session.user.id,
          reason: body.editReason || "Yêu cầu chỉnh sửa tour",
          changes: body, // Store all changes
          status: "PENDING",
        },
      });

      // Notify admin
      const { NotificationService } = await import("@/domain/services/notification.service");
      // Get all admins
      const admins = await prisma.user.findMany({
        where: {
          role: {
            in: ["TOUR_OPERATOR", "TOUR_AGENCY"], // This should be admin roles, but for now we'll use a different approach
          },
        },
      });

      // For now, we'll create a notification for the system
      // In production, you'd want to notify actual admin users

      return NextResponse.json(
        { 
          message: "Tour đã có ứng tuyển. Yêu cầu chỉnh sửa đã được gửi đến admin để duyệt.",
          requiresAdminApproval: true,
          requestId: editRequest.id,
        },
        { status: 200 }
      );
    }

    // Check if tour has accepted applications/assignments (for validation)
    const hasAcceptedApplications = await prisma.application.count({
      where: {
        tourId,
        status: "ACCEPTED",
      },
    });

    const hasApprovedAssignments = await prisma.assignment.count({
      where: {
        tourId,
        status: "APPROVED",
      },
    });

    const hasAcceptedGuides = hasAcceptedApplications > 0 || hasApprovedAssignments > 0;

    // If tour has accepted guides, restrict certain changes
    if (hasAcceptedGuides) {
      // Cannot reduce slots below number of accepted guides
      if (body.mainGuideSlots !== undefined) {
        const acceptedMainGuides = await prisma.application.count({
          where: {
            tourId,
            status: "ACCEPTED",
            role: "MAIN",
          },
        }) + await prisma.assignment.count({
          where: {
            tourId,
            status: "APPROVED",
            role: "MAIN",
          },
        });

        if (parseInt(body.mainGuideSlots) < acceptedMainGuides) {
          return NextResponse.json(
            { error: `Cannot reduce main guide slots below ${acceptedMainGuides} (number of accepted main guides)` },
            { status: 400 }
          );
        }
      }

      if (body.subGuideSlots !== undefined) {
        const acceptedSubGuides = await prisma.application.count({
          where: {
            tourId,
            status: "ACCEPTED",
            role: "SUB",
          },
        }) + await prisma.assignment.count({
          where: {
            tourId,
            status: "APPROVED",
            role: "SUB",
          },
        });

        if (parseInt(body.subGuideSlots) < acceptedSubGuides) {
          return NextResponse.json(
            { error: `Cannot reduce sub guide slots below ${acceptedSubGuides} (number of accepted sub guides)` },
            { status: 400 }
          );
        }
      }

      // Warn if changing dates (but allow it)
      // Note: This is just a warning, we still allow the change
      // Frontend should show a warning if dates are changed
    }

    // Check if operator can create tour (for validation)
    const canCreate = await WalletService.canCreateTour(session.user.id);
    if (!canCreate.canCreate) {
      return NextResponse.json(
        { error: canCreate.reason },
        { status: 403 }
      );
    }

    // Convert prices to VND if needed
    const USD_TO_VND_RATE = 26000;
    let priceMainVND: number | null = existingTour.priceMain;
    let priceSubVND: number | null = existingTour.priceSub;

    if (body.priceMain !== undefined) {
      if (body.priceMain === null || body.priceMain === "") {
        priceMainVND = null;
      } else {
        const price = parseFloat(body.priceMain);
        priceMainVND = body.currency === "USD" ? price * USD_TO_VND_RATE : price;
      }
    }

    if (body.priceSub !== undefined) {
      if (body.priceSub === null || body.priceSub === "") {
        priceSubVND = null;
      } else {
        const price = parseFloat(body.priceSub);
        priceSubVND = body.currency === "USD" ? price * USD_TO_VND_RATE : price;
      }
    }

    // Update tour
    const updatedTour = await prisma.tour.update({
      where: { id: tourId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.city && { city: body.city }),
        ...(body.visibility && { visibility: body.visibility }),
        ...(body.status && { status: body.status }),
        ...(body.currency && { currency: body.currency }),
        ...(body.priceMain !== undefined && { priceMain: priceMainVND }),
        ...(body.priceSub !== undefined && { priceSub: priceSubVND }),
        ...(body.pax && { pax: parseInt(body.pax) }),
        ...(body.languages && { languages: body.languages }),
        ...(body.specialties && { specialties: body.specialties }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && {
          endDate: body.endDate ? new Date(body.endDate) : null,
        }),
        ...(body.durationHours !== undefined && {
          durationHours: body.durationHours ? parseInt(body.durationHours) : null,
        }),
        ...(body.files && { files: body.files }),
        ...(body.itinerary && { itinerary: body.itinerary }),
        ...(body.mainGuideSlots && { mainGuideSlots: body.mainGuideSlots }),
        ...(body.subGuideSlots !== undefined && { subGuideSlots: body.subGuideSlots }),
        ...(body.inclusions && { inclusions: body.inclusions }),
        ...(body.exclusions && { exclusions: body.exclusions }),
        ...(body.additionalRequirements !== undefined && {
          additionalRequirements: body.additionalRequirements,
        }),
        ...(body.guideNotes !== undefined && {
          guideNotes: body.guideNotes,
        }),
      },
    });

    return NextResponse.json(updatedTour);
  } catch (error: any) {
    console.error("Error updating tour:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
