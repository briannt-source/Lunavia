import { GuideApplication } from './GuideApplication';
import { ApplicationStatus } from './ApplicationStatus';
import { RoleType } from './RoleType';

export interface IGuideApplicationRepository {
    findById(id: string): Promise<GuideApplication | null>;
    findByGuideAndRequest(guideId: string, requestId: string): Promise<GuideApplication | null>;
    findByGuideId(guideId: string): Promise<GuideApplication[]>;
    findByRequestId(requestId: string): Promise<GuideApplication[]>;
    countActiveByGuide(guideId: string, role?: RoleType): Promise<number>;
    findConflictingApplications(guideId: string, startTime: Date, endTime: Date, excludeRequestId?: string): Promise<GuideApplication[]>;
    save(application: GuideApplication): Promise<void>;

    // Batch operations for assignment
    cancelMany(ids: string[]): Promise<void>;
    rejectManyForRequest(requestId: string, sentIdsToExclude: string[]): Promise<void>;
}
