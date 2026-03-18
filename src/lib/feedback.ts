export const FEEDBACK_TAGS = {
    // Tags for Operator rating a Guide
    TOUR_OPERATOR: [
        { id: 'GUIDE_PROFESSIONALISM', label: 'Professionalism' },
        { id: 'GUIDE_PUNCTUALITY', label: 'Punctuality' },
        { id: 'GUIDE_COMMUNICATION', label: 'Communication' },
        { id: 'GUIDE_KNOWLEDGE', label: 'Knowledge' },
        { id: 'GUIDE_ATTITUDE', label: 'Attitude' },
        { id: 'GUIDE_ISSUE_OCCURRED', label: 'Critical Issue' },
    ],
    // Tags for Guide rating an Operator
    TOUR_GUIDE: [
        { id: 'OPERATOR_COMMUNICATION', label: 'Communication' },
        { id: 'OPERATOR_PREPARATION', label: 'Preparation' },
        { id: 'OPERATOR_TIMING', label: 'Timing/Logistics' },
        { id: 'OPERATOR_SUPPORT', label: 'Support' },
        { id: 'OPERATOR_CLARITY', label: 'Instructions Clarity' },
        { id: 'OPERATOR_ISSUE_OCCURRED', label: 'Critical Issue' },
    ],
};

export type FeedbackSeverity = 'OK' | 'WARNING' | 'CRITICAL';

export function calculateSeverity(rating: number, tags: string[]): FeedbackSeverity {
    // 1. Critical if rating <= 2
    if (rating <= 2) return 'CRITICAL';

    // 2. Critical if any issue occurred tag present
    const hasIssue = tags.some(t => t.endsWith('_ISSUE_OCCURRED'));
    if (hasIssue) return 'CRITICAL';

    // 3. Warning if rating = 3
    if (rating === 3) return 'WARNING';

    // 4. OK if rating >= 4
    return 'OK';
}

export function validateFeedback(rating: number, tags: string[], role: 'TOUR_OPERATOR' | 'TOUR_GUIDE'): { valid: boolean; error?: string } {
    // Rule 1: Max 3 tags
    if (tags.length > 3) {
        return { valid: false, error: 'Maximum 3 tags allowed' };
    }

    // Rule 2: Rating <= 3 requires at least 1 tag
    if (rating <= 3 && tags.length === 0) {
        return { valid: false, error: 'Please select at least one tag for ratings of 3 stars or less' };
    }

    // Rule 3: Tags must be from Enum
    const allowedTags = FEEDBACK_TAGS[role].map(t => t.id);
    const invalidTag = tags.find(t => !allowedTags.includes(t));
    if (invalidTag) {
        return { valid: false, error: `Invalid tag: ${invalidTag}` };
    }

    return { valid: true };
}
