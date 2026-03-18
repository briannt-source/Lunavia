import { prisma } from './prisma';

/**
 * Immutable Audit Log — Regulator Ready
 *
 * RULES:
 * - NEVER update an AuditLog record
 * - NEVER delete an AuditLog record
 * - All financial and admin-critical actions MUST be logged
 */

// ============================================
// FINANCIAL ACTIONS (require enhanced audit)
// ============================================

export const FINANCIAL_ACTIONS = [
  'TOPUP_APPROVED',
  'TOPUP_REJECTED',
  'WITHDRAWAL_APPROVED',
  'WITHDRAWAL_REJECTED',
  'ESCROW_HELD',
  'ESCROW_RELEASED',
  'ESCROW_REFUNDED',
  'WALLET_CREATED',
  'SYSTEM_ADJUSTMENT',
] as const;

export const ADMIN_CRITICAL_ACTIONS = [
  'ROLE_ASSIGNED',
  'USER_SUSPENDED',
  'USER_BANNED',
  'VERIFICATION_APPROVED',
  'VERIFICATION_REJECTED',
  'PLAN_CHANGED',
  'PLAN_PRICING_UPDATED',
  'STEP_UP_VERIFIED',
  'STEP_UP_FAILED',
] as const;

// ============================================
// CORE LOGGING FUNCTION
// ============================================

export async function logAudit(params: {
  userId?: string;
  actorRole?: string;
  action: string;
  targetId?: string;
  targetType: string;
  meta?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  const { userId, actorRole, action, targetId, targetType, meta, ipAddress, userAgent } = params;
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || 'SYSTEM',
        actorRole: actorRole || null,
        action,
        targetId,
        targetType,
        meta: meta ? JSON.stringify(meta) : null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  } catch (e) {
    console.error('Failed to write audit log', e);
  }
}

/**
 * Enhanced audit for financial operations.
 * Same as logAudit but enforces actorRole presence.
 */
export async function logFinancialAudit(params: {
  userId: string;
  actorRole: string;
  action: string;
  targetId?: string;
  targetType: string;
  meta?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  return logAudit(params);
}

// ============================================
// DOMAIN VIOLATION LOGGING
// ============================================

/**
 * Log a CRITICAL domain violation when an entity is accessed
 * via the wrong admin domain route.
 */
export async function logDomainViolation(params: {
  actorId: string;
  expectedDomain: string;
  entityId: string;
  message: string;
}) {
  return logAudit({
    userId: params.actorId,
    action: 'DOMAIN_VIOLATION',
    targetId: params.entityId,
    targetType: 'DomainGuard',
    meta: {
      severity: 'CRITICAL',
      expectedDomain: params.expectedDomain,
      entityId: params.entityId,
      message: params.message,
    },
  });
}
