/**
 * Backward-compatibility shim.
 * All escrow ledger functions are now in lib/escrow-ledger.ts.
 * This file re-exports everything so existing imports continue to work
 * during the migration period.
 */
export {
    getWalletBalance,
    getAvailableBalance,
    getWalletBreakdown,
    creditWallet,
    debitWallet,
    syncWalletBalances,
    EscrowLedgerType,
    LedgerDirection,
} from './escrow-ledger';

// Alias for backward compatibility: old code uses LedgerType
export { EscrowLedgerType as LedgerType } from '@prisma/client';
