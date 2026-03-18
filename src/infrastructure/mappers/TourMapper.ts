import { Tour } from '@/domain/tour/Tour';
import { TourStatus } from '@/domain/tour/TourStatus';
import { ServiceRequest } from '@prisma/client';

export class TourMapper {
    static toDomain(raw: ServiceRequest): Tour {
        return new Tour({
            id: raw.id,
            operatorId: raw.operatorId,
            assignedGuideId: raw.assignedGuideId,
            title: raw.title,
            description: raw.description,
            startTime: raw.startTime,
            endTime: raw.endTime,
            location: raw.location,
            province: raw.province,
            status: raw.status as TourStatus,
            visibility: raw.visibility as any ?? 'PUBLIC',
            guideCheckedInAt: raw.guideCheckedInAt,
            guideReturnedAt: raw.guideReturnedAt
        });
    }

    static toPersistence(domain: Tour): Partial<ServiceRequest> {
        return {
            id: domain.id,
            operatorId: domain.operatorId,
            assignedGuideId: domain.assignedGuideId,
            title: domain.title,
            description: domain.description,
            startTime: domain.startTime,
            endTime: domain.endTime,
            location: domain.location,
            province: domain.province,
            status: domain.status,
            visibility: domain.visibility,
            updatedAt: new Date()
        };
    }
}
