export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'LOCKED';

export const USER_STATUS: Record<string, UserStatus> = {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    LOCKED: 'LOCKED'
};
