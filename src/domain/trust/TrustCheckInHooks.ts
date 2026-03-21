// ══════════════════════════════════════════════════════════════════════
// Trust Check-In Hooks
//
// Integrates safety check-in performance into the trust scoring system.
// Called when a tour completes to adjust guide trust based on check-in rate.
// ══════════════════════════════════════════════════════════════════════

import { prisma } from "@/lib/prisma";
import { SafetyCheckInService } from "@/domain/services/safety-checkin.service";

export class TrustCheckInHooks {
  /**
   * Called when a tour completes — adjusts guide trust based on check-in rate.
   *
   * Check-in rate >= 95%  → +5 trust points
   * Check-in rate >= 80%  → +2 trust points
   * Check-in rate >= 50%  → 0 (neutral)
   * Check-in rate <  50%  → -3 trust points
   */
  static async applyCheckInTrust(tourId: string): Promise<{
    adjustments: Array<{
      guideId: string;
      completionRate: number;
      change: number;
      newScore: number;
    }>;
  }> {
    const summary = await SafetyCheckInService.getTourCheckInSummary(tourId);

    // If no check-ins were scheduled, nothing to do
    if (summary.total === 0) {
      return { adjustments: [] };
    }

    // Get unique guides from check-ins
    const checkIns = await prisma.safetyCheckIn.findMany({
      where: { tourId },
      select: { guideId: true, checkedInAt: true, missed: true },
    });

    // Group by guide
    const guideMap = new Map<string, { completed: number; total: number }>();
    for (const ci of checkIns) {
      const entry = guideMap.get(ci.guideId) || { completed: 0, total: 0 };
      entry.total++;
      if (ci.checkedInAt) entry.completed++;
      guideMap.set(ci.guideId, entry);
    }

    const adjustments: Array<{
      guideId: string;
      completionRate: number;
      change: number;
      newScore: number;
    }> = [];

    for (const [guideId, stats] of guideMap) {
      const completionRate = Math.round((stats.completed / stats.total) * 100);

      let change = 0;
      if (completionRate >= 95) change = 5;
      else if (completionRate >= 80) change = 2;
      else if (completionRate >= 50) change = 0;
      else change = -3;

      if (change === 0) continue;

      try {
        const guide = await prisma.user.findUnique({
          where: { id: guideId },
          select: { trustScore: true },
        });

        if (!guide) continue;

        const newScore = Math.max(0, Math.min(100, guide.trustScore + change));

        await prisma.user.update({
          where: { id: guideId },
          data: { trustScore: newScore },
        });

        await (prisma as any).trustEvent.create({
          data: {
            userId: guideId,
            type: "CHECKIN_PERFORMANCE",
            changeValue: change,
            newScore,
            description: `Check-in completion rate: ${completionRate}% (${stats.completed}/${stats.total})`,
            relatedRequestId: tourId,
          },
        });

        adjustments.push({ guideId, completionRate, change, newScore });
      } catch (err) {
        console.error(`[TrustCheckInHooks] Failed for guide ${guideId}:`, err);
      }
    }

    return { adjustments };
  }

  /**
   * Auto-action based on trust score thresholds.
   * Called after any trust modification.
   *
   * < 40 → warning notification
   * < 20 → auto-suspend (set role to inactive)
   */
  static async evaluateAutoActions(userId: string): Promise<{
    action: "none" | "warning" | "suspended";
    trustScore: number;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, trustScore: true, email: true, role: true },
    });

    if (!user) return { action: "none", trustScore: 0 };

    if (user.trustScore < 20) {
      // Auto-suspend
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      await (prisma as any).trustEvent.create({
        data: {
          userId,
          type: "AUTO_SUSPENSION",
          changeValue: 0,
          newScore: user.trustScore,
          description: `Auto-suspended: trust score ${user.trustScore} below threshold (20)`,
        },
      });

      return { action: "suspended", trustScore: user.trustScore };
    }

    if (user.trustScore < 40) {
      // Warning
      try {
        const { createDomainNotification, NotificationDomain } = await import(
          "@/domain/notification/NotificationService"
        );
        await createDomainNotification({
          userId,
          domain: NotificationDomain.GOVERNANCE,
          targetUrl: "/dashboard/trust",
          type: "TRUST_SCORE_CHANGE",
          title: "Trust Score Warning",
          message: `Your trust score is ${user.trustScore}. Improve your performance to avoid suspension.`,
        });
      } catch {
        // Best-effort
      }

      return { action: "warning", trustScore: user.trustScore };
    }

    return { action: "none", trustScore: user.trustScore };
  }
}
