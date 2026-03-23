import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/god-mode — Full platform real-time overview */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      activeTours,
      inProgressTours,
      todayTours,
      openIncidents,
      disputedTours,
      atRiskUsers,
      recentEvents,
      totalWallets,
      totalEscrowHeld,
      pendingWithdrawals,
      pendingTopups,
      totalOperators,
      totalGuides,
      totalTours,
      completedTours,
    ] = await Promise.all([
      // Live
      prisma.tour.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      prisma.tour.findMany({
        where: { status: "IN_PROGRESS" },
        select: { id: true, title: true, province: true, startDate: true },
        take: 20,
        orderBy: { startDate: "desc" },
      }),
      prisma.tour.count({ where: { startDate: { gte: today } } }),

      // Safety
      prisma.emergencyReport.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.dispute.count({ where: { status: { in: ["PENDING", "IN_REVIEW"] } } }).catch(() => 0),

      // At-risk users (low trust score)
      prisma.user.findMany({
        where: {
          trustScore: { lt: 40 },
          role: { in: ["TOUR_OPERATOR", "TOUR_GUIDE"] },
        },
        include: {
          profile: { select: { name: true } },
        },
        take: 10,
        orderBy: { trustScore: "asc" },
      }),

      // Recent timeline events (last 24h)
      prisma.tourTimelineEvent.findMany({
        where: { createdAt: { gte: yesterday } },
        select: { id: true, eventType: true, tourId: true, createdAt: true, tour: { select: { title: true } } },
        take: 30,
        orderBy: { createdAt: "desc" },
      }).catch(() => []),

      // Financial
      prisma.wallet.count(),
      prisma.escrowAccount.aggregate({
        where: { status: "LOCKED" },
        _sum: { amount: true },
      }).then(r => r._sum.amount ?? 0).catch(() => 0),
      prisma.withdrawalRequest.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.topUpRequest.count({ where: { status: "PENDING" } }).catch(() => 0),

      // Platform
      prisma.user.count({ where: { role: "TOUR_OPERATOR" } }),
      prisma.user.count({ where: { role: "TOUR_GUIDE" } }),
      prisma.tour.count(),
      prisma.tour.count({ where: { status: "COMPLETED" } }),
    ]);

    const completionRate = totalTours > 0 ? Math.round((completedTours / totalTours) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        live: {
          activeTours,
          inProgressTours: inProgressTours.map(t => ({
            id: t.id,
            title: t.title,
            province: t.province || "",
            startTime: t.startDate?.toISOString() || "",
          })),
          todayTours,
        },
        safety: { openIncidents, openSOS: 0, disputedTours },
        atRiskUsers: atRiskUsers.map((u: any) => ({
          id: u.id,
          name: u.profile?.name || u.email,
          email: u.email,
          role: u.role,
          trustScore: u.trustScore ?? 50,
          reliabilityScore: u.reliabilityScore ?? 100,
        })),
        recentEvents: (recentEvents as any[]).map((e: any) => ({
          id: e.id,
          type: e.eventType || "",
          tourId: e.tourId,
          tourTitle: e.tour?.title || "",
          createdAt: e.createdAt?.toISOString?.() || "",
        })),
        financial: {
          totalWallets,
          totalEscrowHeld: Number(totalEscrowHeld),
          pendingWithdrawals,
          pendingTopups,
        },
        platform: {
          totalOperators,
          totalGuides,
          totalTours,
          completedTours,
          completionRate,
        },
      },
    });
  } catch (error: any) {
    console.error("[god-mode] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
