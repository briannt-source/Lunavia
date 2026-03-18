import { prisma } from '@/lib/prisma';

// Prisma-backed repository for Referrals
export const PrismaReferralRepo = {
  async create(input: {
    referrerId: string;
    referredEmail: string;
    rewardType: string;
    rewardValue: number;
    status: string;
  }) {
    return prisma.referral.create({
      data: {
        referrerId: input.referrerId,
        referredEmail: input.referredEmail,
        rewardType: input.rewardType,

        status: input.status,
      },
    });
  },

  async findByReferrer(referrerId: string) {
    return prisma.referral.findMany({
      where: { referrerId },
      orderBy: { createdAt: 'desc' },
    });
  },
};
