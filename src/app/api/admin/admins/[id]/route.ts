import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Permission } from "@prisma/client";
import { checkPermission } from "@/lib/permission-helpers";

/**
 * DELETE /api/admin/admins/[id]
 * Delete an admin user (requires USER_VIEW permission - typically SUPER_ADMIN)
 * Cannot delete yourself.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { hasPermission, adminUser } = await checkPermission(Permission.USER_VIEW);

    if (!hasPermission || !adminUser) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent self-deletion
    if (adminUser.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Find admin to delete
    const targetAdmin = await prisma.adminUser.findUnique({ where: { id } });
    if (!targetAdmin) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    // Prevent deleting the last SUPER_ADMIN
    if (targetAdmin.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.adminUser.count({
        where: { role: "SUPER_ADMIN" },
      });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last Super Admin" },
          { status: 400 }
        );
      }
    }

    await prisma.adminUser.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Admin user deleted" });
  } catch (error: any) {
    console.error("Error deleting admin user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
