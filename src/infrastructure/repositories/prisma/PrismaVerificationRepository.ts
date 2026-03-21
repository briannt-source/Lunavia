import { IVerificationRepository } from '@/domain/governance/IVerificationRepository';
import { Verification } from '@/domain/governance/Verification';
import { prisma } from '@/lib/prisma';
import { VerificationStatus } from '@/domain/governance/VerificationStatus';

export class PrismaVerificationRepository implements IVerificationRepository {
    async findById(id: string): Promise<Verification | null> {
        const raw = await prisma.verification.findUnique({
            where: { id }
        });

        if (!raw) return null;

        return this.mapToDomain(raw);
    }

    async findByUserId(userId: string): Promise<Verification | null> {
        const raw = await prisma.verification.findFirst({
            where: { userId }
        });

        if (!raw) return null;

        return this.mapToDomain(raw);
    }

    async save(verification: Verification): Promise<void> {
        await prisma.verification.update({
            where: { id: verification.id },
            data: {
                status: verification.status,
            }
        });
    }

    async rejectSubmission(id: string, reason: string): Promise<void> {
        await prisma.verification.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectionReason: reason,
            }
        });
    }

    private mapToDomain(raw: any): Verification {
        return new Verification({
            id: raw.id,
            userId: raw.userId,
            type: raw.type || 'KYC',
            status: raw.status as VerificationStatus,
            submittedAt: raw.createdAt,
            reviewedAt: raw.updatedAt,
            rejectReason: raw.rejectionReason
        });
    }
}
