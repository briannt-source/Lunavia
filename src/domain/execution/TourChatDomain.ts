/**
 * TourChatDomain — Secure In-App Tour Messaging
 * 
 * Handles reading and writing messages for a specific Tour.
 * Enforces strict role-based access control (RBAC):
 * - Guide: Can only read/write if they are the `assignedGuideId`.
 * - Operator: Can only read/write if they are the `operatorId`.
 * - Admin/Ops: Can read any chat and inject Official Support messages.
 */

import { prisma } from '@/lib/prisma';
import { createDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';

export interface ChatMessageInput {
    tourId: string;
    senderId: string;
    role: string;
    content: string;
}

// ── Validation ────────────────────────────────────────────────────────

async function validateChatAccess(tourId: string, userId: string, userRole: string) {
    const tour = await prisma.tour.findUnique({
        where: { id: tourId },
        select: { operatorId: true, assignedGuideId: true, title: true }
    });

    if (!tour) throw new Error('Tour not found');

    if (userRole === 'SUPER_ADMIN' || userRole === 'OPS') {
        return { authorized: true, roleLabel: 'INTERNAL_ADMIN', tour };
    }

    if (userRole === 'TOUR_OPERATOR' && tour.operatorId === userId) {
        return { authorized: true, roleLabel: 'OPERATOR', tour };
    }

    if (userRole === 'TOUR_GUIDE' && tour.assignedGuideId === userId) {
        return { authorized: true, roleLabel: 'GUIDE', tour };
    }

    throw new Error('Unauthorized to access this chat');
}

// ── Actions ───────────────────────────────────────────────────────────

async function getTourMessages(tourId: string, userId: string, userRole: string) {
    await validateChatAccess(tourId, userId, userRole);

    const messages = await (prisma as any).tourMessage.findMany({
        where: { tourId },
        include: {
            sender: { select: { id: true, name: true, email: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'asc' }
    });

    // Mark unread messages as read? (Optional enhancement)
    // if messages.some(...) -> updateMany read = true

    return messages;
}

async function sendTourMessage(input: ChatMessageInput) {
    const { authorized, roleLabel, tour } = await validateChatAccess(input.tourId, input.senderId, input.role);

    const message = await (prisma as any).tourMessage.create({
        data: {
            tourId: input.tourId,
            senderId: input.senderId,
            role: roleLabel,
            content: input.content,
        },
        include: {
            sender: { select: { id: true, name: true, email: true, avatarUrl: true } }
        }
    });

    // Create Notification for the OTHER party
    const targetUserId = roleLabel === 'GUIDE' ? tour.operatorId : tour.assignedGuideId;
    if (targetUserId && targetUserId !== input.senderId) {
        const senderName = message.sender.name || 'User';
        const roleDisplay = roleLabel === 'INTERNAL_ADMIN' ? 'Lunavia Support' : roleLabel === 'OPERATOR' ? 'Operator' : 'Guide';
        
        // Let's not await this so it doesn't block the message return
        createDomainNotification({
            userId: targetUserId,
            domain: NotificationDomain.SYSTEM,
            targetUrl: `/dashboard/${roleLabel === 'GUIDE' ? 'operator/request' : 'guide/tours'}/${input.tourId}`,
            type: 'NEW_CHAT_MESSAGE',
            title: `New Message from ${roleDisplay}`,
            message: `${senderName}: ${input.content.substring(0, 50)}${input.content.length > 50 ? '...' : ''}`,
            relatedId: input.tourId,
        }).catch(console.error);
    }

    return message;
}

export const TourChatDomain = {
    getTourMessages,
    sendTourMessage,
};
