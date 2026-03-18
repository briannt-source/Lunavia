import { Tour } from './Tour';
import { TourStatus } from './TourStatus';

export interface ITourRepository {
    findById(id: string): Promise<Tour | null>;
    save(tour: Tour): Promise<void>;
    updateStatus(id: string, status: TourStatus): Promise<void>;
    findActiveByOperator(operatorId: string): Promise<Tour[]>;
    findConflictingTours(guideId: string, startTime: Date, endTime: Date): Promise<Tour[]>;

    // Automation Support
    findCompletedTours(): Promise<Tour[]>;
    hasActiveIncidents(tourId: string): Promise<boolean>;
    hasActiveDisputes(tourId: string): Promise<boolean>;
    findPotentialNoShows(): Promise<Tour[]>;
}
