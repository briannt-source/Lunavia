import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;

    // Check if tour exists and belongs to operator
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Check if user is operator or moderator/admin
    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_")
      ? role.replace("ADMIN_", "")
      : role;
    const isModerator = adminRole === "MODERATOR" || adminRole === "SUPER_ADMIN";

    if (tour.operatorId !== session.user.id && !isModerator) {
      return NextResponse.json(
        { error: "You can only delete your own tours" },
        { status: 403 }
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
      // Check if there's already a pending delete request
      const existingRequest = await prisma.tourDeleteRequest.findFirst({
        where: {
          tourId,
          status: "PENDING",
        },
      });

      if (existingRequest) {
        return NextResponse.json(
          {
            error: "Đã có yêu cầu xóa tour đang chờ admin duyệt. Vui lòng chờ admin xử lý.",
            requiresAdminApproval: true,
            requestId: existingRequest.id,
          },
          { status: 400 }
        );
      }

      const body = await req.json().catch(() => ({}));

      // Create delete request for admin approval
      const deleteRequest = await prisma.tourDeleteRequest.create({
        data: {
          tourId,
          operatorId: session.user.id,
          reason: body.reason || "Yêu cầu xóa tour",
          status: "PENDING",
        },
      });

      // TODO: Notify admin

      return NextResponse.json(
        {
          message: "Tour đã có ứng tuyển. Yêu cầu xóa đã được gửi đến admin để duyệt.",
          requiresAdminApproval: true,
          requestId: deleteRequest.id,
        },
        { status: 200 }
      );
    }

    // If no applications, allow direct deletion
    // Delete related data first (cascade will handle most, but we'll be explicit)
    await prisma.application.deleteMany({
      where: { tourId },
    });

    await prisma.assignment.deleteMany({
      where: { tourId },
    });

    await prisma.conversation.deleteMany({
      where: { tourId },
    });

    await prisma.tourReport.deleteMany({
      where: { tourId },
    });

    await prisma.emergencyReport.deleteMany({
      where: { tourId },
    });

    await prisma.tourEditRequest.deleteMany({
      where: { tourId },
    });

    await prisma.tourDeleteRequest.deleteMany({
      where: { tourId },
    });

    // Delete the tour
    await prisma.tour.delete({
      where: { id: tourId },
    });

    return NextResponse.json({ message: "Tour đã được xóa thành công" });
  } catch (error: any) {
    console.error("Error deleting tour:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

