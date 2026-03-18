/**
 * SettingsDomain — Admin System Configuration Mutations
 *
 * All system-level config mutations live here:
 * maintenance mode, vouchers, system config, demo reset.
 */

import { prisma } from '@/lib/prisma';
import { AUDIT_ACTIONS, ENTITY_TYPES } from '@/domain/governance/AuditService';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { DEMO_IDS } from '@/lib/pitch-mode';

// ══════════════════════════════════════════════════════════════════════
// SET MAINTENANCE MODE
// ══════════════════════════════════════════════════════════════════════

interface SetMaintenanceInput {
    actorId: string; actorRole: string;
    enabled: boolean; message?: string; endTime?: string; type?: string;
}

async function setMaintenanceMode(input: SetMaintenanceInput) {
    const { actorId, actorRole, enabled, message, endTime, type } = input;

    return executeSimpleMutation({
        entityName: ENTITY_TYPES.SYSTEM_CONFIG,
        entityId: 'MAINTENANCE_MODE',
        actorId,
        actorRole,
        auditAction: AUDIT_ACTIONS.MAINTENANCE_TOGGLED,
        auditBefore: {},
        auditAfter: () => ({ enabled, message, endTime, type }),
        metadata: { maintenanceEnabled: enabled },
        atomicMutation: async (tx) => {
            const updates = [
                { key: 'MAINTENANCE_MODE', value: enabled ? 'true' : 'false' },
                { key: 'MAINTENANCE_MESSAGE', value: message || '' },
                { key: 'MAINTENANCE_END', value: endTime || '' },
                { key: 'MAINTENANCE_TYPE', value: type || 'SOFT' },
            ];

            for (const update of updates) {
                await tx.systemConfig.upsert({
                    where: { key: update.key },
                    update: { value: update.value },
                    create: { key: update.key, value: update.value },
                });
            }

            return { maintenanceMode: enabled };
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// CREATE VOUCHER
// ══════════════════════════════════════════════════════════════════════

interface CreateVoucherInput {
    actorId: string; actorRole: string;
    code: string; plan: string; durationType: string;
    durationValue: number; expiresAt?: string; maxRedemptions?: number;
}

async function createVoucher(input: CreateVoucherInput) {
    const { actorId, actorRole, code, plan, durationType, durationValue, expiresAt, maxRedemptions } = input;

    return executeSimpleMutation({
        entityName: ENTITY_TYPES.VOUCHER,
        actorId,
        actorRole,
        auditAction: AUDIT_ACTIONS.VOUCHER_CREATED,
        auditBefore: {},
        auditAfter: (r: any) => ({ code: r.voucher.code, plan, durationType, durationValue }),
        metadata: { voucherCode: code.toUpperCase() },
        atomicMutation: async (tx) => {
            const voucher = await tx.voucher.create({
                data: {
                    code: code.toUpperCase(),
                    plan,
                    durationType,
                    durationValue,
                    expiresAt: expiresAt ? new Date(expiresAt) : null,
                    maxRedemptions: maxRedemptions || null,
                    createdBy: actorId,
                },
            });

            return { voucher };
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// UPDATE SYSTEM CONFIG (Bank Details)
// ══════════════════════════════════════════════════════════════════════

interface UpdateSystemConfigInput {
    actorId: string; actorRole: string;
    configKey: 'ESCROW_BANK' | 'REVENUE_BANK';
    bankName: string; accountNumber: string; accountName: string; branch?: string;
}

async function updateSystemConfig(input: UpdateSystemConfigInput) {
    const { actorId, actorRole, configKey, bankName, accountNumber, accountName, branch } = input;

    return executeSimpleMutation({
        entityName: ENTITY_TYPES.SYSTEM_CONFIG,
        entityId: configKey,
        actorId,
        actorRole,
        auditAction: AUDIT_ACTIONS.SYSTEM_CONFIG_UPDATED,
        auditBefore: {},
        auditAfter: () => ({ bankName, accountNumber, accountName, branch }),
        metadata: { configKey },
        atomicMutation: async (tx) => {
            const value = JSON.stringify({ bankName, accountNumber, accountName, branch });

            const updatedConfig = await tx.systemConfig.upsert({
                where: { key: configKey },
                update: { value },
                create: { key: configKey, value, description: `Lunavia Bank Account for ${configKey === 'ESCROW_BANK' ? 'Top-ups' : 'Subscriptions'}` },
            });

            return { data: JSON.parse(updatedConfig.value) };
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// DEMO RESET
// ══════════════════════════════════════════════════════════════════════

interface DemoResetInput {
    actorId: string; actorRole: string; action: string;
}

async function demoReset(input: DemoResetInput) {
    const { actorId, actorRole, action } = input;

    return executeSimpleMutation({
        entityName: ENTITY_TYPES.SYSTEM_CONFIG,
        entityId: 'DEMO_RESET',
        actorId,
        actorRole,
        auditAction: AUDIT_ACTIONS.DEMO_RESET_EXECUTED,
        auditBefore: {},
        auditAfter: (r: any) => ({ action, results: r.results }),
        metadata: { action },
        atomicMutation: async (tx) => {
            const results: string[] = [];

            if (action === 'tours' || action === 'all') {
                await tx.serviceRequest.updateMany({
                    where: { id: { startsWith: 'demo-tour-' } },
                    data: { status: 'PUBLISHED' },
                });
                await tx.serviceRequest.update({ where: { id: 'demo-tour-in-progress' }, data: { status: 'IN_PROGRESS' } }).catch(() => { });
                await tx.serviceRequest.update({ where: { id: 'demo-tour-upcoming-1' }, data: { status: 'ASSIGNED' } }).catch(() => { });
                results.push('Demo tours reset');
            }

            if (action === 'payments' || action === 'all') {
                await (tx as any).tourPaymentRequest.deleteMany({
                    where: { OR: [{ guideId: DEMO_IDS.GUIDE }, { guideId: DEMO_IDS.INTERN }] },
                }).catch(() => { });
                results.push('Demo payments reset');
            }

            if (action === 'trust' || action === 'all') {
                await tx.trustEvent.deleteMany({
                    where: { userId: { in: [DEMO_IDS.OPERATOR, DEMO_IDS.GUIDE, DEMO_IDS.INTERN] }, id: { not: { startsWith: 'demo-' } } },
                });
                results.push('Demo trust data reset');
            }

            if (action === 'notifications' || action === 'all') {
                await tx.notification.deleteMany({
                    where: { userId: { in: [DEMO_IDS.OPERATOR, DEMO_IDS.GUIDE, DEMO_IDS.INTERN] } },
                });
                results.push('Demo notifications cleared');
            }

            return { results };
        },
    });
}


export const SettingsDomain = {
    setMaintenanceMode,
    createVoucher,
    updateSystemConfig,
    demoReset,
};
