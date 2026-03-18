"use client";

import { useState, useRef } from 'react';
import { UserPlan, PLAN_PRICING, PLAN_DURATIONS, PLAN_CONFIG, PlanDuration } from '@/lib/plans';
import toast from 'react-hot-toast';

interface PaymentRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan: UserPlan;
}

// Static payment instructions (to be customized)
const PAYMENT_INFO = {
    bankName: 'Vietcombank',
    accountNumber: '1234567890',
    accountName: 'LUNAVIA JSC',
    branch: 'Ho Chi Minh City',
    qrCodeUrl: '/images/payment-qr.png', // Placeholder
};

function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function PaymentRequestModal({ isOpen, onClose, currentPlan }: PaymentRequestModalProps) {
    const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'ELITE'>('PRO');
    const [duration, setDuration] = useState<PlanDuration>(30);
    const [step, setStep] = useState<'select' | 'pay' | 'upload'>('select');
    const [requestId, setRequestId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const pricing = PLAN_PRICING[selectedPlan];
    const amount = pricing?.[duration] ?? 0;

    async function handleCreateRequest() {
        try {
            const res = await fetch('/api/payments/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestedPlan: selectedPlan, durationDays: duration })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create request');
            }

            setRequestId(data.paymentRequest.id);
            setStep('pay');
            toast.success('Payment request created');
        } catch (err: any) {
            toast.error(err.message || 'Failed to create request');
        }
    }

    async function handleUploadProof(file: File) {
        if (!requestId) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('proof', file);

            const res = await fetch(`/api/payments/${requestId}/proof`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to upload proof');
            }

            setSubmitted(true);
            toast.success('Proof uploaded! Awaiting admin review.');
        } catch (err: any) {
            toast.error(err.message || 'Failed to upload proof');
        } finally {
            setUploading(false);
        }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            handleUploadProof(file);
        }
    }

    // Already submitted
    if (submitted) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <span className="text-3xl">✓</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Payment Submitted</h2>
                        <p className="mt-2 text-gray-600">
                            Your payment proof has been submitted. Our team will review and activate your plan within 24 hours.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Upgrade Your Plan</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>

                {step === 'select' && (
                    <div className="space-y-6">
                        {/* Plan Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan</label>
                            <div className="grid grid-cols-2 gap-3">
                                {(['PRO', 'ELITE'] as const).map((plan) => (
                                    <button
                                        key={plan}
                                        onClick={() => setSelectedPlan(plan)}
                                        disabled={currentPlan === plan}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${selectedPlan === plan
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            } ${currentPlan === plan ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className="font-semibold text-gray-900">
                                            {plan === 'PRO' ? '⭐' : '👑'} {PLAN_CONFIG[plan].displayName}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {PLAN_CONFIG[plan].description}
                                        </div>
                                        {currentPlan === plan && (
                                            <div className="text-xs text-indigo-600 mt-1">Current plan</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                            <div className="grid grid-cols-2 gap-3">
                                {PLAN_DURATIONS.map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setDuration(d)}
                                        className={`p-4 rounded-lg border-2 text-center transition-all ${duration === d
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="font-semibold text-gray-900">{d} Days</div>
                                        <div className="text-sm text-indigo-600 mt-1">
                                            {formatVND(PLAN_PRICING[selectedPlan]?.[d] ?? 0)}
                                        </div>
                                        {d === 90 && (
                                            <div className="text-xs text-green-600 mt-1">Save 11%</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total</span>
                                <span className="text-2xl font-bold text-gray-900">{formatVND(amount)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCreateRequest}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            Continue to Payment
                        </button>
                    </div>
                )}

                {step === 'pay' && (
                    <div className="space-y-6">
                        {/* Payment Instructions */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-amber-500 text-xl">⚠️</span>
                                <div>
                                    <p className="font-medium text-amber-800">Manual Payment Required</p>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Please transfer the exact amount below. Your plan will be activated within 24 hours after payment verification.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="text-center bg-indigo-50 rounded-lg p-6">
                            <div className="text-sm text-gray-600 mb-1">Amount to Pay</div>
                            <div className="text-3xl font-bold text-indigo-600">{formatVND(amount)}</div>
                            <div className="text-sm text-gray-500 mt-1">{PLAN_CONFIG[selectedPlan].displayName} - {duration} days</div>
                        </div>

                        {/* Bank Details */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900">Bank Transfer Details</h3>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Bank</span>
                                    <span className="font-medium text-gray-900">{PAYMENT_INFO.bankName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Account Number</span>
                                    <span className="font-mono font-medium text-gray-900">{PAYMENT_INFO.accountNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Account Name</span>
                                    <span className="font-medium text-gray-900">{PAYMENT_INFO.accountName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Transfer Note</span>
                                    <span className="font-mono text-sm text-gray-900">LUNAVIA-{requestId?.slice(0, 8)}</span>
                                </div>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-3">Or scan QR code</p>
                            <div className="inline-block bg-white p-4 rounded-lg border border-gray-200">
                                <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                                    QR Code
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep('upload')}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            I&apos;ve Made the Payment
                        </button>
                    </div>
                )}

                {step === 'upload' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                                <span className="text-3xl">📤</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Upload Payment Proof</h3>
                            <p className="text-sm text-gray-600 mt-2">
                                Please upload a screenshot or photo of your payment receipt.
                            </p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-8 text-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            {uploading ? (
                                <div className="text-gray-500">Uploading...</div>
                            ) : (
                                <>
                                    <div className="text-gray-400 text-4xl mb-2">📷</div>
                                    <div className="text-sm font-medium text-gray-700">Click to upload proof</div>
                                    <div className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP, or PDF (max 5MB)</div>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => setStep('pay')}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Back to Payment Details
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
