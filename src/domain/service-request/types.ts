import { findTourCompat, enrichTourCompat, getAssignedGuideId } from '@/lib/tour-compat';
// ServiceRequest domain types - aligns with Prisma schema
// Status values: OPEN | OFFERED | ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED

export type ServiceRequestStatus =
  | 'OPEN'
  | 'OFFERED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ServiceRequest {
  id: string;
  operatorId: string;
  assignedGuideId: string | null;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  location: string;
  status: ServiceRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceRequestInput {
  title: string;
  description?: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  location: string;
}
