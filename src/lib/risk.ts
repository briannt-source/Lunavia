/**
 * @deprecated — Use `@/domain/risk/RiskEngine` directly.
 *
 * This file re-exports from the consolidated RiskEngine for backward compatibility.
 * All risk computation, signal logging, and detection rules are now in RiskEngine.ts.
 */

export {
    logRiskSignal,
    checkWithdrawFrequency,
    checkAdminMassApproval,
    checkRapidTourCreation,
    checkSuspiciousAmount,
    type RiskSeverity,
    type RiskType,
} from '@/domain/risk/RiskEngine';
