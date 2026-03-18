import { VerificationSubmission } from './VerificationSubmission';

export interface VerificationRepository {
  findByUser(userId: string): VerificationSubmission | null;
  findAll(): VerificationSubmission[];
  create(sub: VerificationSubmission): VerificationSubmission;
  update(userId: string, partial: Partial<VerificationSubmission>): VerificationSubmission | null;
}
