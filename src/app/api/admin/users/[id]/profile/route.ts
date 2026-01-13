import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function PUT(
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

    const canAccess = adminRole === "SUPER_ADMIN" || adminRole === "MODERATOR";

    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update or create profile
    if (user.profile) {
      await prisma.profile.update({
        where: { userId: id },
        data: {
          name: body.name || undefined,
          phone: body.phone || undefined,
          address: body.address || undefined,
          bio: body.bio || undefined,
          companyName: body.companyName || undefined,
          companyEmail: body.companyEmail || undefined,
        },
      });
    } else {
      await prisma.profile.create({
        data: {
          userId: id,
          name: body.name || undefined,
          phone: body.phone || undefined,
          address: body.address || undefined,
          bio: body.bio || undefined,
          companyName: body.companyName || undefined,
          companyEmail: body.companyEmail || undefined,
        },
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}












