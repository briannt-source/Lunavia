import { prisma } from '@/lib/prisma';
import { getTrustMax } from '@/domain/operator/OperatorGovernance';
// import { IUserTrustRepository } from '@/domain/trust/IUserTrustRepository'; // Not needed if just exporting object, or if interface matches

type PrismaClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export const TRUST_THRESHOLDS = {
    APPLY_GUIDE: 40,
    AUTO_ASSIGN: 60,
    PREMIUM_ACCESS: 80,
    VERIFIED: 20 // Bonus for verification
};

export const PrismaUserTrustRepo = {
    async getTrustState(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { trustScore: true, operatorCategory: true }
        });
        return {
            score: user?.trustScore ?? 0,
            history: [] // Populate if needed
        };
    },

    /**
     * Update trust score. Accepts an optional `existingTx` to participate
     * in an outer transaction (e.g. during signup) instead of opening a new one.
     */
    async updateScore(userId: string, delta: number, reason: string, existingTx?: PrismaClient) {
        const execute = async (tx: PrismaClient) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user) throw new Error('User not found');

            const trustMax = getTrustMax(user.operatorCategory);
            const newScore = Math.max(0, Math.min(trustMax, user.trustScore + delta));
            const actualDelta = newScore - user.trustScore;

            if (actualDelta !== 0) {
                await tx.user.update({
                    where: { id: userId },
                    data: { trustScore: newScore }
                });

                // Create TrustEvent with actual mathematical change
                await tx.trustEvent.create({
                    data: {
                        userId,
                        changeValue: actualDelta,
                        newScore: newScore,
                        type: reason,
                        description: `Score change: ${actualDelta > 0 ? '+' : ''}${actualDelta}`
                    }
                });
            }

            return newScore;
        };

        // Reuse the caller's transaction if provided, otherwise open a new one
        if (existingTx) {
            return await execute(existingTx);
        }
        return await prisma.$transaction(execute);
    },

    async getHistory(userId: string) {
        return await prisma.trustEvent.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    },

    async appendEvent(userId: string, type: string, changeValue: number, relatedId: string | null = null, existingTx?: PrismaClient) {
        return await this.updateScore(userId, changeValue, type, existingTx);
    }
};
