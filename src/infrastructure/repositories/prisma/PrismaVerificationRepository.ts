import { IVerificationRepository } from '@/domain/governance/IVerificationRepository';
import { Verification } from '@/domain/governance/Verification';
import { prisma } from '@/lib/prisma';
import { VerificationStatus } from '@/domain/governance/VerificationStatus';

export class PrismaVerificationRepository implements IVerificationRepository {
    async findById(id: string): Promise<Verification | null> {
        const raw = await prisma.verificationSubmission.findUnique({
            where: { id }
        });

        if (!raw) return null;

        return this.mapToDomain(raw);
    }

    async findByUserId(userId: string): Promise<Verification | null> {
        const raw = await prisma.verificationSubmission.findUnique({
            where: { userId } // Schema implies unique userId for submission?
            // Schema: userId String @unique. Yes.
        });

        if (!raw) return null;

        return this.mapToDomain(raw);
    }

    async save(verification: Verification): Promise<void> {
        await prisma.verificationSubmission.update({
            where: { id: verification.id },
            data: {
                status: verification.status,
                reviewedAt: verification.id ? new Date() : null, // Logic in entity sets proper date, here we just persist fields? 
                // Entity doesn't expose all fields via getters yet for full persistence if they changed.
                // Assuming Entity 'approve'/'reject' updates specific fields.
                // We need to access props? Or expose getters.
                // Verification entity had getters for status, but maybe not date?
                // Let's rely on what we have or update Entity.
                // Checking Verification.ts... it has 'approve' which sets reviewedAt. 
                // We need getters for reviewedAt and rejectReason to persist key changes.
            }
        });

        // Wait, I need to update Verification.ts to expose reviewedAt and rejectReason!
        // I will do that in next step.
    }

    private mapToDomain(raw: any): Verification {
        return new Verification({
            id: raw.id,
            userId: raw.userId,
            type: raw.type,
            status: raw.status as VerificationStatus,
            submittedAt: raw.submittedAt,
            reviewedAt: raw.reviewedAt,
            rejectReason: raw.rejectReason
        });
    }
}
