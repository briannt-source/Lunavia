import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * DELETE /api/admin/users/[id]/delete
 * 
 * Admin endpoint to delete user directly
 * Only SUPER_ADMIN has permission
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

    const { id: userId } = await params;

    // Check admin permissions - only SUPER_ADMIN can delete users
    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_")
      ? role.replace("ADMIN_", "")
      : role;
    const isSuperAdmin = adminRole === "SUPER_ADMIN";

    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: "Only SUPER_ADMIN can delete users" },
        { status: 403 }
      );
    }

    // Cannot delete yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete yourself" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            tours: true,
            applications: true,
            assignments: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User does not exist" }, { status: 404 });
    }

    // Delete user and all related data
    // Prisma will handle cascade deletes for most relations
    // But we'll be explicit for important ones

    // Delete optional tables first (outside transaction)
    const optionalDeletes = [
      { name: "messages", operation: () => prisma.message.deleteMany({ where: { senderId: userId } }) },
      { name: "conversations", operation: () => prisma.conversation.deleteMany({ where: { OR: [{ operatorId: userId }, { guideId: userId }] } }) },
      { name: "tourEditRequest", operation: () => prisma.tourEditRequest.deleteMany({ where: { operatorId: userId } }) },
      { name: "tourDeleteRequest", operation: () => prisma.tourDeleteRequest.deleteMany({ where: { operatorId: userId } }) },
      { name: "emergencyReport", operation: () => prisma.emergencyReport.deleteMany({ where: { guideId: userId } }) },
    ];

    for (const { name, operation } of optionalDeletes) {
      try {
        await operation();
      } catch (error: any) {
        if (error.code === "P2021" || error.message?.includes("does not exist")) {
          console.warn(`${name} table not found, skipping deletion`);
        } else {
          console.warn(`Error deleting ${name}:`, error.message);
        }
      }
    }

    // Delete in transaction
    await prisma.$transaction(async (tx) => {
      // Delete applications
      await tx.application.deleteMany({
        where: { guideId: userId },
      });

      // Delete assignments
      await tx.assignment.deleteMany({
        where: { guideId: userId },
      });

      // Delete tour reports
      await tx.tourReport.deleteMany({
        where: { guideId: userId },
      });

      // Delete reviews (both given and received)
      await tx.review.deleteMany({
        where: {
          OR: [
            { reviewerId: userId },
            { subjectId: userId },
          ],
        },
      });

      // Delete contract acceptances
      await tx.contractAcceptance.deleteMany({
        where: { guideId: userId },
      });

      // Delete company member if exists
      await tx.companyMember.deleteMany({
        where: { userId: userId },
      });

      // Delete company invitations
      await tx.companyInvitation.deleteMany({
        where: { guideId: userId },
      });

      // Delete join requests
      await tx.joinRequest.deleteMany({
        where: { guideId: userId },
      });

      // Delete company if user is operator (cascade will handle members)
      if (user.role === "TOUR_OPERATOR" || user.role === "TOUR_AGENCY") {
        await tx.company.deleteMany({
          where: { operatorId: userId },
        });
      }

      // Note: Tours, Payments, and other data will be handled by cascade
      // But we'll set tourId = null for payments to keep history
      await tx.payment.updateMany({
        where: {
          OR: [
            { fromWallet: { userId } },
            { toWallet: { userId } },
          ],
        },
        data: { tourId: null },
      });

      // Finally, delete the user (cascade will handle profile, wallet, etc.)
      await tx.user.delete({
        where: { id: userId },
      });
    });

    // Revalidate relevant pages
    revalidatePath("/dashboard/admin/users", "page");
    revalidatePath("/dashboard/admin", "page");

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Error deleting user (admin):", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

