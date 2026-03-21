import { ITourRepository } from '../../../domain/tour/ITourRepository';
import { Tour } from '../../../domain/tour/Tour';
import { TourStatus } from '../../../domain/tour/TourStatus';
import { prisma } from '@/lib/prisma';
import { TourMapper } from '../../mappers/TourMapper';

export class PrismaTourRepository implements ITourRepository {
    async save(tour: Tour): Promise<void> {
        const data = TourMapper.toPersistence(tour);
        await prisma.tour.upsert({
            where: { id: tour.id },
            update: data,
            create: data as any // Types might mismatch slightly
        });
    }

    async updateStatus(id: string, status: TourStatus): Promise<void> {
        await (prisma as any).tour.update({
            where: { id },
            data: { status }
        });
    }

    async findById(id: string): Promise<Tour | null> {
        const data = await prisma.tour.findUnique({
            where: { id }
        });
        if (!data) return null;
        return TourMapper.toDomain(data);
    }

    async findByOperator(operatorId: string): Promise<Tour[]> {
        const data = await prisma.tour.findMany({
            where: { operatorId }
        });
        return data.map(TourMapper.toDomain);
    }

    async findActiveByOperator(operatorId: string): Promise<Tour[]> {
        const data = await prisma.tour.findMany({
            where: {
                operatorId,
                status: { notIn: ['COMPLETED', 'CANCELLED', 'CLOSED'] }
            }
        });
        return data.map(TourMapper.toDomain);
    }

    async findConflictingTours(guideId: string, startDate: Date, endDate: Date): Promise<Tour[]> {
        const data = await (prisma as any).tour.findMany({
            where: {
                assignedGuideId: guideId,
                status: { notIn: ['CANCELLED', 'DRAFT'] },
                OR: [
                    { startDate: { lte: endDate }, endDate: { gte: startDate } }
                ]
            }
        });
        return data.map(TourMapper.toDomain);
    }

    // Automation Support
    async findCompletedTours(): Promise<Tour[]> {
        const data = await prisma.tour.findMany({
            where: {
                status: 'IN_PROGRESS',
                endDate: { lt: new Date() }
            }
        });
        return data.map(TourMapper.toDomain);
    }

    async hasActiveIncidents(tourId: string): Promise<boolean> {
        const count = await prisma.tourIncident.count({
            where: {
                tourId,
                status: { not: 'RESOLVED' }
            }
        });
        return count > 0;
    }

    async hasActiveDisputes(tourId: string): Promise<boolean> {
        // No conflict model in schema - use tourIncident as fallback
        const count = await (prisma as any).tourIncident.count({
            where: {
                tourId,
                type: 'DISPUTE',
                status: { not: 'RESOLVED' }
            }
        });
        return count > 0;
    }

    async findPotentialNoShows(): Promise<Tour[]> {
        const data = await (prisma as any).tour.findMany({
            where: {
                status: 'ASSIGNED',
                startDate: { lt: new Date() },
                guideCheckedInAt: null
            }
        });
        return data.map(TourMapper.toDomain);
    }
}
