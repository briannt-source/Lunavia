import { Verification } from './Verification';

export interface IVerificationRepository {
    findById(id: string): Promise<Verification | null>;
    findByUserId(userId: string): Promise<Verification | null>; // Latest submission
    save(verification: Verification): Promise<void>;
}
