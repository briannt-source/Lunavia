import { IUserRepository } from '@/domain/user/IUserRepository';
import { User } from '@/domain/user/User';
import { prisma } from '@/lib/prisma';
import { UserStatus } from '@/domain/user/UserStatus';
import { UserRole } from '@/domain/user/UserRole';
import { KYCStatus } from '@/domain/governance/VerificationStatus';

export class PrismaUserRepository implements IUserRepository {
    async findById(id: string): Promise<User | null> {
        const raw = await prisma.user.findUnique({
            where: { id },
            include: { userPermissions: true, role: true }
        });

        if (!raw) return null;

        return this.mapToDomain(raw);
    }

    async findByEmail(email: string): Promise<User | null> {
        const raw = await prisma.user.findUnique({
            where: { email },
            include: { userPermissions: true, role: true }
        });

        if (!raw) return null;

        return this.mapToDomain(raw);
    }

    async save(user: User): Promise<void> {
        // Only update modifiable fields for Phase 4
        await prisma.user.update({
            where: { id: user.id },
            data: {
                accountStatus: user.accountStatus,
                kycStatus: user.kycStatus
                // Role is immutable usually, permissions updated via separate flow usually?
                // For simplicity, we don't save permissions here unless changed. 
                // User entity doesn't have method to add/remove permissions yet.
            }
        });
    }

    private mapToDomain(raw: any): User {
        return new User({
            id: raw.id,
            email: raw.email,
            role: (raw.role?.name || 'USER') as UserRole,
            accountStatus: raw.accountStatus as UserStatus,
            kycStatus: raw.kycStatus as KYCStatus,
            permissions: raw.userPermissions ? raw.userPermissions.map((p: any) => p.permission) : []
        });
    }
}
