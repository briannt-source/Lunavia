
import { DisputeStatus } from './DisputeStatus';

export interface PaymentDisputeProps {
    id: string;
    paymentRequestId: string;
    guideId: string;
    reason: string;
    description?: string | null;
    status: DisputeStatus;
    resolution?: string | null;
    internalNotes?: string | null;
    resolvedBy?: string | null;
    createdAt: Date;
    resolvedAt?: Date | null;
}

export class PaymentDispute {
    private props: PaymentDisputeProps;

    constructor(props: PaymentDisputeProps) {
        this.props = props;
    }

    get id() { return this.props.id; }
    get paymentRequestId() { return this.props.paymentRequestId; }
    get status() { return this.props.status; }
    get guideId() { return this.props.guideId; }
    get reason() { return this.props.reason; }
    get description() { return this.props.description; }
    get resolution() { return this.props.resolution; }
    get internalNotes() { return this.props.internalNotes; }
    get resolvedBy() { return this.props.resolvedBy; }
    get createdAt() { return this.props.createdAt; }
    get resolvedAt() { return this.props.resolvedAt; }


    public resolve(resolution: string, resolverId: string, notes?: string): void {
        if (this.props.status !== 'OPEN' && this.props.status !== 'INVESTIGATING') {
            throw new Error(`Cannot resolve dispute in ${this.props.status} state.`);
        }
        this.props.status = 'RESOLVED';
        this.props.resolution = resolution;
        this.props.resolvedBy = resolverId;
        if (notes) this.props.internalNotes = notes;
        this.props.resolvedAt = new Date();
    }
}
