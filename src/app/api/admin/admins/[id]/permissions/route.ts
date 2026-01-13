import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PermissionService } from "@/application/services/permission.service";
import { AdminRole, Permission } from "@prisma/client";
import { checkPermission } from "@/lib/permission-helpers";

/**
 * PUT /api/admin/admins/[id]/permissions
 * Update admin user permissions (requires USER_VIEW permission - typically SUPER_ADMIN)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check permission instead of role
    const { hasPermission, adminUser } = await checkPermission(Permission.USER_VIEW);

    if (!hasPermission || !adminUser) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { permissions, role: newRole } = body;

    // Validate permissions if provided
    if (permissions) {
      const validPermissions = Object.values(Permission);
      const invalidPermissions = permissions.filter(
        (p: Permission) => !validPermissions.includes(p)
      );
      if (invalidPermissions.length > 0) {
        return NextResponse.json(
          { error: `Invalid permissions: ${invalidPermissions.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Validate role if provided
    if (newRole && !Object.values(AdminRole).includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update admin user
    const updateData: any = {};
    if (permissions !== undefined) {
      updateData.permissions = permissions;
    }
    if (newRole) {
      updateData.role = newRole;
      // If role changed and no custom permissions provided, use default permissions
      if (permissions === undefined) {
        updateData.permissions = PermissionService.getDefaultPermissions(newRole);
      }
    }

    const updatedAdminUser = await prisma.adminUser.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ admin: updatedAdminUser });
  } catch (error: any) {
    console.error("Error updating admin permissions:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

