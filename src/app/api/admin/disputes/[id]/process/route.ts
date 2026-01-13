import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_")
      ? role.replace("ADMIN_", "")
      : role;

    const canAccess =
      adminRole === "MODERATOR" ||
      adminRole === "SUPER_ADMIN" ||
      adminRole === "SUPPORT_STAFF";

    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: session.user.email || "" },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, resolution, amountRefunded } = body;

    const dispute = await prisma.dispute.findUnique({
      where: { id },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    if (dispute.status !== "PENDING" && dispute.status !== "IN_REVIEW") {
      return NextResponse.json(
        { error: "Dispute is not in a processable state" },
        { status: 400 }
      );
    }

    let updateData: any = {
      assignedTo: adminUser.id,
      resolvedAt: new Date(),
    };

    if (action === "resolve") {
      updateData.status = "RESOLVED";
      updateData.resolution = resolution;
      if (amountRefunded) {
        updateData.amountRefunded = parseFloat(amountRefunded);
      }
    } else if (action === "reject") {
      updateData.status = "REJECTED";
      updateData.resolution = resolution;
    } else if (action === "assign") {
      updateData.status = "IN_REVIEW";
      updateData.assignedTo = adminUser.id;
    }

    const updated = await prisma.dispute.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error processing dispute:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}












