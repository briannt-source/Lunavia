/**
 * Trust Service - Domain Layer
 * 
 * Pure business logic for trust score calculation and management.
 * No infrastructure dependencies (no Prisma, no config, no notifications).
 * 
 * Trust status resolution (GOOD/AT_RISK/RESTRICTED) and blocking logic
 * are delegated to application policy (TrustRulesPolicy).
 */

import { TrustRecord, TrustRecordReason, TrustRecordSource } from "../entities/trust-record.entity";
import { TrustScore } from "../value-objects/trust-score.vo";
import { DomainError } from "../errors/domain-errors";

export interface ApplyTrustChangeParams {
  currentScore: number;
  delta: number;
  reason: TrustRecordReason;
  source: TrustRecordSource;
  userId: string;
  metadata?: Record<string, any>;
}

export interface ApplyTrustChangeResult {
  newScore: number;
  record: TrustRecord;
}

export class TrustService {
  /**
   * Default base trust score for new users
   */
  private static readonly DEFAULT_BASE_SCORE = 100;

  /**
   * Maximum allowed delta per change (to prevent abuse)
   */
  private static readonly MAX_DELTA = 50;

  /**
   * Calculate trust score from history of records
   * 
   * @param records - Array of TrustRecord entities
   * @param baseScore - Starting score (default: 100)
   * @returns Calculated trust score (0-100)
   */
  static calculateTrustScore(
    records: TrustRecord[],
    baseScore: number = this.DEFAULT_BASE_SCORE
  ): number {
    // Start from base score
    let score = baseScore;

    // Sum all deltas from records
    for (const record of records) {
      score += record.delta;
    }

    // Clamp to valid range
    return this.clampScore(score);
  }

  /**
   * Apply trust change and create new TrustRecord
   * 
   * @param params - Trust change parameters
   * @returns New score and created TrustRecord
   */
  static applyTrustChange(
    params: ApplyTrustChangeParams
  ): ApplyTrustChangeResult {
    const { currentScore, delta, reason, source, userId, metadata } = params;

    // Validate delta
    this.validateTrustDelta(delta);

    // Validate current score
    if (currentScore < 0 || currentScore > 100) {
      throw new DomainError(
        `Current trust score must be between 0 and 100, got ${currentScore}`,
        "INVALID_TRUST_SCORE"
      );
    }

    // Create previous and new TrustScore objects
    const previousScore = TrustScore.from(currentScore);
    const newScore = previousScore.applyChange(delta);

    // Create TrustRecord (ID handled by persistence layer)
    const record = TrustRecord.create(
      userId,
      delta,
      reason,
      source,
      previousScore,
      newScore,
      metadata
    );

    return {
      newScore: newScore.getValue(),
      record,
    };
  }

  /**
   * Validate trust delta
   * 
   * @param delta - Trust change amount
   * @throws DomainError if delta is invalid
   */
  static validateTrustDelta(delta: number): void {
    if (delta === 0) {
      throw new DomainError(
        "Trust delta cannot be zero",
        "INVALID_TRUST_DELTA"
      );
    }

    if (Math.abs(delta) > this.MAX_DELTA) {
      throw new DomainError(
        `Trust delta cannot exceed ${this.MAX_DELTA} in absolute value, got ${delta}`,
        "INVALID_TRUST_DELTA"
      );
    }

    if (!Number.isFinite(delta)) {
      throw new DomainError(
        "Trust delta must be a finite number",
        "INVALID_TRUST_DELTA"
      );
    }
  }

  /**
   * Clamp trust score to valid range (0-100)
   * 
   * @param score - Raw trust score
   * @returns Clamped score (0-100)
   */
  static clampScore(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Get default base score for new users
   */
  static getDefaultBaseScore(): number {
    return this.DEFAULT_BASE_SCORE;
  }

  /**
   * Get maximum allowed delta
   */
  static getMaxDelta(): number {
    return this.MAX_DELTA;
  }
}

