import { User } from './User';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<void>;
    // Phase 4 specific:
    findByEmail(email: string): Promise<User | null>;
}
