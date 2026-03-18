/**
 * Pitch Mode Utilities
 * 
 * Controls demo environment behavior for investor pitches and demos.
 * When enabled, uses seeded demo data and disables destructive actions.
 */

// Demo user IDs (stable for seeded data)
export const DEMO_IDS = {
    OPERATOR: 'demo-operator-saigon-city-tours',
    GUIDE: 'demo-guide-nguyen-van-a',
    INTERN: 'demo-guide-intern',
} as const;

// Demo tour IDs
export const DEMO_TOUR_IDS = {
    IN_PROGRESS: 'demo-tour-in-progress',
    UPCOMING_1: 'demo-tour-upcoming-1',
    UPCOMING_2: 'demo-tour-upcoming-2',
} as const;

/**
 * Check if Pitch Mode is enabled
 * Controlled via PITCH_MODE environment variable
 */
export function isPitchMode(): boolean {
    return process.env.NEXT_PUBLIC_PITCH_MODE === 'true';
}

/**
 * Check if a user ID is a demo user
 */
export function isDemoUser(userId: string): boolean {
    return Object.values(DEMO_IDS).includes(userId as any);
}

/**
 * Check if a tour ID is a demo tour
 */
export function isDemoTour(tourId: string): boolean {
    return tourId.startsWith('demo-tour-') || Object.values(DEMO_TOUR_IDS).includes(tourId as any);
}

/**
 * Watermark text for demo environment
 */
export const DEMO_WATERMARK = 'Demo Environment – Data Simulated';

/**
 * Demo personas for display
 */
export const DEMO_PERSONAS = {
    operator: {
        name: 'Saigon City Tours',
        email: 'demo-operator@lunavia.vn',
        trustScore: 87,
        completedTours: 12,
        upcomingTours: 2,
        kybStatus: 'APPROVED',
    },
    guide: {
        name: 'Nguyen Van A',
        email: 'demo-guide@lunavia.vn',
        trustScore: 92,
        completedTours: 18,
        noShowCount: 1,
        plan: 'PRO',
    },
    intern: {
        name: 'Intern Guide',
        email: 'demo-intern@lunavia.vn',
        plan: 'INTERN',
    },
} as const;
