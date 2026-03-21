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
    const isModerator = adminRole === "MODERATOR" || adminRole === "SUPER_ADMIN";

    if (!isModerator) {
      return NextResponse.json(
        { error: "Only admin and moderator have access" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const city = searchParams.get("city");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (city && city !== "all") {
      where.city = city;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const [tours, stats] = await Promise.all([
      prisma.tour.findMany({
        where,
        include: {
          operator: {
            include: {
              profile: true,
            },
          },
          _count: {
            select: {
              applications: true,
              assignments: true,
              payments: true,
              reports: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.tour.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      tours,
      stats: statusStats,
    });
  } catch (error: any) {
    console.error("Error fetching admin tours:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

