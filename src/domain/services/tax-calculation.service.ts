import { prisma } from "@/lib/prisma";

export interface TaxCalculationInput {
  subtotal: number;
  isFreelance: boolean;
  hasVerifiedContract?: boolean; // For in-house guides
  taxExempt?: boolean;
}

export interface TaxCalculationResult {
  subtotal: number;
  vatAmount: number;
  withholdingTax: number;
  totalAmount: number;
  taxRecords: {
    taxType: "VAT" | "WITHHOLDING_TAX";
    taxRate: number;
    taxableAmount: number;
    taxAmount: number;
  }[];
}

export class TaxCalculationService {
  private static readonly VAT_RATE = 0.1; // 10%
  private static readonly WITHHOLDING_TAX_FREELANCE = 0.05; // 5%
  private static readonly WITHHOLDING_TAX_IN_HOUSE_UNVERIFIED = 0.1; // 10%
  private static readonly WITHHOLDING_TAX_IN_HOUSE_VERIFIED = 0; // 0%

  /**
   * Calculate taxes for an invoice
   */
  static calculateTaxes(input: TaxCalculationInput): TaxCalculationResult {
    const { subtotal, isFreelance, hasVerifiedContract, taxExempt } = input;

    // Calculate VAT (10% on subtotal, unless exempt)
    const vatAmount = taxExempt ? 0 : subtotal * this.VAT_RATE;

    // Calculate Withholding Tax
    let withholdingTax = 0;
    let withholdingTaxRate = 0;

    if (isFreelance) {
      // Freelance guides: 5% withholding tax
      withholdingTax = subtotal * this.WITHHOLDING_TAX_FREELANCE;
      withholdingTaxRate = this.WITHHOLDING_TAX_FREELANCE;
    } else {
      // In-house guides
      if (hasVerifiedContract) {
        // Verified contract: 0% (already deducted at source)
        withholdingTax = 0;
        withholdingTaxRate = this.WITHHOLDING_TAX_IN_HOUSE_VERIFIED;
      } else {
        // Unverified contract: 10%
        withholdingTax = subtotal * this.WITHHOLDING_TAX_IN_HOUSE_UNVERIFIED;
        withholdingTaxRate = this.WITHHOLDING_TAX_IN_HOUSE_UNVERIFIED;
      }
    }

    // Calculate total
    const totalAmount = subtotal + vatAmount - withholdingTax;

    // Build tax records
    const taxRecords: TaxCalculationResult["taxRecords"] = [];

    if (vatAmount > 0) {
      taxRecords.push({
        taxType: "VAT",
        taxRate: this.VAT_RATE * 100, // Convert to percentage
        taxableAmount: subtotal,
        taxAmount: vatAmount,
      });
    }

    if (withholdingTax > 0) {
      taxRecords.push({
        taxType: "WITHHOLDING_TAX",
        taxRate: withholdingTaxRate * 100, // Convert to percentage
        taxableAmount: subtotal,
        taxAmount: withholdingTax,
      });
    }

    return {
      subtotal,
      vatAmount,
      withholdingTax,
      totalAmount,
      taxRecords,
    };
  }

  /**
   * Get tax period from date (YYYY-MM format)
   */
  static getTaxPeriod(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  /**
   * Get tax year from date
   */
  static getTaxYear(date: Date): number {
    return date.getFullYear();
  }
}

