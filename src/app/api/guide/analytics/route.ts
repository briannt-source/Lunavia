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

    // Get all applications by this guide
    const applications = await prisma.application.findMany({
      where: { guideId: userId },
      include: {
        tour: {
          include: {
            operator: {
              include: {
                profile: true,
              },
            },
            payments: {
              where: {
                toWalletId: (await prisma.wallet.findUnique({ where: { userId } }))?.id,
                status: "COMPLETED",
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
    });

    // Get assignments
    const assignments = await prisma.assignment.findMany({
      where: { guideId: userId },
      include: {
        tour: true,
      },
    });

    // Calculate analytics
    const totalApplications = applications.length;
    const pendingApplications = applications.filter((a) => a.status === "PENDING").length;
    const acceptedApplications = applications.filter((a) => a.status === "ACCEPTED").length;
    const rejectedApplications = applications.filter((a) => a.status === "REJECTED").length;

    // Get completed tours
    const completedTours = applications.filter(
      (a) => a.tour.status === "COMPLETED" && a.status === "ACCEPTED"
    );

    // Calculate total earned
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    let totalEarned = 0;
    if (wallet) {
      const payments = await prisma.payment.aggregate({
        where: {
          toWalletId: wallet.id,
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
      });
      totalEarned = payments._sum?.amount || 0;
    }

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentApplications = applications.filter(
      (a) => new Date(a.appliedAt) >= sevenDaysAgo
    ).length;

    // Upcoming tours (accepted applications with future start date)
    const now = new Date();
    const upcomingTours = applications
      .filter(
        (a) =>
          a.status === "ACCEPTED" &&
          new Date(a.tour.startDate) > now &&
          a.tour.status !== "CANCELLED"
      )
      .slice(0, 5)
      .map((a) => ({
        id: a.tour.id,
        title: a.tour.title,
        code: a.tour.code,
        startDate: a.tour.startDate,
        city: a.tour.city,
        role: a.role,
      }));

    // Success rate
    const successRate =
      totalApplications > 0
        ? Math.round((acceptedApplications / totalApplications) * 100)
        : 0;

    return NextResponse.json({
      stats: {
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
        completedTours: completedTours.length,
        totalEarned,
        recentApplications,
        successRate,
        totalAssignments: assignments.length,
      },
      upcomingTours,
    });
  } catch (error: any) {
    console.error("Error fetching guide analytics:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

