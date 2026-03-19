/**
 * V7 Observability Helpers
 * 
 * Philosophy: Observe + Notify, never auto-resolve.
 * These helpers surface silent failures without changing state.
 */

import { prisma } from '@/lib/prisma';
import { getLedgerDriftCases, getHighBoostFrequency, getStaleRiskCases } from '@/lib/monitoring';

// ============================================
// THRESHOLDS (in hours)
// ============================================

export const OBSERVABILITY_THRESHOLDS = {
    STALE_COMPLETED_HOURS: 48,
    PENDING_APPLICATION_HOURS: 24,
    PENDING_CONTRACT_HOURS: 72,
    FORCE_CANCEL_REVIEW_HOURS: 24,
    ESCROW_PENDING_HOURS: 48,
    BULK_ONBOARD_REMINDER_HOURS: 48,
    // Living System: Operational Urgency
    TOUR_START_URGENCY_HOURS: 6,  // Tours starting within 6 hours
    GUIDE_CANCELLATION_HOURS: 24  // Guide cancelled < 24h before tour
};

// ============================================
// ATTENTION ITEM TYPES
// ============================================

export interface AttentionItem {
    type: 'STALE_COMPLETED' | 'PENDING_APPLICATION' | 'PENDING_CONTRACT' | 'FORCE_CANCEL_REVIEW' | 'ESCROW_PENDING' | 'INACTIVE_GUIDE' | 'LEDGER_DRIFT' | 'HIGH_BOOST_FREQUENCY' | 'STALE_RISK';
    severity: 'warning' | 'critical';
    count: number;
    label: string;
    description: string;
    tourIds?: string[];
    userIds?: string[];
}

// ============================================
// DETECTION HELPERS
// ============================================

/**
 * Get tours in COMPLETED status for >48h (not closed)
 * Silent failure: escrow not released, trust not awarded
 */
export async function getStaleCompletedTours(hoursThreshold: number = OBSERVABILITY_THRESHOLDS.STALE_COMPLETED_HOURS) {
    const cutoffDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

    return prisma.tour.findMany({
        where: {
            status: 'COMPLETED',
            updatedAt: { lt: cutoffDate }
        },
        select: {
            id: true,
            title: true,
            operatorId: true,
            updatedAt: true,
            escrowStatus: true
        },
        orderBy: { updatedAt: 'asc' }
    });
}

/**
 * Get applications pending for >24h without operator action
 */
export async function getPendingApplications(hoursThreshold: number = OBSERVABILITY_THRESHOLDS.PENDING_APPLICATION_HOURS) {
    const cutoffDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

    return prisma.guideApplication.findMany({
        where: {
            status: 'APPLIED',
            createdAt: { lt: cutoffDate }
        },
        select: {
            id: true,
            requestId: true,
            guideId: true,
            createdAt: true,
            request: {
                select: {
                    title: true,
                    operatorId: true
                }
            }
        },
        orderBy: { createdAt: 'asc' }
    });
}

/**
 * Get pending applications grouped by operator
 */
export async function getPendingApplicationsByOperator(operatorId: string, hoursThreshold: number = OBSERVABILITY_THRESHOLDS.PENDING_APPLICATION_HOURS) {
    const cutoffDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

    const applications = await prisma.guideApplication.findMany({
        where: {
            status: 'APPLIED',
            createdAt: { lt: cutoffDate },
            request: { operatorId }
        },
        select: {
            id: true,
            request: {
                select: { id: true, title: true }
            }
        }
    });

    return applications;
}

/**
 * Get contracts pending review for >72h
 */
export async function getPendingContracts(hoursThreshold: number = OBSERVABILITY_THRESHOLDS.PENDING_CONTRACT_HOURS) {
    const cutoffDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

    return prisma.user.findMany({
        where: {
            contractStatus: 'PENDING',
            updatedAt: { lt: cutoffDate }
        },
        select: {
            id: true,
            email: true,
            affiliatedOperatorId: true,
            updatedAt: true
        },
        orderBy: { updatedAt: 'asc' }
    });
}

/**
 * Get force cancellation claims pending review for >24h
 */
export async function getPendingForceCancelReviews(hoursThreshold: number = OBSERVABILITY_THRESHOLDS.FORCE_CANCEL_REVIEW_HOURS) {
    const cutoffDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

    return prisma.tour.findMany({
        where: {
            status: 'FORCE_CANCEL_PENDING_REVIEW',
            updatedAt: { lt: cutoffDate }
        },
        select: {
            id: true,
            title: true,
            cancellationReason: true,
            cancellationInitiator: true,
            updatedAt: true
        },
        orderBy: { updatedAt: 'asc' }
    });
}

/**
 * Get tours with escrow HELD but not released for >48h after completion
 */
export async function getPendingEscrowReleases(hoursThreshold: number = OBSERVABILITY_THRESHOLDS.ESCROW_PENDING_HOURS) {
    const cutoffDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

    return prisma.tour.findMany({
        where: {
            status: 'CLOSED',
            escrowStatus: 'HELD',
            operatorClosedAt: { lt: cutoffDate }
        },
        select: {
            id: true,
            title: true,
            operatorId: true,
            operatorClosedAt: true,
            totalPayout: true
        },
        orderBy: { operatorClosedAt: 'asc' }
    });
}

/**
 * Get bulk-added guides who haven't logged in
 */
export async function getInactiveOnboardedGuides(hoursThreshold: number = OBSERVABILITY_THRESHOLDS.BULK_ONBOARD_REMINDER_HOURS) {
    const cutoffDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

    // Guides with affiliatedOperatorId but never logged in (no session)
    const guides = await prisma.user.findMany({
        where: {
            role: { name: 'TOUR_GUIDE' },
            affiliatedOperatorId: { not: null },
            createdAt: { lt: cutoffDate },
            // If emailVerified is null, likely never logged in
            emailVerified: null
        },
        select: {
            id: true,
            email: true,
            affiliatedOperatorId: true,
            createdAt: true,
            contractStatus: true,
            guideMode: true
        },
        orderBy: { createdAt: 'asc' }
    });

}


// ============================================
// GUIDE ACTIVATION STATUS HELPER
// ============================================

export type GuideActivationStatus = 'INVITED' | 'ACTIVATED' | 'CONTRACT_PENDING' | 'IN_HOUSE_APPROVED' | 'MARKETPLACE';

export function getGuideActivationStatus(guide: {
    emailVerified: Date | null;
    contractStatus: string | null;
    guideMode: string | null;
}): GuideActivationStatus {
    // If email not verified, they haven't logged in
    if (!guide.emailVerified) {
        return 'INVITED';
    }

    // If they have a pending contract
    if (guide.contractStatus === 'PENDING') {
        return 'CONTRACT_PENDING';
    }

    // If approved as in-house
    if (guide.guideMode === 'IN_HOUSE' && guide.contractStatus === 'APPROVED') {
        return 'IN_HOUSE_APPROVED';
    }

    // If marketplace or no specific mode
    if (guide.guideMode === 'MARKETPLACE' || !guide.guideMode) {
        return 'MARKETPLACE';
    }

    // Logged in but hasn't submitted contract
    return 'ACTIVATED';
}

export function getActivationStatusLabel(status: GuideActivationStatus): { label: string; color: string } {
    switch (status) {
        case 'INVITED':
            return { label: 'Chưa kích hoạt', color: 'gray' };
        case 'ACTIVATED':
            return { label: 'Đã kích hoạt', color: 'blue' };
        case 'CONTRACT_PENDING':
            return { label: 'Chờ hợp đồng', color: 'yellow' };
        case 'IN_HOUSE_APPROVED':
            return { label: 'In-house', color: 'green' };
        case 'MARKETPLACE':
            return { label: 'Marketplace', color: 'purple' };
    }
}
