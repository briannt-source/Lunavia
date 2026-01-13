/**
 * TrustRecord Entity
 * 
 * Represents a trust score change record.
 * Domain entity - no infrastructure dependencies.
 */

import { TrustScore } from "../value-objects/trust-score.vo";

export enum TrustRecordSource {
  AUTO = "AUTO", // System-generated (rules)
  ADMIN = "ADMIN", // Admin manual adjustment
}

export enum TrustRecordReason {
  // Guide reasons
  NO_SHOW = "NO_SHOW",
  CANCEL_TOO_CLOSE = "CANCEL_TOO_CLOSE",
  SOS_GUIDE_FAULT = "SOS_GUIDE_FAULT",
  SOS_VALID = "SOS_VALID",
  TOUR_COMPLETED = "TOUR_COMPLETED",
  
  // Operator reasons
  SPAM_CANCEL = "SPAM_CANCEL",
  FAKE_TOUR = "FAKE_TOUR",
  CREDIT_OVERDUE = "CREDIT_OVERDUE",
  EXPIRED_DOCUMENTS = "EXPIRED_DOCUMENTS",
  
  // Admin reasons
  ADMIN_ADJUST = "ADMIN_ADJUST",
  ADMIN_RESET = "ADMIN_RESET",
}

export class TrustRecord {
  private constructor(
    public readonly userId: string,
    public readonly delta: number, // Trust change amount
    public readonly reason: TrustRecordReason,
    public readonly source: TrustRecordSource,
    public readonly previousScore: TrustScore,
    public readonly newScore: TrustScore,
    public readonly metadata?: Record<string, any>, // Additional context (tourId, etc.)
    public readonly createdAt: Date = new Date()
  ) {}

  /**
   * Create TrustRecord
   * Note: ID is handled by persistence layer (Prisma), not domain
   */
  static create(
    userId: string,
    delta: number,
    reason: TrustRecordReason,
    source: TrustRecordSource,
    previousScore: TrustScore,
    newScore: TrustScore,
    metadata?: Record<string, any>
  ): TrustRecord {
    return new TrustRecord(
      userId,
      delta,
      reason,
      source,
      previousScore,
      newScore,
      metadata,
      new Date()
    );
  }

  /**
   * Check if record is positive (trust increase)
   */
  isPositive(): boolean {
    return this.delta > 0;
  }

  /**
   * Check if record is negative (trust decrease)
   */
  isNegative(): boolean {
    return this.delta < 0;
  }

  /**
   * Check if record is from admin
   */
  isFromAdmin(): boolean {
    return this.source === TrustRecordSource.ADMIN;
  }

  /**
   * Check if record is automatic
   */
  isAutomatic(): boolean {
    return this.source === TrustRecordSource.AUTO;
  }
}

