/**
 * FeedbackDomain — Tour Feedback Mutations
 */

import { prisma } from '@/lib/prisma';

interface CreateFeedbackInput {
    tourId: string; userId: string; role: string;
    rating: number; tags: string[]; comment?: string; severity: number | string;
}

async function createFeedback(input: CreateFeedbackInput) {
    return prisma.tourFeedback.create({
        data: {
            tourId: input.tourId,
            userId: input.userId,
            role: input.role,
            rating: input.rating,
            tags: JSON.stringify(input.tags),
            comment: input.comment?.slice(0, 500),
            severity: String(input.severity),
        },
    });
}

export const FeedbackDomain = { createFeedback };
