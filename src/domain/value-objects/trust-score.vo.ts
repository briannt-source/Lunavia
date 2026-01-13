/**
 * TrustScore Value Object
 * 
 * Represents a trust score (0-100).
 * Immutable value object - no infrastructure dependencies.
 * 
 * NOTE: Trust status resolution (GOOD/AT_RISK/RESTRICTED) and blocking logic
 * are delegated to application policy (TrustConfig). This value object only
 * holds the numeric score and provides basic operations.
 */

export class TrustScore {
  private readonly value: number;

  private constructor(value: number) {
    if (value < 0 || value > 100) {
      throw new Error("Trust score must be between 0 and 100");
    }
    this.value = Math.round(value);
  }

  /**
   * Create TrustScore from numeric value
   */
  static from(value: number): TrustScore {
    return new TrustScore(value);
  }

  /**
   * Get numeric value
   */
  getValue(): number {
    return this.value;
  }

  /**
   * Apply trust change (delta)
   * Returns new TrustScore instance (immutable)
   */
  applyChange(delta: number): TrustScore {
    const newValue = Math.max(0, Math.min(100, this.value + delta));
    return new TrustScore(newValue);
  }

  /**
   * Check equality
   */
  equals(other: TrustScore): boolean {
    return this.value === other.value;
  }

  /**
   * String representation
   */
  toString(): string {
    return `${this.value}`;
  }
}

