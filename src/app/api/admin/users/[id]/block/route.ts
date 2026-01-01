import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * POST /api/admin/users/[id]/block
 * 
 * Admin endpoint để block/unblock user
 * Chỉ SUPER_ADMIN và MODERATOR mới có quyền
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;

    // Check admin permissions
    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_")
      ? role.replace("ADMIN_", "")
      : role;
    const isModerator = adminRole === "MODERATOR" || adminRole === "SUPER_ADMIN";

    if (!isModerator) {
      return NextResponse.json(
        { error: "Chỉ admin và moderator mới có quyền block/unblock user" },
        { status: 403 }
      );
    }

    // Cannot block yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Bạn không thể block chính mình" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { action, reason, notes } = body;

    if (!action || (action !== "block" && action !== "unblock")) {
      return NextResponse.json(
        { error: "Action phải là 'block' hoặc 'unblock'" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User không tồn tại" }, { status: 404 });
    }

    // Update user
    if (action === "block") {
      if (!reason) {
        return NextResponse.json(
          { error: "Vui lòng chọn lý do block user" },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          isBlocked: true,
          blockedBy: session.user.id,
          blockedAt: new Date(),
          blockReason: reason,
          blockNotes: notes || null,
          unblockedBy: null,
          unblockedAt: null,
        },
      });
    } else {
      // unblock
      await prisma.user.update({
        where: { id: userId },
        data: {
          isBlocked: false,
          unblockedBy: session.user.id,
          unblockedAt: new Date(),
          blockReason: null,
          blockNotes: null,
        },
      });
    }

    // Revalidate relevant pages
    revalidatePath("/dashboard/admin/users", "page");
    revalidatePath(`/dashboard/admin/users/${userId}`, "page");

    return NextResponse.json({
      message: action === "block" ? "User đã được block thành công" : "User đã được unblock thành công",
      user: {
        id: user.id,
        email: user.email,
        isBlocked: action === "block",
      },
    });
  } catch (error: any) {
    console.error("Error blocking/unblocking user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

