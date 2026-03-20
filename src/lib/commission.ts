/**
 * Commission Gating Logic
 *
 * Determines commission rate based on:
 * - Company membership status
 * - Contract verification status
 * - Whether guide is in-house or marketplace
 *
 * Commission flows to PlatformRevenue ledger (NOT escrow).
 */

import { prisma } from '@/lib/prisma';

export interface CommissionResult {
  /** Commission rate as decimal (0.08 = 8%) */
  rate: number;
  /** Display label */
  label: string;
  /** Whether this is an in-house (0%) rate */
  isInHouse: boolean;
  /** Reason for the rate */
  reason: string;
}

/**
 * Calculate commission rate for a guide assignment on a tour.
 *
 * Decision tree:
 * 1. Is guide a CompanyMember of the tour's company?
 *    - NO → marketplace rate (default 8%)
 *    - YES → check contract verification
 *
 * 2. Is contract verified + not expired?
 *    - NO → marketplace rate + "Upload contract for 0%"
 *    - YES → 0% (in-house)
 */
export async function calculateCommission(
  guideId: string,
  tourId: string,
): Promise<CommissionResult> {
  // Get tour with company info
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: {
      companyId: true,
    },
  });

  if (!tour?.companyId) {
    // No company → pure marketplace
    return MARKETPLACE_DEFAULT;
  }

  // Check if guide is member of tour's company
  const membership = await prisma.companyMember.findUnique({
    where: {
      companyId_userId: {
        companyId: tour.companyId,
        userId: guideId,
      },
    },
    select: {
      status: true,
      contractVerified: true,
      contractEndDate: true,
      createdAt: true,
    },
  });

  if (!membership || membership.status !== 'APPROVED') {
    return MARKETPLACE_DEFAULT;
  }

  // Member exists and is approved — check contract
  if (!membership.contractVerified) {
    return {
      ...MARKETPLACE_DEFAULT,
      reason: 'Contract not verified. Upload employment contract to unlock 0% commission.',
    };
  }

  // Contract verified — check expiry
  if (membership.contractEndDate && membership.contractEndDate < new Date()) {
    return {
      ...MARKETPLACE_DEFAULT,
      reason: 'Employment contract has expired. Upload renewed contract to restore 0% commission.',
    };
  }

  // Contract verified + not expired → 0% in-house rate
  return {
    rate: 0,
    label: '0%',
    isInHouse: true,
    reason: 'In-house guide with verified employment contract.',
  };
}

/** Default marketplace rate (Free plan = 8%) */
const MARKETPLACE_DEFAULT: CommissionResult = {
  rate: 0.08,
  label: '8%',
  isInHouse: false,
  reason: 'Marketplace rate.',
};

/**
 * Record commission revenue in PlatformRevenue ledger.
 */
export async function recordCommissionRevenue(params: {
  tourId: string;
  userId: string;
  amount: number;
  type: 'OPERATOR_COMMISSION' | 'GUIDE_PLATFORM_FEE';
  paymentId?: string;
}) {
  await prisma.platformRevenue.create({
    data: {
      type: params.type,
      amount: params.amount,
      tourId: params.tourId,
      userId: params.userId,
      paymentId: params.paymentId,
      description: params.type === 'OPERATOR_COMMISSION'
        ? `Commission from operator for tour ${params.tourId}`
        : `Platform fee from guide earnings for tour ${params.tourId}`,
    },
  });
}
