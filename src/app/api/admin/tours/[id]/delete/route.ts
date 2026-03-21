import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * DELETE /api/admin/tours/[id]/delete
 * 
 * Admin endpoint để xóa tour trực tiếp (không cần approval)
 * Chỉ SUPER_ADMIN và MODERATOR mới có quyền
 */
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

    // Check admin permissions
    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_")
      ? role.replace("ADMIN_", "")
      : role;
    const isModerator = adminRole === "MODERATOR" || adminRole === "SUPER_ADMIN";

    if (!isModerator) {
      return NextResponse.json(
        { error: "Only admin and moderator can delete tours" },
        { status: 403 }
      );
    }

    // Check if tour exists
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        _count: {
          select: {
            applications: true,
            assignments: true,
            payments: true,
            reports: true,
          },
        },
      },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour does not exist" }, { status: 404 });
    }

    // Admin có thể xóa tour bất kỳ, nhưng cần xóa các related data trước
    // Prisma sẽ tự động xóa các records có onDelete: Cascade, nhưng chúng ta sẽ explicit để đảm bảo

    // Delete messages and conversations OUTSIDE transaction first (if tables exist)
    // This prevents transaction abort if tables don't exist
    try {
      // Try to delete messages first (if table exists)
      await prisma.message.deleteMany({
        where: {
          conversation: {
            tourId,
          },
        },
      });
    } catch (error: any) {
      // If messages table doesn't exist, skip (might not be migrated yet)
      if (error.message?.includes("does not exist") || error.code === "P2021") {
        console.warn("Messages table not found, skipping message deletion");
      } else {
        // If it's a different error, log but don't fail
        console.warn("Error deleting messages:", error.message);
      }
    }

    try {
      // Delete conversations (messages will cascade delete)
      await prisma.conversation.deleteMany({
        where: { tourId },
      });
    } catch (error: any) {
      // If conversations table doesn't exist, skip
      if (error.message?.includes("does not exist") || error.code === "P2021") {
        console.warn("Conversations table not found, skipping conversation deletion");
      } else {
        console.warn("Error deleting conversations:", error.message);
      }
    }

    // Delete operations that might not have tables yet (outside transaction)
    // These are optional and won't cause transaction to abort if tables don't exist
    const optionalDeletes = [
      { name: "tourEditRequest", operation: () => prisma.tourEditRequest.deleteMany({ where: { tourId } }) },
      { name: "tourDeleteRequest", operation: () => prisma.tourDeleteRequest.deleteMany({ where: { tourId } }) },
      { name: "emergencyReport", operation: () => prisma.emergencyReport.deleteMany({ where: { tourId } }) },
    ];

    for (const { name, operation } of optionalDeletes) {
      try {
        await operation();
      } catch (error: any) {
        // If table doesn't exist (P2021), skip silently
        if (error.code === "P2021" || error.message?.includes("does not exist")) {
          console.warn(`${name} table not found, skipping deletion`);
        } else {
          // For other errors, log but don't fail
          console.warn(`Error deleting ${name}:`, error.message);
        }
      }
    }

    // Delete related data in transaction (cascade sẽ handle, nhưng explicit để rõ ràng)
    await prisma.$transaction(async (tx) => {
      // Delete applications
      await tx.application.deleteMany({
        where: { tourId },
      });

      // Delete assignments
      await tx.assignment.deleteMany({
        where: { tourId },
      });

      // Delete tour reports
      await tx.tourReport.deleteMany({
        where: { tourId },
      });

      // Delete contract acceptances first (cascade)
      const contract = await tx.contract.findFirst({
        where: { tourId },
      });

      if (contract) {
        await tx.contractAcceptance.deleteMany({
          where: {
            contractId: contract.id,
          },
        });

        // Delete contract
        await tx.contract.delete({
          where: { id: contract.id },
        });
      }

      // Note: Payments và Reviews không có onDelete: Cascade
      // Nên chúng ta sẽ set tourId = null thay vì xóa
      await tx.payment.updateMany({
        where: { tourId },
        data: { tourId: null },
      });

      await tx.review.updateMany({
        where: { tourId },
        data: { tourId: null },
      });

      // Finally, delete the tour
      await tx.tour.delete({
        where: { id: tourId },
      });
    });

    // Revalidate relevant pages (force revalidation)
    revalidatePath("/dashboard/admin/tours", "page");
    revalidatePath("/tours/browse", "page");
    revalidatePath("/tours", "layout");
    revalidatePath(`/tours/${tourId}`, "page");

    return NextResponse.json({
      message: "Tour deleted successfully",
      deletedTour: {
        id: tour.id,
        title: tour.title,
        code: tour.code,
      },
    });
  } catch (error: any) {
    console.error("Error deleting tour (admin):", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

