/**
 * Platform Fee Service
 * 
 * Handles platform fee calculation for payments between operators and guides
 * 
 * Fee Structure:
 * - Freelance guides: 5% platform fee (charged from payment amount)
 * - In-house guides: 1% platform fee (charged from operator only) OR 0% if contract verified
 * 
 * In-house guides require employment contract verification to get 0% fee
 */

import { prisma } from "@/lib/prisma";

export class PlatformFeeService {
  // Platform fee rates
  private static readonly FREELANCE_FEE_RATE = 0.05; // 5%
  private static readonly IN_HOUSE_FEE_RATE = 0.01; // 1%
  private static readonly IN_HOUSE_VERIFIED_FEE_RATE = 0.0; // 0% if contract verified

  /**
   * Calculate platform fee for a payment
   * @param amount - Gross payment amount
   * @param guideId - Guide receiving payment
   * @param operatorId - Operator making payment
   * @returns Object with fee details
   */
  static async calculateFee(
    amount: number,
    guideId: string,
    operatorId: string
  ): Promise<{
    isFreelance: boolean;
    platformFee: number;
    netAmount: number;
    employmentContractUrl?: string | null;
    contractVerified: boolean;
  }> {
    // Check if guide is in-house
    const guide = await prisma.user.findUnique({
      where: { id: guideId },
      include: {
        companyMember: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!guide) {
      throw new Error("Guide not found");
    }

    // Check if guide is in-house and belongs to operator's company
    const isInHouse =
      guide.employmentType === "IN_HOUSE" &&
      guide.companyMember &&
      guide.companyMember.company.operatorId === operatorId;

    if (isInHouse && guide.companyMember) {
      // In-house guide
      const contractVerified = guide.companyMember.contractVerified || false;
      const feeRate = contractVerified
        ? this.IN_HOUSE_VERIFIED_FEE_RATE
        : this.IN_HOUSE_FEE_RATE;

      // For in-house: fee is charged from operator (not deducted from guide's payment)
      // So guide receives full amount, operator pays amount + fee
      const platformFee = amount * feeRate;
      const netAmount = amount; // Guide receives full amount

      return {
        isFreelance: false,
        platformFee,
        netAmount,
        employmentContractUrl: guide.companyMember.employmentContractUrl,
        contractVerified,
      };
    } else {
      // Freelance guide
      const platformFee = amount * this.FREELANCE_FEE_RATE;
      const netAmount = amount - platformFee; // Guide receives amount minus fee

      return {
        isFreelance: true,
        platformFee,
        netAmount,
        contractVerified: false,
      };
    }
  }

  /**
   * Get fee breakdown for display
   */
  static getFeeBreakdown(
    amount: number,
    isFreelance: boolean,
    contractVerified: boolean
  ): {
    grossAmount: number;
    platformFee: number;
    netAmount: number;
    feeRate: number;
    feeDescription: string;
  } {
    let feeRate: number;
    let feeDescription: string;

    if (isFreelance) {
      feeRate = this.FREELANCE_FEE_RATE;
      feeDescription = "Platform fee (5%) - Freelance";
    } else if (contractVerified) {
      feeRate = this.IN_HOUSE_VERIFIED_FEE_RATE;
      feeDescription = "Platform fee (0%) - In-house (contract verified)";
    } else {
      feeRate = this.IN_HOUSE_FEE_RATE;
      feeDescription = "Platform fee (1%) - In-house (contract not verified)";
    }

    const platformFee = amount * feeRate;
    const netAmount = isFreelance ? amount - platformFee : amount;

    return {
      grossAmount: amount,
      platformFee,
      netAmount,
      feeRate,
      feeDescription,
    };
  }
}

