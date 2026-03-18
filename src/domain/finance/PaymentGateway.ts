/**
 * PaymentGateway — Adapter Interface for Payment Processing
 *
 * Supports multiple payment methods:
 *   - BANK_TRANSFER: manual proof → admin approve (active now)
 *   - ONEPAY: OnePay gateway (connect later)
 *   - ZALOPAY: ZaloPay gateway (connect later)
 *   - STRIPE: Stripe international (connect later)
 *
 * Each gateway implements the same interface so switching is seamless.
 */

// ── Types ────────────────────────────────────────────────────────────
import { prisma } from '@/lib/prisma';

export type PaymentMethod = 'BANK_TRANSFER' | 'ONEPAY' | 'ZALOPAY' | 'STRIPE';

export interface PaymentInitiation {
    /** Unique payment reference for this transaction */
    paymentRef: string;
    /** Payment method used */
    method: PaymentMethod;
    /** If redirect-based, URL to redirect user to */
    redirectUrl?: string;
    /** If bank transfer, display these instructions */
    bankInstructions?: BankTransferInstructions;
    /** Whether this payment requires manual admin approval */
    requiresManualApproval: boolean;
}

export interface BankTransferInstructions {
    bankName: string;
    accountNumber: string;
    accountName: string;
    transferContent: string;
    amount: number;
    currency: string;
}

export interface PaymentVerification {
    success: boolean;
    transactionId?: string;
    amount?: number;
    paidAt?: Date;
    error?: string;
}

export interface PaymentGatewayAdapter {
    readonly method: PaymentMethod;
    readonly displayName: string;
    readonly isActive: boolean;

    /** Initiate a payment — returns instructions or redirect URL */
    initiate(params: {
        amount: number;
        userId: string;
        description: string;
        purpose?: 'ESCROW' | 'REVENUE';
        metadata?: Record<string, any>;
    }): Promise<PaymentInitiation>;

    /** Verify a payment callback/webhook (for automated gateways) */
    verifyCallback?(payload: any): Promise<PaymentVerification>;
}

// ── Bank Transfer Gateway (Active) ───────────────────────────────────

export class BankTransferGateway implements PaymentGatewayAdapter {
    readonly method: PaymentMethod = 'BANK_TRANSFER';
    readonly displayName = 'Bank Transfer';
    readonly isActive = true;

    // Lunavia's bank account info
    private readonly BANK_INFO = {
        bankName: 'Vietcombank',
        accountNumber: '1234567890',  // TODO: Replace with real account
        accountName: 'LUNAVIA TECHNOLOGY CO., LTD',
        currency: 'VND',
    };

    async initiate(params: {
        amount: number;
        userId: string;
        description: string;
        purpose?: 'ESCROW' | 'REVENUE';
        metadata?: Record<string, any>;
    }): Promise<PaymentInitiation> {
        // Generate unique transfer content for tracking
        const paymentRef = `LNV-${Date.now().toString(36).toUpperCase()}-${params.userId.slice(-4).toUpperCase()}`;

        const configKey = params.purpose === 'REVENUE' ? 'REVENUE_BANK' : 'ESCROW_BANK';
        let bankInfoForTransfer = this.BANK_INFO; // default fallback
        try {
            const configRecord = await prisma.systemConfig.findUnique({ where: { key: configKey } });
            if (configRecord && configRecord.value) {
                const parsed = JSON.parse(configRecord.value);
                if (parsed.bankName && parsed.accountNumber && parsed.accountName) {
                    bankInfoForTransfer = {
                        ...bankInfoForTransfer,
                        bankName: parsed.bankName,
                        accountNumber: parsed.accountNumber,
                        accountName: parsed.accountName,
                    };
                }
            }
        } catch (e) {
            console.error('[BankTransferGateway] failed to load bank config:', e);
        }

        return {
            paymentRef,
            method: 'BANK_TRANSFER',
            requiresManualApproval: true,
            bankInstructions: {
                ...bankInfoForTransfer,
                amount: params.amount,
                transferContent: paymentRef,
            },
        };
    }
}

// ── OnePay Gateway Stub (Connect Later) ──────────────────────────────

export class OnePayGateway implements PaymentGatewayAdapter {
    readonly method: PaymentMethod = 'ONEPAY';
    readonly displayName = 'OnePay (Visa/Master/ATM)';
    readonly isActive = false; // Not connected yet

    async initiate(params: {
        amount: number;
        userId: string;
        description: string;
        purpose?: 'ESCROW' | 'REVENUE';
        metadata?: Record<string, any>;
    }): Promise<PaymentInitiation> {
        throw new Error('OnePay gateway not connected. Please configure ONEPAY_MERCHANT_ID and ONEPAY_SECRET in environment variables.');
        // TODO: When merchant account ready:
        // 1. Set ONEPAY_MERCHANT_ID and ONEPAY_SECRET in .env
        // 2. Build signed request per OnePay docs
        // 3. Return { redirectUrl: 'https://mtf.onepay.vn/...' }
    }

    async verifyCallback(payload: any): Promise<PaymentVerification> {
        throw new Error('OnePay callback verification not implemented');
        // TODO: Verify vpc_SecureHash, check amount matches, return success/fail
    }
}

// ── ZaloPay Gateway Stub (Connect Later) ─────────────────────────────

export class ZaloPayGateway implements PaymentGatewayAdapter {
    readonly method: PaymentMethod = 'ZALOPAY';
    readonly displayName = 'ZaloPay';
    readonly isActive = false;

    async initiate(params: {
        amount: number;
        userId: string;
        description: string;
        purpose?: 'ESCROW' | 'REVENUE';
        metadata?: Record<string, any>;
    }): Promise<PaymentInitiation> {
        throw new Error('ZaloPay gateway not connected. Please configure ZALOPAY_APP_ID and ZALOPAY_KEY in environment variables.');
        // TODO: When merchant account ready:
        // 1. Set ZALOPAY_APP_ID, ZALOPAY_KEY1, ZALOPAY_KEY2 in .env
        // 2. Create order via ZaloPay API
        // 3. Return { redirectUrl: 'https://...' }
    }

    async verifyCallback(payload: any): Promise<PaymentVerification> {
        throw new Error('ZaloPay callback verification not implemented');
    }
}

// ── Stripe Gateway Stub (Connect Later) ──────────────────────────────

export class StripeGateway implements PaymentGatewayAdapter {
    readonly method: PaymentMethod = 'STRIPE';
    readonly displayName = 'Stripe (International Cards)';
    readonly isActive = false;

    async initiate(params: {
        amount: number;
        userId: string;
        description: string;
        purpose?: 'ESCROW' | 'REVENUE';
        metadata?: Record<string, any>;
    }): Promise<PaymentInitiation> {
        throw new Error('Stripe gateway not connected. Please configure STRIPE_SECRET_KEY in environment variables.');
        // TODO: When Stripe account ready:
        // 1. npm install stripe
        // 2. Create Checkout Session
        // 3. Return { redirectUrl: session.url }
    }

    async verifyCallback(payload: any): Promise<PaymentVerification> {
        throw new Error('Stripe webhook verification not implemented');
    }
}

// ── Gateway Registry ─────────────────────────────────────────────────

const GATEWAYS: Record<PaymentMethod, PaymentGatewayAdapter> = {
    BANK_TRANSFER: new BankTransferGateway(),
    ONEPAY: new OnePayGateway(),
    ZALOPAY: new ZaloPayGateway(),
    STRIPE: new StripeGateway(),
};

export function getGateway(method: PaymentMethod): PaymentGatewayAdapter {
    const gw = GATEWAYS[method];
    if (!gw) throw new Error(`Unknown payment method: ${method}`);
    if (!gw.isActive) throw new Error(`${gw.displayName} is not yet connected. Please use Bank Transfer.`);
    return gw;
}

export function getActiveGateways(): PaymentGatewayAdapter[] {
    return Object.values(GATEWAYS).filter(gw => gw.isActive);
}

export function getAllGateways(): { method: PaymentMethod; displayName: string; isActive: boolean }[] {
    return Object.values(GATEWAYS).map(gw => ({
        method: gw.method,
        displayName: gw.displayName,
        isActive: gw.isActive,
    }));
}
