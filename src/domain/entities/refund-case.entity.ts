/**
 * RefundCase Entity
 * 
 * Represents a refund case (LVC return).
 * Domain entity - no infrastructure dependencies.
 */

export enum RefundStatus {
  PENDING = "PENDING", // Created, awaiting processing
  APPROVED = "APPROVED", // Approved by finance
  REJECTED = "REJECTED", // Rejected (invalid dispute)
  PROCESSED = "PROCESSED", // LVC returned
  CANCELLED = "CANCELLED", // Cancelled
}

export enum RefundReason {
  DISPUTE_VALID = "DISPUTE_VALID", // Valid dispute
  TOUR_CANCELLED = "TOUR_CANCELLED", // Tour cancelled
  GUIDE_NO_SHOW = "GUIDE_NO_SHOW", // Guide no-show
  SERVICE_NOT_PROVIDED = "SERVICE_NOT_PROVIDED", // Service not provided
  QUALITY_ISSUE = "QUALITY_ISSUE", // Quality issue
  OTHER = "OTHER", // Other reason
}

export class RefundCase {
  private constructor(
    public readonly id: string,
    public readonly tourId: string,
    public readonly userId: string, // User requesting refund
    public readonly amount: number, // LVC amount to refund
    public readonly reason: RefundReason,
    public readonly status: RefundStatus,
    public readonly description?: string,
    public readonly disputeId?: string, // Related dispute if any
    public readonly processedBy?: string, // Finance user ID
    public readonly processedAt?: Date,
    public readonly rejectionReason?: string,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Create RefundCase
   */
  static create(
    id: string,
    tourId: string,
    userId: string,
    amount: number,
    reason: RefundReason,
    description?: string,
    disputeId?: string
  ): RefundCase {
    return new RefundCase(
      id,
      tourId,
      userId,
      amount,
      reason,
      RefundStatus.PENDING,
      description,
      disputeId,
      undefined,
      undefined,
      undefined,
      undefined,
      new Date(),
      new Date()
    );
  }

  /**
   * Check if refund is pending
   */
  isPending(): boolean {
    return this.status === RefundStatus.PENDING;
  }

  /**
   * Check if refund is approved
   */
  isApproved(): boolean {
    return this.status === RefundStatus.APPROVED;
  }

  /**
   * Check if refund is processed
   */
  isProcessed(): boolean {
    return this.status === RefundStatus.PROCESSED;
  }

  /**
   * Check if refund is rejected
   */
  isRejected(): boolean {
    return this.status === RefundStatus.REJECTED;
  }

  /**
   * Approve refund
   */
  approve(processedBy: string): RefundCase {
    return new RefundCase(
      this.id,
      this.tourId,
      this.userId,
      this.amount,
      this.reason,
      RefundStatus.APPROVED,
      this.description,
      this.disputeId,
      processedBy,
      new Date(),
      this.rejectionReason,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Reject refund
   */
  reject(processedBy: string, rejectionReason: string): RefundCase {
    return new RefundCase(
      this.id,
      this.tourId,
      this.userId,
      this.amount,
      this.reason,
      RefundStatus.REJECTED,
      this.description,
      this.disputeId,
      processedBy,
      new Date(),
      rejectionReason,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Mark refund as processed (LVC returned)
   */
  markProcessed(processedBy: string): RefundCase {
    return new RefundCase(
      this.id,
      this.tourId,
      this.userId,
      this.amount,
      this.reason,
      RefundStatus.PROCESSED,
      this.description,
      this.disputeId,
      processedBy,
      new Date(),
      this.rejectionReason,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }
}

