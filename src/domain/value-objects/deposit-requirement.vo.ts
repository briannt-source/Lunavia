/**
 * DepositRequirement Value Object
 * 
 * Represents deposit requirements (onboarding + per-tour).
 * Immutable value object - no infrastructure dependencies.
 * 
 * IMPORTANT: This represents LVC (Lunavia Credit) lock requirements, NOT:
 * - Debit from wallet (wallet balance is checked but not debited)
 * - Revenue recognition (deposits are held, not recorded as revenue)
 * - Payment processing (deposits are locks, not payments)
 * 
 * Deposits are used to ensure users have sufficient LVC balance to cover
 * potential penalties or service commitments. The actual LVC remains in the
 * user's wallet but is considered "locked" for the purpose of action validation.
 */

export class DepositRequirement {
  private readonly onboardingAmount: number;
  private readonly perTourAmount: number;

  private constructor(onboardingAmount: number, perTourAmount: number) {
    if (onboardingAmount < 0 || perTourAmount < 0) {
      throw new Error("Deposit amounts must be non-negative");
    }
    this.onboardingAmount = onboardingAmount;
    this.perTourAmount = perTourAmount;
  }

  /**
   * Create DepositRequirement from amounts
   */
  static from(
    onboardingAmount: number,
    perTourAmount: number = 0
  ): DepositRequirement {
    return new DepositRequirement(onboardingAmount, perTourAmount);
  }

  /**
   * Get onboarding deposit amount
   */
  getOnboardingAmount(): number {
    return this.onboardingAmount;
  }

  /**
   * Get per-tour deposit amount
   */
  getPerTourAmount(): number {
    return this.perTourAmount;
  }

  /**
   * Get total required deposit (onboarding + per-tour)
   */
  getTotalAmount(): number {
    return this.onboardingAmount + this.perTourAmount;
  }

  /**
   * Check if onboarding deposit is required
   */
  requiresOnboardingDeposit(): boolean {
    return this.onboardingAmount > 0;
  }

  /**
   * Check if per-tour deposit is required
   */
  requiresPerTourDeposit(): boolean {
    return this.perTourAmount > 0;
  }

  /**
   * Check if current balance meets requirement
   */
  isMetBy(balance: number): boolean {
    return balance >= this.getTotalAmount();
  }

  /**
   * Check equality
   */
  equals(other: DepositRequirement): boolean {
    return (
      this.onboardingAmount === other.onboardingAmount &&
      this.perTourAmount === other.perTourAmount
    );
  }
}

