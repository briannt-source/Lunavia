
import { PaymentDispute } from './PaymentDispute';

export interface IDisputeRepository {
    findById(id: string): Promise<PaymentDispute | null>;
    findOpenByPaymentId(paymentRequestId: string): Promise<PaymentDispute | null>;
    save(dispute: PaymentDispute): Promise<void>;
}
