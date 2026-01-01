import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { DisputeService } from "@/domain/services/dispute.service";
import { NotificationService } from "@/domain/services/notification.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_")
      ? role.replace("ADMIN_", "")
      : role;

    const canReject =
      adminRole === "MODERATOR" ||
      adminRole === "SUPER_ADMIN" ||
      adminRole === "SUPPORT_STAFF";

    if (!canReject) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { reason } = body;

    // Get admin user ID
    const { prisma } = await import("@/lib/prisma");
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: session.user.email || "" },
    });

    if (!adminUser) {
      return NextResponse.json({ message: "Admin user not found" }, { status: 403 });
    }

    const dispute = await DisputeService.rejectDispute(id, adminUser.id, reason);

    // Notify user
    await NotificationService.notifyDisputeResolved(
      dispute.userId,
      dispute.id,
      "REJECTED"
    );

    return NextResponse.json(dispute);
  } catch (error: any) {
    console.error("Error rejecting dispute:", error);
    return NextResponse.json(
      { message: error.message || "Failed to reject dispute" },
      { status: 400 }
    );
  }
}

