import { findTourCompat, enrichTourCompat, getAssignedGuideId } from '@/lib/tour-compat';
/**
 * SOSRequest Entity
 * 
 * Represents an SOS (emergency guide replacement) request.
 * Domain entity - no infrastructure dependencies.
 * 
 * ⚠️ INACTIVE UNTIL GROUP B
 * This entity is defined for Group B (Tour Lifecycle & SOS) implementation.
 * Do NOT use in Prisma schema or use cases until Group B is started.
 */

import { SOSStatus, SOSStatusType } from "../value-objects/sos-status.vo";

export enum SOSRequestType {
  GUIDE_CANCEL = "GUIDE_CANCEL", // Guide cancelled
  GUIDE_NO_SHOW = "GUIDE_NO_SHOW", // Guide no-show
  GUIDE_CANNOT_CONTINUE = "GUIDE_CANNOT_CONTINUE", // Guide reports cannot continue
  OPERATOR_NO_GUIDE = "OPERATOR_NO_GUIDE", // Operator cannot find guide
  GUIDE_UNREACHABLE = "GUIDE_UNREACHABLE", // Guide unreachable
}

export class SOSRequest {
  private constructor(
    public readonly id: string,
    public readonly tourId: string,
    public readonly operatorId: string,
    public readonly guideId: string | null, // null if operator-initiated
    public readonly type: SOSRequestType,
    public readonly status: SOSStatus,
    public readonly location: string,
    public readonly startDate: Date,
    public readonly description?: string,
    public readonly assignedGuideId?: string, // Guide assigned to replace
    public readonly matchedGuideIds: string[] = [], // Guides found by matching
    public readonly metadata?: Record<string, any>,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Create SOSRequest
   */
  static create(
    id: string,
    tourId: string,
    operatorId: string,
    guideId: string | null,
    type: SOSRequestType,
    location: string,
    startDate: Date,
    description?: string
  ): SOSRequest {
    return new SOSRequest(
      id,
      tourId,
      operatorId,
      guideId,
      type,
      SOSStatus.from(SOSStatusType.PENDING),
      location,
      startTime,
      description,
      undefined,
      [],
      undefined,
      new Date(),
      new Date()
    );
  }

  /**
   * Check if SOS is still valid (within 30-min window)
   */
  isValidWindow(currentTime: Date = new Date()): boolean {
    const timeUntilStart = this.startDate.getTime() - currentTime.getTime();
    const thirtyMinutes = 30 * 60 * 1000;
    return timeUntilStart >= thirtyMinutes;
  }

  /**
   * Check if SOS is expired
   */
  isExpired(currentTime: Date = new Date()): boolean {
    return !this.isValidWindow(currentTime);
  }

  /**
   * Check if SOS can be activated
   */
  canActivate(currentTime: Date = new Date()): boolean {
    return this.status.isActive() && this.isValidWindow(currentTime);
  }

  /**
   * Transition to matching status
   */
  transitionToMatching(matchedGuideIds: string[]): SOSRequest {
    return new SOSRequest(
      this.id,
      this.tourId,
      this.operatorId,
      this.guideId,
      this.type,
      this.status.transitionTo(SOSStatusType.MATCHING),
      this.location,
      this.startDate,
      this.description,
      this.assignedGuideId,
      matchedGuideIds,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Assign guide to SOS
   */
  assignGuide(guideId: string): SOSRequest {
    return new SOSRequest(
      this.id,
      this.tourId,
      this.operatorId,
      this.guideId,
      this.type,
      this.status.transitionTo(SOSStatusType.ASSIGNED),
      this.location,
      this.startDate,
      this.description,
      guideId,
      this.matchedGuideIds,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Resolve SOS (success)
   */
  resolve(): SOSRequest {
    return new SOSRequest(
      this.id,
      this.tourId,
      this.operatorId,
      this.guideId,
      this.type,
      this.status.transitionTo(SOSStatusType.RESOLVED),
      this.location,
      this.startDate,
      this.description,
      this.assignedGuideId,
      this.matchedGuideIds,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Mark SOS as failed
   */
  markFailed(): SOSRequest {
    return new SOSRequest(
      this.id,
      this.tourId,
      this.operatorId,
      this.guideId,
      this.type,
      this.status.transitionTo(SOSStatusType.FAILED),
      this.location,
      this.startDate,
      this.description,
      this.assignedGuideId,
      this.matchedGuideIds,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }
}

