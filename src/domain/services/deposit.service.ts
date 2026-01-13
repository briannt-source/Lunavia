/**
 * Deposit Service - Domain Layer
 * 
 * Pure business logic for deposit (LVC lock) validation.
 * No infrastructure dependencies (no Prisma, no Wallet, no Notification).
 * 
 * IMPORTANT:
 * - Deposit is LVC LOCK, not debit
 * - No revenue is recognized
 * - Wallet balance is checked, not modified
 * - Actual locking happens in application use case
 * 
 * This service only validates conditions - it does NOT:
 * - Create DepositLock entities
 * - Modify wallet balance
 * - Check trust scores (handled by TrustRulesPolicy)
 * - Send notifications
 */

/**
 * DepositConfig type (from Prisma)
 * This is the shape of DepositConfig model - service receives it as parameter
 */
export interface DepositConfig {
  operatorOnboardingLock: number;
  guideOnboardingLock: number;
  perTourLockAmount: number;
}

export interface CheckOnboardingDepositParams {
  userType: "OPERATOR" | "GUIDE";
  onboardingDepositPaid: boolean;
  config: DepositConfig;
}

export interface CheckOnboardingDepositResult {
  required: number;
  hasPaid: boolean;
  canProceed: boolean;
  reason?: string;
}

export interface CalculatePerTourLockParams {
  config: DepositConfig;
  perTourLockAmount?: number;
}

export interface CanCreateTourParams {
  userType: "OPERATOR" | "GUIDE";
  walletBalance: number;
  onboardingDepositPaid: boolean;
  config: DepositConfig;
  perTourLockAmount?: number;
}

export interface CanApplyToTourParams {
  walletBalance: number;
  onboardingDepositPaid: boolean;
  config: DepositConfig;
  perTourLockAmount?: number;
}

export interface ActionCheckResult {
  allowed: boolean;
  reason?: string;
}

export class DepositService {
  /**
   * Check onboarding deposit requirement
   * 
   * Rules:
   * - Operator → operatorOnboardingLock
   * - Guide → guideOnboardingLock
   * - If not paid → block CREATE / APPLY
   * 
   * @param params - Check parameters
   * @returns Onboarding deposit check result
   */
  static checkOnboardingDeposit(
    params: CheckOnboardingDepositParams
  ): CheckOnboardingDepositResult {
    const { userType, onboardingDepositPaid, config } = params;

    const required =
      userType === "OPERATOR"
        ? config.operatorOnboardingLock
        : config.guideOnboardingLock;

    if (!onboardingDepositPaid) {
      return {
        required,
        hasPaid: false,
        canProceed: false,
        reason: `Onboarding deposit of ${required.toLocaleString()} LVC is required`,
      };
    }

    return {
      required,
      hasPaid: true,
      canProceed: true,
    };
  }

  /**
   * Calculate per-tour lock amount
   * 
   * Rules:
   * - If perTourLock disabled (0) → return 0
   * - If enabled → return configured amount
   * - Does not depend on trust
   * 
   * @param params - Calculation parameters
   * @returns Per-tour lock amount (0 if disabled)
   */
  static calculatePerTourLock(
    params: CalculatePerTourLockParams
  ): number {
    const { config, perTourLockAmount } = params;

    // If per-tour lock is explicitly provided, use it
    if (perTourLockAmount !== undefined) {
      return perTourLockAmount > 0 ? perTourLockAmount : 0;
    }

    // Otherwise use config value
    return config.perTourLockAmount > 0 ? config.perTourLockAmount : 0;
  }

  /**
   * Check if user can create tour
   * 
   * Rules:
   * - Not paid onboarding deposit → block
   * - Wallet balance < onboarding + perTourLock → block
   * - Does NOT check trust (trust handled by TrustRulesPolicy)
   * 
   * @param params - Check parameters
   * @returns Action check result
   */
  static canCreateTour(params: CanCreateTourParams): ActionCheckResult {
    const {
      userType,
      walletBalance,
      onboardingDepositPaid,
      config,
      perTourLockAmount,
    } = params;

    // Check onboarding deposit
    const onboardingCheck = this.checkOnboardingDeposit({
      userType,
      onboardingDepositPaid,
      config,
    });

    if (!onboardingCheck.canProceed) {
      return {
        allowed: false,
        reason: onboardingCheck.reason,
      };
    }

    // Calculate required total (onboarding + per-tour)
    const onboardingRequired = onboardingCheck.required;
    const perTourLock = this.calculatePerTourLock({
      config,
      perTourLockAmount,
    });
    const totalRequired = onboardingRequired + perTourLock;

    // Check wallet balance
    if (walletBalance < totalRequired) {
      return {
        allowed: false,
        reason: `Insufficient LVC balance. Required: ${totalRequired.toLocaleString()} LVC (onboarding: ${onboardingRequired.toLocaleString()} + per-tour: ${perTourLock.toLocaleString()}), available: ${walletBalance.toLocaleString()} LVC`,
      };
    }

    return {
      allowed: true,
    };
  }

  /**
   * Check if guide can apply to tour
   * 
   * Rules:
   * - Similar to operator but uses guide lock amounts
   * - Not paid onboarding deposit → block
   * - Wallet balance < onboarding + perTourLock → block
   * - Does NOT check trust (trust handled by TrustRulesPolicy)
   * 
   * @param params - Check parameters
   * @returns Action check result
   */
  static canApplyToTour(params: CanApplyToTourParams): ActionCheckResult {
    const {
      walletBalance,
      onboardingDepositPaid,
      config,
      perTourLockAmount,
    } = params;

    // Check onboarding deposit (guide)
    const onboardingCheck = this.checkOnboardingDeposit({
      userType: "GUIDE",
      onboardingDepositPaid,
      config,
    });

    if (!onboardingCheck.canProceed) {
      return {
        allowed: false,
        reason: onboardingCheck.reason,
      };
    }

    // Calculate required total (onboarding + per-tour)
    const onboardingRequired = onboardingCheck.required;
    const perTourLock = this.calculatePerTourLock({
      config,
      perTourLockAmount,
    });
    const totalRequired = onboardingRequired + perTourLock;

    // Check wallet balance
    if (walletBalance < totalRequired) {
      return {
        allowed: false,
        reason: `Insufficient LVC balance. Required: ${totalRequired.toLocaleString()} LVC (onboarding: ${onboardingRequired.toLocaleString()} + per-tour: ${perTourLock.toLocaleString()}), available: ${walletBalance.toLocaleString()} LVC`,
      };
    }

    return {
      allowed: true,
    };
  }

  /**
   * Calculate total required deposit (onboarding + per-tour)
   * 
   * @param params - Calculation parameters
   * @returns Total required LVC amount
   */
  static calculateTotalRequiredDeposit(
    params: CanCreateTourParams | CanApplyToTourParams
  ): number {
    const userType =
      "userType" in params ? params.userType : "GUIDE";
    const onboardingCheck = this.checkOnboardingDeposit({
      userType,
      onboardingDepositPaid: params.onboardingDepositPaid,
      config: params.config,
    });

    const onboardingRequired = onboardingCheck.required;
    const perTourLock = this.calculatePerTourLock({
      config: params.config,
      perTourLockAmount: params.perTourLockAmount,
    });

    return onboardingRequired + perTourLock;
  }
}

