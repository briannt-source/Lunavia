/**
 * SOSStatus Value Object
 * 
 * Represents SOS request status.
 * Immutable value object - no infrastructure dependencies.
 * 
 * ⚠️ INACTIVE UNTIL GROUP B
 * This value object is defined for Group B (Tour Lifecycle & SOS) implementation.
 * Do NOT use in Prisma schema or use cases until Group B is started.
 */

export enum SOSStatusType {
  PENDING = "PENDING", // Waiting for matching
  MATCHING = "MATCHING", // Finding guides
  ASSIGNED = "ASSIGNED", // Guide assigned
  RESOLVED = "RESOLVED", // Successfully resolved
  FAILED = "FAILED", // No guide found
  EXPIRED = "EXPIRED", // Time window expired
  CANCELLED = "CANCELLED", // Cancelled by operator
}

export class SOSStatus {
  private readonly status: SOSStatusType;
  private readonly timestamp: Date;

  private constructor(status: SOSStatusType, timestamp: Date) {
    this.status = status;
    this.timestamp = timestamp;
  }

  /**
   * Create SOSStatus from type
   */
  static from(status: SOSStatusType, timestamp: Date = new Date()): SOSStatus {
    return new SOSStatus(status, timestamp);
  }

  /**
   * Get status type
   */
  getStatus(): SOSStatusType {
    return this.status;
  }

  /**
   * Get timestamp
   */
  getTimestamp(): Date {
    return new Date(this.timestamp);
  }

  /**
   * Check if SOS is active (can still be resolved)
   */
  isActive(): boolean {
    return (
      this.status === SOSStatusType.PENDING ||
      this.status === SOSStatusType.MATCHING ||
      this.status === SOSStatusType.ASSIGNED
    );
  }

  /**
   * Check if SOS is resolved (success or failure)
   */
  isResolved(): boolean {
    return (
      this.status === SOSStatusType.RESOLVED ||
      this.status === SOSStatusType.FAILED ||
      this.status === SOSStatusType.EXPIRED ||
      this.status === SOSStatusType.CANCELLED
    );
  }

  /**
   * Check if SOS was successful
   */
  isSuccessful(): boolean {
    return this.status === SOSStatusType.RESOLVED;
  }

  /**
   * Check if SOS failed
   */
  isFailed(): boolean {
    return (
      this.status === SOSStatusType.FAILED ||
      this.status === SOSStatusType.EXPIRED
    );
  }

  /**
   * Transition to new status (immutable)
   */
  transitionTo(newStatus: SOSStatusType): SOSStatus {
    return new SOSStatus(newStatus, new Date());
  }

  /**
   * Check equality
   */
  equals(other: SOSStatus): boolean {
    return this.status === other.status;
  }
}

