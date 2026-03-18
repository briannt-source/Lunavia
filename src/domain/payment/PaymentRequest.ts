
import { PaymentStatus } from './PaymentStatus';
import { RejectReason } from './RejectReason';

export interface PaymentRequestProps {
    id: string;
    tourId: string;
    guideId: string;
    operatorId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    guideNote?: string | null;
    operatorNote?: string | null;
    rejectReason?: RejectReason | null;
    receiptUrl?: string | null;
    createdAt: Date;
    decidedAt?: Date | null;
}

export class PaymentRequest {
    private props: PaymentRequestProps;

    constructor(props: PaymentRequestProps) {
        this.props = props;
    }

    get id() { return this.props.id; }
    get tourId() { return this.props.tourId; }
    get guideId() { return this.props.guideId; }
    get operatorId() { return this.props.operatorId; }
    get amount() { return this.props.amount; }
    get status() { return this.props.status; }
    get receiptUrl() { return this.props.receiptUrl; }
    get guideNote() { return this.props.guideNote; }
    get operatorNote() { return this.props.operatorNote; }
    get rejectReason() { return this.props.rejectReason; }
    get createdAt() { return this.props.createdAt; }
    get decidedAt() { return this.props.decidedAt; }


    public accept(receiptUrl: string, note?: string): void {
        if (this.props.status !== 'PENDING') {
            throw new Error(`Cannot accept payment request in ${this.props.status} state.`);
        }
        this.props.status = 'ACCEPTED';
        this.props.receiptUrl = receiptUrl;
        if (note) this.props.operatorNote = note;
        this.props.decidedAt = new Date();
    }

    public reject(reason: RejectReason, note?: string): void {
        if (this.props.status !== 'PENDING') {
            throw new Error(`Cannot reject payment request in ${this.props.status} state.`);
        }
        this.props.status = 'REJECTED';
        this.props.rejectReason = reason;
        if (note) this.props.operatorNote = note;
        this.props.decidedAt = new Date();
    }
}
