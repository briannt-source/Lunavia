import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    const { id } = await params;

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        adminUser: true,
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    return NextResponse.json(dispute);
  } catch (error: any) {
    console.error("Error fetching dispute:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}












