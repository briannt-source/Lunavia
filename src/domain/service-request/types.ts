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
  startTime: Date;
  endTime: Date;
  location: string;
  status: ServiceRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceRequestInput {
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  location: string;
}
