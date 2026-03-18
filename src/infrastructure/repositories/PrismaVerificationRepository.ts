import { PrismaClient } from '@prisma/client';
import { VerificationSubmission, VerificationStatus } from '@/domain/verification/VerificationSubmission';

export class PrismaVerificationRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async save(submission: VerificationSubmission): Promise<void> {
    const { id, userId, type, status, data, submittedAt, reviewedAt, rejectReason } = submission;

    // Check if exists to upsert or create
    // Since ID is UUID, we can just upsert or create. 
    // Domain model relies on unique userId for one active submission usually, 
    // but the schema says userId is unique per submission (one-to-one for now?). 
    // Schema: userId @unique. So one submission per user.

    await this.prisma.verificationSubmission.upsert({
      where: { userId },
      update: {
        type,
        status,
        documentMeta: JSON.stringify(data),
        submittedAt,
        reviewedAt,
        rejectReason
      },
      create: {
        id,
        userId,
        type,
        status,
        documentMeta: JSON.stringify(data),
        submittedAt,
        reviewedAt,
        rejectReason
      }
    });

    // Also update User status flags if needed by MSC, but normally that's a domain event handler.
    // For now, we strictly persist the submission.
  }

  async findByUserId(userId: string): Promise<VerificationSubmission | null> {
    const record = await this.prisma.verificationSubmission.findUnique({
      where: { userId }
    });

    if (!record) return null;

    return {
      id: record.id,
      userId: record.userId,
      type: record.type,
      status: record.status as VerificationStatus,
      data: record.documentMeta ? JSON.parse(record.documentMeta) : {},
      submittedAt: record.submittedAt,
      reviewedAt: record.reviewedAt,
      rejectReason: record.rejectReason
    };
  }

  async findAllPending(): Promise<VerificationSubmission[]> {
    const records = await this.prisma.verificationSubmission.findMany({
      where: { status: 'PENDING' },
      orderBy: { submittedAt: 'asc' }
    });

    return records.map(record => ({
      id: record.id,
      userId: record.userId,
      type: record.type,
      status: record.status as VerificationStatus,
      data: record.documentMeta ? JSON.parse(record.documentMeta) : {},
      submittedAt: record.submittedAt,
      reviewedAt: record.reviewedAt,
      rejectReason: record.rejectReason
    }));
  }

  async findById(id: string): Promise<VerificationSubmission | null> {
    const record = await this.prisma.verificationSubmission.findUnique({
      where: { id }
    });

    if (!record) return null;

    return {
      id: record.id,
      userId: record.userId,
      type: record.type,
      status: record.status as VerificationStatus,
      data: record.documentMeta ? JSON.parse(record.documentMeta) : {},
      submittedAt: record.submittedAt,
      reviewedAt: record.reviewedAt,
      rejectReason: record.rejectReason
    };
  }

  async updateStatus(id: string, status: VerificationStatus, updates?: { rejectReason?: string, reviewNotes?: string }): Promise<void> {
    await this.prisma.verificationSubmission.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        ...updates
      }
    });
  }

  async rejectSubmission(id: string, reason: string, adminId?: string): Promise<void> {
    const submission = await this.prisma.verificationSubmission.findUnique({ where: { id } });
    if (!submission) throw new Error("Submission not found");

    await this.prisma.$transaction([
      this.prisma.verificationSubmission.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          rejectReason: reason,
        },
      }),
      this.prisma.user.update({
        where: { id: submission.userId },
        data: { verificationStatus: 'REJECTED' },
      }),
    ]);
  }
}
