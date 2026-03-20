/**
 * Contract Expiry CRON Job
 *
 * Runs daily to:
 * 1. Auto-expire contracts past their end date
 * 2. Send 30-day warning notifications
 * 3. Revert expired contracts to marketplace commission rate
 *
 * Can be triggered via:
 * - node-cron in server startup
 * - Render CRON
 * - Manual call to /api/cron/contract-expiry
 */

import { prisma } from '@/lib/prisma';

export async function runContractExpiryCheck() {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  console.log('[CRON] Running contract expiry check at', now.toISOString());

  // 1. Find and expire contracts past their end date
  const expiredContracts = await prisma.companyMember.findMany({
    where: {
      contractVerified: true,
      contractEndDate: {
        not: null,
        lt: now,
      },
    },
    include: {
      user: { select: { id: true, email: true } },
      company: { select: { id: true, name: true, operatorId: true } },
    },
  });

  if (expiredContracts.length > 0) {
    console.log(`[CRON] Found ${expiredContracts.length} expired contracts`);

    for (const member of expiredContracts) {
      // Revert contract verification
      await prisma.companyMember.update({
        where: { id: member.id },
        data: { contractVerified: false },
      });

      // Notify operator
      await prisma.notification.create({
        data: {
          userId: member.company.operatorId,
          type: 'CONTRACT_EXPIRED',
          title: 'Employment contract expired',
          message: `The employment contract for ${member.user.email} has expired. Commission rate reverted to marketplace rate. Upload a renewed contract to restore 0% commission.`,
          link: '/dashboard/operator/company/guides',
        },
      });

      // Notify guide
      await prisma.notification.create({
        data: {
          userId: member.user.id,
          type: 'CONTRACT_EXPIRED',
          title: 'Your employment contract has expired',
          message: `Your employment contract with ${member.company.name} has expired on Lunavia. Please contact your employer to upload a renewed contract.`,
          link: '/dashboard/guide/contract',
        },
      });

      console.log(`[CRON] Expired contract for user ${member.userId} at company ${member.companyId}`);
    }
  }

  // 2. Send 30-day warning for contracts expiring soon
  const expiringContracts = await prisma.companyMember.findMany({
    where: {
      contractVerified: true,
      contractEndDate: {
        not: null,
        gt: now,
        lt: thirtyDaysFromNow,
      },
    },
    include: {
      user: { select: { id: true, email: true } },
      company: { select: { id: true, name: true, operatorId: true } },
    },
  });

  if (expiringContracts.length > 0) {
    console.log(`[CRON] Found ${expiringContracts.length} contracts expiring within 30 days`);

    for (const member of expiringContracts) {
      const daysLeft = Math.ceil(
        (member.contractEndDate!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );

      // Check if we already sent a warning recently (avoid spam)
      const recentNotification = await prisma.notification.findFirst({
        where: {
          userId: member.company.operatorId,
          type: 'CONTRACT_EXPIRING_SOON',
          message: { contains: member.user.email || member.userId },
          createdAt: { gt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        },
      });

      if (!recentNotification) {
        await prisma.notification.create({
          data: {
            userId: member.company.operatorId,
            type: 'CONTRACT_EXPIRING_SOON',
            title: `Contract expiring in ${daysLeft} days`,
            message: `The employment contract for ${member.user.email} expires in ${daysLeft} days. Upload a renewed contract to maintain 0% commission.`,
            link: '/dashboard/operator/company/guides',
          },
        });
      }
    }
  }

  console.log('[CRON] Contract expiry check completed');

  return {
    expired: expiredContracts.length,
    expiring: expiringContracts.length,
  };
}
