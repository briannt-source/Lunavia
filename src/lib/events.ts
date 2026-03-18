/**
 * lib/events.ts
 * 
 * Scale-Ready Event Hook Layer.
 * Centralizes event emission for logging, notifications, and future external integrations.
 */

export type LunaviaEventType =
    | 'TOUR_PUBLISHED'
    | 'GUIDE_APPLIED'
    | 'GUIDE_ASSIGNED'
    | 'GUIDE_CHECKED_IN'
    | 'TOUR_STARTED'
    | 'TOUR_COMPLETED'
    | 'TOUR_CLOSED'
    | 'TOUR_REOPENED'
    | 'GUIDE_NO_SHOW'
    | 'INCIDENT_REPORTED'
    | 'PAYMENT_REQUESTED'
    | 'PAYMENT_ACCEPTED'
    | 'PAYMENT_DISPUTED'
    | 'SYSTEM_ALERT'
    | 'VERIFICATION_SUBMITTED';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP';

export interface EventPayload {
    tourId?: string;
    actorId?: string;
    targetUserId?: string;
    priority?: 'NORMAL' | 'HIGH' | 'CRITICAL';
    channels?: NotificationChannel[];
    metadata?: Record<string, any>;
    timestamp: Date;
}

import { sendEmail } from './mail';
import { prisma } from './prisma';
import { PrismaNotificationRepo } from '@/infrastructure/repositories/prismaNotificationRepo';

export async function emitEvent(type: LunaviaEventType, payload: EventPayload) {
    const priority = payload.priority || 'NORMAL';
    const channels = payload.channels || ['IN_APP'];

    console.log(`[EventHook] [${priority}] Emitting ${type} via ${channels.join(',')}:`, JSON.stringify(payload));

    // 1. Channel Processing
    for (const channel of channels) {
        if (channel === 'IN_APP') {
            // Logic for broad-casting to permission-holders:
            if (type === 'VERIFICATION_SUBMITTED') {
                // Find all users with VERIFICATION_READ permission via RBAC
                const reviewerResults: { id: string }[] = await (prisma as any).$queryRaw`
                    SELECT DISTINCT u.id FROM "User" u
                    JOIN "Role" r ON u."roleId" = r.id
                    JOIN "RolePermission" rp ON rp."roleId" = r.id
                    JOIN "Permission" p ON rp."permissionId" = p.id
                    WHERE p.code IN ('VERIFICATION_READ', 'VERIFICATION_APPROVE')
                `;

                const allRecipientIds = reviewerResults.map(r => r.id);

                for (const recipientId of allRecipientIds) {
                    await PrismaNotificationRepo.add({
                        userId: recipientId,
                        type: 'VERIFICATION_PENDING' as any,
                        message: `New verification submitted by ${payload.metadata?.email || 'user'}.`,
                        severity: 'INFO' as any
                    });
                }
            } else if (payload.targetUserId) {
                // Default point-to-point notification
                await PrismaNotificationRepo.add({
                    userId: payload.targetUserId,
                    type: type as any,
                    message: payload.metadata?.message || `Social event: ${type}`,
                    severity: (priority === 'NORMAL' ? 'INFO' : 'WARNING') as any
                });
            }
        }

        if (channel === 'EMAIL' && payload.metadata?.email) {
            await sendEmail({
                to: payload.metadata.email,
                subject: payload.metadata.subject || `Lunavia Alert: ${type}`,
                text: payload.metadata.text || `Event ${type} occurred at ${payload.timestamp.toISOString()}`
            });
        }
    }

    return { success: true, eventId: `evt_${Date.now()}`, priority, channels };
}
