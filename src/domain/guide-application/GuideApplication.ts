import { RoleType } from './RoleType';
import { ApplicationStatus } from './ApplicationStatus';

export interface GuideApplicationProps {
    id: string;
    guideId: string;
    requestId: string;
    roleApplied: RoleType;
    status: ApplicationStatus;
    appliedAt: Date;

    // Optional: Include related tour info if fetched eagerly?
    // In strict DDD, mostly ID references, but for validation we might need tour dates.
}

export class GuideApplication {
    private props: GuideApplicationProps;

    constructor(props: GuideApplicationProps) {
        this.props = props;
    }

    get id() { return this.props.id; }
    get guideId() { return this.props.guideId; }
    get requestId() { return this.props.requestId; }
    get roleApplied() { return this.props.roleApplied; }
    get status() { return this.props.status; }
    get appliedAt() { return this.props.appliedAt; }

    public isPending(): boolean {
        return this.props.status === 'APPLIED';
    }

    public accept(): void {
        if (this.status !== 'APPLIED') {
            throw new Error(`Cannot accept application in ${this.status} state.`);
        }
        this.props.status = 'ACCEPTED';
    }

    public reject(): void {
        if (this.status !== 'APPLIED') {
            // In some cases we might reject accepted ones? No, usually terminal.
            // But let's allow Reject from any non-terminal?
            // System cancels accepted ones if conflict arises later? 
            // Logic says mostly Applied -> Rejected.
        }
        this.props.status = 'REJECTED';
    }

    public systemCancel(reason: string): void {
        this.props.status = 'CANCELLED_BY_SYSTEM';
    }

    public withdraw(): void {
        if (this.status !== 'APPLIED') {
            throw new Error(`Cannot withdraw application in ${this.status} state.`);
        }
        this.props.status = 'WITHDRAWN_BY_GUIDE';
    }
}
