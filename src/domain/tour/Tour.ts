import { TourStatus } from './TourStatus';

export interface TourProps {
    id: string;
    title: string;
    operatorId: string;

    // Status
    status: TourStatus;

    // Timing
    startTime: Date;
    endTime: Date;

    // Assignment
    assignedGuideId?: string | null;
    guideCheckedInAt?: Date | null;
    guideReturnedAt?: Date | null; // Added for Payment logic

    // Location
    location: string;
    province?: string | null;

    // Details
    description: string | null;
    visibility: 'PUBLIC' | 'PRIVATE' | 'HIDDEN';
}

export class Tour {
    private props: TourProps;

    constructor(props: TourProps) {
        this.props = props;
    }

    get id() { return this.props.id; }
    get title() { return this.props.title; }
    get operatorId() { return this.props.operatorId; }
    get status() { return this.props.status; }
    get startTime() { return this.props.startTime; }
    get endTime() { return this.props.endTime; }
    get assignedGuideId() { return this.props.assignedGuideId; }
    get guideCheckedInAt() { return this.props.guideCheckedInAt; }
    get guideReturnedAt() { return this.props.guideReturnedAt; } // Added for Payment logic
    get location() { return this.props.location; }
    get province() { return this.props.province; }
    get description() { return this.props.description; }
    get visibility() { return this.props.visibility; }

    // Validation Methods (Domain Logic)

    public isStartsInFuture(): boolean {
        return this.startTime.getTime() > Date.now();
    }

    public canCheckIn(): boolean {
        // Can check in if Assigned and within window (30 mins before)
        if (this.status !== 'ASSIGNED' && this.status !== 'READY') return false;

        const windowStart = new Date(this.startTime.getTime() - 30 * 60 * 1000);
        return Date.now() >= windowStart.getTime();
    }

    public assign(guideId: string): void {
        if (!['PUBLISHED', 'OPEN', 'OFFERED'].includes(this.status)) {
            throw new Error(`Cannot assign guide when status is ${this.status}`);
        }
        this.props.assignedGuideId = guideId;
        this.props.status = 'ASSIGNED';
    }
}
