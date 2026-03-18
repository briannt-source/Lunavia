export type UserRole = 'TOUR_GUIDE' | 'TOUR_OPERATOR' | 'ADMIN' | 'OPS' | 'CS' | 'FINANCE';

export const USER_ROLE: Record<string, UserRole> = {
    TOUR_GUIDE: 'TOUR_GUIDE',
    TOUR_OPERATOR: 'TOUR_OPERATOR',
    ADMIN: 'ADMIN',
    OPS: 'OPS',
    CS: 'CS',
    FINANCE: 'FINANCE'
};
