import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/risk — Risk monitoring data matching page expectations */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const items: any[] = [];

    // 1. Ledger drift — wallets with negative balance (anomaly indicator)
    try {
      const negativeWallets = await prisma.wallet.findMany({
        where: { balance: { lt: 0 } },
        select: { id: true, userId: true, balance: true },
        take: 20,
      });
      for (const w of negativeWallets) {
        items.push({
          type: "LEDGER_DRIFT",
          severity: "critical",
          walletId: w.id,
          operatorId: w.userId,
          ledgerBalance: 0,
          columnBalance: Number(w.balance),
          drift: Math.abs(Number(w.balance)),
        });
      }
    } catch {}

    // 2. Users with very low trust scores
    try {
      const lowTrustUsers = await prisma.user.findMany({
        where: {
          role: { in: ["TOUR_OPERATOR", "TOUR_GUIDE"] },
          trustScore: { lt: 30 },
        },
        take: 20,
      });
      for (const u of lowTrustUsers) {
        items.push({
          type: "STALE_RISK",
          severity: "warning",
          userId: u.id,
          riskScore: u.trustScore ?? 0,
          lastUpdated: u.createdAt?.toISOString() || null,
          daysSinceUpdate: Math.floor((Date.now() - (u.createdAt?.getTime() || 0)) / (1000 * 60 * 60 * 24)),
        });
      }
    } catch {}

    const ledgerDriftCount = items.filter(i => i.type === "LEDGER_DRIFT").length;
    const highBoostCount = items.filter(i => i.type === "HIGH_BOOST_FREQUENCY").length;
    const staleRiskCount = items.filter(i => i.type === "STALE_RISK").length;
    const criticalCount = items.filter(i => i.severity === "critical").length;

    return NextResponse.json({
      domain: "RISK",
      items,
      total: items.length,
      pending: criticalCount,
      breakdown: {
        ledgerDrift: ledgerDriftCount,
        highBoostFrequency: highBoostCount,
        staleRisk: staleRiskCount,
      },
    });
  } catch (error: any) {
    console.error("[risk] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
