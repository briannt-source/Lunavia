import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';
import { logAudit } from '@/lib/audit';

/**
 * Step-Up Verification Layer
 *
 * For sensitive/financial actions, require the user to re-confirm
 * their password server-side before execution.
 *
 * PROTECTED ACTIONS:
 * - WALLET_WITHDRAW_APPROVE
 * - ESCROW_RELEASE
 * - ROLE_ASSIGN
 * - USER_SUSPEND
 * - PLAN_PRICING_UPDATE
 */

export const STEP_UP_ACTIONS = [
    'WALLET_WITHDRAW_APPROVE',
    'ESCROW_RELEASE',
    'ROLE_ASSIGN',
    'USER_SUSPEND',
    'PLAN_PRICING_UPDATE',
] as const;

export type StepUpAction = typeof STEP_UP_ACTIONS[number];

/**
 * Validate step-up password confirmation.
 * Throws if unauthenticated, password missing, or password incorrect.
 *
 * @param confirmPassword - The password provided by the admin for re-confirmation
 * @param action - The sensitive action being performed (for audit)
 * @returns The authenticated session
 */
export async function requireStepUp(confirmPassword: string, action: StepUpAction) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        throw new Error('UNAUTHENTICATED');
    }

    if (!confirmPassword || typeof confirmPassword !== 'string') {
        throw new Error('STEP_UP_PASSWORD_REQUIRED');
    }

    // Fetch the user's password hash from DB
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
        throw new Error('STEP_UP_FAILED');
    }

    // Validate password
    const valid = await compare(confirmPassword, user.passwordHash);

    if (!valid) {
        // Log failed step-up attempt
        await logAudit({
            userId: session.user.id,
            actorRole: session.user.role,
            action: 'STEP_UP_FAILED',
            targetType: 'StepUp',
            meta: { attemptedAction: action },
        });

        throw new Error('STEP_UP_FAILED');
    }

    // Log successful step-up
    await logAudit({
        userId: session.user.id,
        actorRole: session.user.role,
        action: 'STEP_UP_VERIFIED',
        targetType: 'StepUp',
        meta: { verifiedAction: action },
    });

    return session;
}
