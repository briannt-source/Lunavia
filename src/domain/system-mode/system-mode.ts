// ══════════════════════════════════════════════════════════════════════
// System Mode — Operator-level mode & feature layer management
// ══════════════════════════════════════════════════════════════════════

import { prisma } from '@/lib/prisma';
import type { SystemMode, FeatureLayer } from '@prisma/client';

// ── Mode → Default Layer Mapping (Phase 5 spec) ─────────────────────

export const MODE_DEFAULT_LAYERS: Record<SystemMode, FeatureLayer[]> = {
    INTERNAL_OPERATOR_MODE: [
        'HYBRID_INTERNAL_ASSIGN',
        'ADVANCED_ANALYTICS',
    ],
    MARKETPLACE_MODE: [
        'MARKETPLACE_ACCESS',
        'ESCROW_ENABLED',
        'COMMISSION_ENABLED',
        'BOOST_ENABLED',
    ],
    SAAS_ENTERPRISE_MODE: [
        'MARKETPLACE_ACCESS',
        'ESCROW_ENABLED',
        'COMMISSION_ENABLED',
        'BOOST_ENABLED',
        'HYBRID_INTERNAL_ASSIGN',
        'ADVANCED_ANALYTICS',
    ],
};

// ── Assignment Type ──────────────────────────────────────────────────

export type AssignmentType = 'FREELANCE' | 'INHOUSE';

/**
 * Derive the assignment type from a guide's guideMode field.
 */
export function getAssignmentType(guideMode: string | null | undefined): AssignmentType {
    return guideMode === 'IN_HOUSE' ? 'INHOUSE' : 'FREELANCE';
}

// ── Layer Resolution ─────────────────────────────────────────────────

export interface OperatorModeInfo {
    systemMode: SystemMode;
    enabledLayers: FeatureLayer[];
}

/**
 * Get effective layers for an operator.
 * If explicit enabledLayers are set, those are used.
 * Otherwise, falls back to the mode's default layers.
 */
export function getEffectiveLayers(info: OperatorModeInfo): FeatureLayer[] {
    if (info.enabledLayers && info.enabledLayers.length > 0) {
        return info.enabledLayers;
    }
    return MODE_DEFAULT_LAYERS[info.systemMode] ?? MODE_DEFAULT_LAYERS.MARKETPLACE_MODE;
}

/**
 * Check whether an operator has a specific feature layer enabled.
 */
export function hasLayer(info: OperatorModeInfo, layer: FeatureLayer): boolean {
    return getEffectiveLayers(info).includes(layer);
}

// ── DB Helpers ───────────────────────────────────────────────────────

/**
 * Fetch operator mode info from the database by operator ID.
 */
export async function getOperatorModeInfo(operatorId: string): Promise<OperatorModeInfo> {
    const user = await prisma.user.findUnique({
        where: { id: operatorId },
        select: { systemMode: true, enabledLayers: true },
    });

    if (!user) {
        // Fallback to marketplace if user not found
        return { systemMode: 'MARKETPLACE_MODE', enabledLayers: [] };
    }

    return {
        systemMode: user.systemMode,
        enabledLayers: user.enabledLayers,
    };
}

/**
 * Check if an operator has a specific layer, fetching from DB.
 */
export async function operatorHasLayer(operatorId: string, layer: FeatureLayer): Promise<boolean> {
    const info = await getOperatorModeInfo(operatorId);
    return hasLayer(info, layer);
}

/**
 * Determine if escrow should be applied for a given assignment.
 * Escrow is required only for FREELANCE assignments AND when the operator
 * has the ESCROW_ENABLED layer.
 */
export async function shouldApplyEscrow(
    operatorId: string,
    guideMode: string | null | undefined,
): Promise<boolean> {
    const assignmentType = getAssignmentType(guideMode);
    if (assignmentType === 'INHOUSE') return false;

    return operatorHasLayer(operatorId, 'ESCROW_ENABLED');
}

/**
 * Determine if commission should be applied for a given assignment.
 * Commission applies only for FREELANCE assignments AND when the operator
 * has the COMMISSION_ENABLED layer.
 */
export async function shouldApplyCommission(
    operatorId: string,
    guideMode: string | null | undefined,
): Promise<boolean> {
    const assignmentType = getAssignmentType(guideMode);
    if (assignmentType === 'INHOUSE') return false;

    return operatorHasLayer(operatorId, 'COMMISSION_ENABLED');
}
