import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_")
      ? role.replace("ADMIN_", "")
      : role;

    // Only SUPER_ADMIN can access this page
    if (adminRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Chỉ SUPER_ADMIN mới có quyền truy cập" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");
    const search = searchParams.get("search");
    const verified = searchParams.get("verified");

    const where: any = {};
    if (roleFilter && roleFilter !== "all") {
      where.role = roleFilter;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { profile: { name: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (verified && verified !== "all") {
      where.verifiedStatus = verified;
    }

    const [users, stats] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          wallet: true,
          verifications: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              tours: true,
              applications: true,
              assignments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.user.groupBy({
        by: ["role"],
        _count: true,
      }),
    ]);

    const roleStats = stats.reduce((acc, stat) => {
      acc[stat.role] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      users,
      stats: roleStats,
    });
  } catch (error: any) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

