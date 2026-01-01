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

    const userId = session.user.id;

    // Get all tours by this operator
    const tours = await prisma.tour.findMany({
      where: { operatorId: userId },
      include: {
        applications: {
          include: {
            guide: {
              include: {
                profile: true,
              },
            },
          },
        },
        payments: {
          where: {
            status: "COMPLETED",
          },
        },
        _count: {
          select: {
            applications: true,
            payments: true,
          },
        },
      },
    });

    // Calculate analytics
    const totalTours = tours.length;
    const openTours = tours.filter((t) => t.status === "OPEN").length;
    const inProgressTours = tours.filter((t) => t.status === "IN_PROGRESS").length;
    const completedTours = tours.filter((t) => t.status === "COMPLETED").length;
    
    const totalApplications = tours.reduce((sum, t) => sum + t._count.applications, 0);
    const pendingApplications = tours.reduce(
      (sum, t) => sum + t.applications.filter((a) => a.status === "PENDING").length,
      0
    );
    const acceptedApplications = tours.reduce(
      (sum, t) => sum + t.applications.filter((a) => a.status === "ACCEPTED").length,
      0
    );

    const totalSpent = tours.reduce(
      (sum, t) => sum + t.payments.reduce((pSum, p) => pSum + p.amount, 0),
      0
    );

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTours = tours.filter(
      (t) => new Date(t.createdAt) >= sevenDaysAgo
    ).length;
    
    const recentApplications = tours.reduce(
      (sum, t) =>
        sum +
        t.applications.filter(
          (a) => new Date(a.appliedAt) >= sevenDaysAgo
        ).length,
      0
    );

    // Top performing tours (by applications)
    const topTours = tours
      .sort((a, b) => b._count.applications - a._count.applications)
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        title: t.title,
        code: t.code,
        applicationsCount: t._count.applications,
        status: t.status,
        city: t.city,
      }));

    return NextResponse.json({
      stats: {
        totalTours,
        openTours,
        inProgressTours,
        completedTours,
        totalApplications,
        pendingApplications,
        acceptedApplications,
        totalSpent,
        recentTours,
        recentApplications,
      },
      topTours,
    });
  } catch (error: any) {
    console.error("Error fetching operator analytics:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

