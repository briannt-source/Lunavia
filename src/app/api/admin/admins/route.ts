import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PermissionService } from "@/application/services/permission.service";
import { AdminRole, Permission } from "@prisma/client";
import { checkPermission } from "@/lib/permission-helpers";

/**
 * GET /api/admin/admins
 * List all admin users (requires USER_VIEW permission)
 */
export async function GET(req: NextRequest) {
  try {
    // Check permission instead of role
    const { hasPermission, adminUser } = await checkPermission(Permission.USER_VIEW);

    if (!hasPermission || !adminUser) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const adminUsers = await prisma.adminUser.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Enrich with default permissions for each role
    const enrichedAdmins = adminUsers.map((admin) => ({
      ...admin,
      defaultPermissions: PermissionService.getDefaultPermissions(admin.role),
    }));

    return NextResponse.json({ admins: enrichedAdmins });
  } catch (error: any) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/admins
 * Create new admin user (requires USER_VIEW permission - typically SUPER_ADMIN)
 */
export async function POST(req: NextRequest) {
  try {
    // Check permission instead of role
    const { hasPermission, adminUser } = await checkPermission(Permission.USER_VIEW);

    if (!hasPermission || !adminUser) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, password, role: newRole, permissions } = body;

    if (!email || !password || !newRole) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(AdminRole).includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Hash password
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const newAdminUser = await prisma.adminUser.create({
      data: {
        email,
        password: hashedPassword,
        role: newRole,
        permissions: permissions || PermissionService.getDefaultPermissions(newRole),
      },
    });

    return NextResponse.json({ admin: newAdminUser }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

