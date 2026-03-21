import { Tour } from '@/domain/tour/Tour';
import { TourStatus } from '@/domain/tour/TourStatus';
import { Tour } from '@prisma/client';

export class TourMapper {
    static toDomain(raw: Tour): Tour {
        return new Tour({
            id: raw.id,
            operatorId: raw.operatorId,
            assignedGuideId: raw.assignedGuideId,
            title: raw.title,
            description: raw.description,
            startDate: raw.startDate,
            endDate: raw.endDate,
            location: raw.location,
            province: raw.province,
            status: raw.status as TourStatus,
            visibility: raw.visibility as any ?? 'PUBLIC',
            guideCheckedInAt: raw.guideCheckedInAt,
            guideReturnedAt: raw.guideReturnedAt
        });
    }

    static toPersistence(domain: Tour): Partial<Tour> {
        return {
            id: domain.id,
            operatorId: domain.operatorId,
            assignedGuideId: domain.assignedGuideId,
            title: domain.title,
            description: domain.description,
            startDate: domain.startDate,
            endDate: domain.endDate,
            location: domain.location,
            province: domain.province,
            status: domain.status,
            visibility: domain.visibility,
            updatedAt: new Date()
        };
    }
}
