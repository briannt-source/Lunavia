
import { PaymentRequest } from './PaymentRequest';
import { PaymentStatus } from './PaymentStatus';

export interface IPaymentRepository {
    findById(id: string): Promise<PaymentRequest | null>;
    findByTourId(tourId: string): Promise<PaymentRequest | null>;
    save(payment: PaymentRequest): Promise<void>;

    // For listing if needed, but strict refactor focuses on write side mainly or specific read
}
