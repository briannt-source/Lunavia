
import { IGuideApplicationRepository } from '@/domain/guide-application/IGuideApplicationRepository';
import { GuideApplication } from '@/domain/guide-application/GuideApplication';
import { RoleType } from '@/domain/guide-application/RoleType';
import { ApplicationStatus } from '@/domain/guide-application/ApplicationStatus'; // Fixed import name
import { prisma } from '@/lib/prisma';

export class PrismaGuideApplicationRepository implements IGuideApplicationRepository {

    private toDomain(raw: any): GuideApplication {
        return new GuideApplication({
            id: raw.id,
            guideId: raw.guideId,
            requestId: raw.requestId,
            roleApplied: raw.roleApplied as RoleType,
            status: raw.status as ApplicationStatus, // Ensuring cast is safe or map
            appliedAt: raw.createdAt || new Date(), // Prisma default
        });
    }

    async findById(id: string): Promise<GuideApplication | null> {
        const raw = await prisma.guideApplication.findUnique({ where: { id } });
        if (!raw) return null;
        return this.toDomain(raw);
    }

    async findByGuideAndRequest(guideId: string, requestId: string): Promise<GuideApplication | null> {
        const raw = await prisma.guideApplication.findUnique({
            where: {
                requestId_guideId: { requestId, guideId }
            }
        });
        if (!raw) return null;
        return this.toDomain(raw);
    }

    async findByGuideId(guideId: string): Promise<GuideApplication[]> {
        const rawApps = await prisma.guideApplication.findMany({
            where: { guideId },
            orderBy: { createdAt: 'desc' }
        });
        return rawApps.map(this.toDomain);
    }

    async findByRequestId(requestId: string): Promise<GuideApplication[]> {
        const rawApps = await prisma.guideApplication.findMany({
            where: { requestId },
            orderBy: { createdAt: 'desc' }
        });
        return rawApps.map(this.toDomain);
    }

    async countActiveByGuide(guideId: string, role?: RoleType): Promise<number> {
        const where: any = {
            guideId,
            status: 'APPLIED'
        };
        if (role) {
            where.roleApplied = role;
        }
        return prisma.guideApplication.count({ where });
    }

    async save(app: GuideApplication): Promise<void> {
        await prisma.guideApplication.upsert({
            where: { id: app.id },
            create: {
                id: app.id,
                guideId: app.guideId,
                requestId: app.requestId,
                roleApplied: app.roleApplied,
                status: app.status,
                createdAt: app.appliedAt,
            },
            update: {
                status: app.status,
                roleApplied: app.roleApplied,
            }
        });
    }

    async findConflictingApplications(guideId: string, startTime: Date, endTime: Date, excludeRequestId?: string): Promise<GuideApplication[]> {
        const rawApps = await prisma.guideApplication.findMany({
            where: {
                guideId,
                status: 'APPLIED',
                requestId: excludeRequestId ? { not: excludeRequestId } : undefined,
                request: {
                    AND: [
                        { startTime: { lt: endTime } },
                        { endTime: { gt: startTime } },
                    ]
                }
            },
            include: { request: true } // Need request timing to confirm? Query handles it.
        });
        return rawApps.map(this.toDomain);
    }

    async cancelMany(ids: string[]): Promise<void> {
        if (ids.length === 0) return;
        await prisma.guideApplication.updateMany({
            where: { id: { in: ids } },
            data: { status: 'CANCELLED_BY_SYSTEM' }
        });
    }

    async rejectManyForRequest(requestId: string, sentIdsToExclude: string[]): Promise<void> {
        await prisma.guideApplication.updateMany({
            where: {
                requestId,
                status: 'APPLIED',
                id: { notIn: sentIdsToExclude }
            },
            data: { status: 'REJECTED' }
        });
    }
}
