import { GuideApplication } from './GuideApplication';

export class ApplicationPolicy {
    static readonly MAX_APPLICATIONS_PER_ROLE = 10;

    static canApply(
        activeApplicationsCount: number,
        kycStatus: string
    ): { allowed: boolean; reason?: string } {
        if (kycStatus !== 'APPROVED') {
            return { allowed: false, reason: 'KYC Verification Required' };
        }

        if (activeApplicationsCount >= this.MAX_APPLICATIONS_PER_ROLE) {
            return { allowed: false, reason: `Max ${this.MAX_APPLICATIONS_PER_ROLE} active applications allowed.` };
        }

        return { allowed: true };
    }

    static isTimeConflict(
        tourStart: Date,
        tourEnd: Date,
        existingTours: { startDate: Date; endDate: Date }[]
    ): boolean {
        // Simple overlap check
        return existingTours.some(existing => {
            return (tourStart < existing.endDate && tourEnd > existing.startDate);
        });
    }
}
