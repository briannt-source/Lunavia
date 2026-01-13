/**
 * Tour State Enum
 * 
 * Represents the lifecycle states of a tour.
 * Domain layer enum - no infrastructure dependencies.
 */

export enum TourState {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ASSIGNED = "ASSIGNED",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

