import { UserStatus } from './UserStatus';
import { UserRole } from './UserRole';
import { VerificationStatus, KYCStatus } from '../governance/VerificationStatus';

export interface UserProps {
    id: string;
    email: string;
    role: UserRole;
    accountStatus: UserStatus;
    kycStatus: KYCStatus;
    permissions: string[]; // List of permission codes
}

export class User {
    private props: UserProps;

    constructor(props: UserProps) {
        this.props = props;
    }

    get id() { return this.props.id; }
    get email() { return this.props.email; }
    get role() { return this.props.role; }
    get accountStatus() { return this.props.accountStatus; }
    get kycStatus() { return this.props.kycStatus; }

    public suspend(): void {
        if (this.props.accountStatus === 'SUSPENDED') {
            return; // Idempotent
        }
        this.props.accountStatus = 'SUSPENDED';
    }

    public reactivate(): void {
        this.props.accountStatus = 'ACTIVE';
    }

    public updateKYCStatus(status: KYCStatus): void {
        this.props.kycStatus = status;
        // Business Rule: If KYC rejected, maybe suspend? Or just keep active but limited?
        // For now, just update status.
    }

    public hasPermission(permission: string): boolean {
        // ADMIN has all? Or explicit? 
        // Let's assume explicit permissions + Role based base permissions (handled in Policy or here).
        // For simplicity in Phase 4, check explicit list.
        return this.props.permissions.includes(permission);
    }
}
