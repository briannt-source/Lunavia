import { VerificationStatus } from './VerificationStatus';

export interface VerificationProps {
    id: string;
    userId: string;
    type: string; // KYC | KYB
    status: VerificationStatus;
    submittedAt: Date;
    reviewedAt?: Date | null;
    rejectReason?: string | null;
}

export class Verification {
    private props: VerificationProps;

    constructor(props: VerificationProps) {
        this.props = props;
    }

    get id() { return this.props.id; }
    get userId() { return this.props.userId; }
    get status() { return this.props.status; }
    get type() { return this.props.type; }
    get reviewedAt() { return this.props.reviewedAt; }
    get rejectReason() { return this.props.rejectReason; }

    public approve(reviewerId: string): void {
        if (this.props.status !== 'PENDING') {
            throw new Error(`Cannot approve verification in ${this.props.status} state`);
        }
        this.props.status = 'APPROVED';
        this.props.reviewedAt = new Date();
    }

    public reject(reason: string, reviewerId: string): void {
        if (this.props.status !== 'PENDING') {
            throw new Error(`Cannot reject verification in ${this.props.status} state`);
        }
        this.props.status = 'REJECTED';
        this.props.rejectReason = reason;
        this.props.reviewedAt = new Date();
    }
}
