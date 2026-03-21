import { PrismaClient } from '@prisma/client';
import { VerificationSubmission, VerificationStatus } from '@/domain/verification/VerificationSubmission';

export class PrismaVerificationRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async save(submission: VerificationSubmission): Promise<void> {
    const { id, userId, type, status, data, submittedAt, reviewedAt, rejectReason } = submission;

    // Verification model uses userId (unique per user)
    await (this.prisma as any).verification.upsert({
      where: { userId },
      update: {
        status,
        documents: data ? Object.values(data).filter(Boolean) as string[] : [],
        rejectionReason: rejectReason || null,
      },
      create: {
        id,
        userId,
        status,
        documents: data ? Object.values(data).filter(Boolean) as string[] : [],
        rejectionReason: rejectReason || null,
      }
    });
  }

  async findByUserId(userId: string): Promise<VerificationSubmission | null> {
    const record = await this.prisma.verification.findFirst({
      where: { userId }
    });

    if (!record) return null;

    return {
      id: record.id,
      userId: record.userId,
      type: 'KYC',
      status: record.status as VerificationStatus,
      data: {},
      submittedAt: record.createdAt,
      reviewedAt: record.updatedAt,
      rejectReason: record.rejectionReason
    };
  }

  async findAllPending(): Promise<VerificationSubmission[]> {
    const records = await this.prisma.verification.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' }
    });

    return records.map(record => ({
      id: record.id,
      userId: record.userId,
      type: 'KYC',
      status: record.status as VerificationStatus,
      data: {},
      submittedAt: record.createdAt,
      reviewedAt: record.updatedAt,
      rejectReason: record.rejectionReason
    }));
  }

  async findById(id: string): Promise<VerificationSubmission | null> {
    const record = await this.prisma.verification.findUnique({
      where: { id }
    });

    if (!record) return null;

    return {
      id: record.id,
      userId: record.userId,
      type: 'KYC',
      status: record.status as VerificationStatus,
      data: {},
      submittedAt: record.createdAt,
      reviewedAt: record.updatedAt,
      rejectReason: record.rejectionReason
    };
  }

  async updateStatus(id: string, status: VerificationStatus, updates?: { rejectReason?: string }): Promise<void> {
    await this.prisma.verification.update({
      where: { id },
      data: {
        status,
        ...(updates?.rejectReason && { rejectionReason: updates.rejectReason }),
      }
    });
  }

  async rejectSubmission(id: string, reason: string, adminId?: string): Promise<void> {
    const verification = await this.prisma.verification.findUnique({ where: { id } });
    if (!verification) throw new Error("Verification not found");

    await this.prisma.$transaction([
      this.prisma.verification.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: reason,
        },
      }),
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { verifiedStatus: 'REJECTED' },
      }),
    ]);
  }
}
