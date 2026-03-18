export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VerificationSubmission {
  id: string;
  userId: string;
  type: string; // KYC | KYB | SOLE_KYB
  status: VerificationStatus;
  data: any; // JSON containing legalName, documents, etc.
  submittedAt: Date;
  reviewedAt?: Date | null;
  rejectReason?: string | null;
}
