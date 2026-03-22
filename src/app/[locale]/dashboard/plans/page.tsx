'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

const PLANS = [
    {
        id: 'FREE',
        name: 'Free',
        price: '0₫',
        period: '/month',
        description: 'Get started with basic tour management.',
        features: {
            'Tours per month': '5',
            'Execution monitoring': '❌',
            'SOS Broadcast': '❌',
            'Guide analytics': 'Basic',
            'Portfolio visibility': 'Limited',
            'Team members': '1 guide',
            'External tracking links': '❌',
            'Priority support': '❌',
        },
        highlight: false,
        color: '#64748b',
    },
    {
        id: 'PRO',
        name: 'Pro',
        price: '499,000₫',
        period: '/month',
        description: 'For growing operators who need full control.',
        features: {
            'Tours per month': 'Unlimited',
            'Execution monitoring': '✅',
            'SOS Broadcast': '✅',
            'Guide analytics': 'Advanced',
            'Portfolio visibility': 'Full',
            'Team members': 'Up to 10',
            'External tracking links': '5 per tour',
            'Priority support': '✅',
        },
        highlight: true,
        color: '#6366f1',
    },
    {
        id: 'ENTERPRISE',
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For large operators with custom needs.',
        features: {
            'Tours per month': 'Unlimited',
            'Execution monitoring': '✅',
            'SOS Broadcast': '✅',
            'Guide analytics': 'Full + API',
            'Portfolio visibility': 'Full + Branded',
            'Team members': 'Unlimited',
            'External tracking links': 'Unlimited',
            'Priority support': '24/7 Dedicated',
        },
        highlight: false,
        color: '#0ea5e9',
    },
];

const featureKeys = Object.keys(PLANS[0].features);

export default function PlanComparisonPage() {
    const { data: session } = useSession();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const currentPlan = (session?.user as any)?.plan || 'FREE';

    async function handleUpgrade(planId: string) {
        if (planId === currentPlan) return;
        setSelectedPlan(planId);
    }

    async function submitUpgradeRequest() {
        if (!selectedPlan) return;
        setSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('plan', selectedPlan);
            if (proofFile) {
                formData.append('paymentProof', proofFile);
            }

            const res = await fetch('/api/subscription/upgrade-request', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit request');

            setSuccess(true);
            setSelectedPlan(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                        <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Upgrade Request Submitted</h2>
                    <p className="mt-2 text-sm text-gray-600">Your payment will be reviewed by our team. You&apos;ll be notified once approved.</p>
                    <button onClick={() => setSuccess(false)} className="mt-6 rounded-lg bg-lunavia-primary px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        Back to Plans
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
                    <p className="mt-2 text-gray-600">Scale your tour operations with the right plan.</p>
                    {currentPlan !== 'FREE' && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-lunavia-light text-[#2E8BC0] px-3 py-1 rounded-full text-sm font-medium">
                            Current plan: {currentPlan}
                        </div>
                    )}
                </div>

                {/* Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-2xl border-2 p-6 shadow-sm transition-all ${
                                plan.highlight ? 'border-indigo-500 shadow-indigo-100 scale-[1.02]' : 'border-gray-200'
                            } ${currentPlan === plan.id ? 'ring-2 ring-green-500' : ''}`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lunavia-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                                    MOST POPULAR
                                </div>
                            )}
                            {currentPlan === plan.id && (
                                <div className="absolute -top-3 right-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    CURRENT
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                            <div className="mt-2">
                                <span className="text-3xl font-bold" style={{ color: plan.color }}>{plan.price}</span>
                                <span className="text-gray-500 text-sm">{plan.period}</span>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">{plan.description}</p>

                            <ul className="mt-6 space-y-3">
                                {featureKeys.map((key) => {
                                    const val = (plan.features as any)[key];
                                    return (
                                        <li key={key} className="flex items-center gap-2 text-sm">
                                            <span className={`w-5 text-center ${val === '❌' ? 'text-gray-300' : 'text-green-500'}`}>
                                                {val === '❌' ? '—' : '✓'}
                                            </span>
                                            <span className="text-gray-600">{key}: <strong className="text-gray-900">{val}</strong></span>
                                        </li>
                                    );
                                })}
                            </ul>

                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={currentPlan === plan.id}
                                className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                                    currentPlan === plan.id
                                        ? 'bg-gray-100 text-gray-400 cursor-default'
                                        : plan.highlight
                                        ? 'bg-lunavia-primary text-white hover:bg-indigo-700'
                                        : 'bg-gray-900 text-white hover:bg-gray-800'
                                }`}
                            >
                                {currentPlan === plan.id ? 'Current Plan' : 'Upgrade'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Upgrade Request Modal */}
                {selectedPlan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                            <h3 className="text-lg font-bold text-gray-900">Upgrade to {selectedPlan}</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Submit your payment proof. Our team will review and activate your plan.
                            </p>

                            <div className="mt-4 p-4 bg-lunavia-light rounded-lg">
                                <p className="text-sm font-medium text-blue-800">Payment Instructions</p>
                                <p className="text-xs text-lunavia-primary mt-1">
                                    Transfer to: <strong>Lunavia JSC</strong><br />
                                    Bank: Vietcombank<br />
                                    Account: 1234 5678 9012<br />
                                    Note: UPGRADE-{selectedPlan}-{(session?.user as any)?.id?.slice(-6) || 'USER'}
                                </p>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Proof</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-lunavia-light file:text-[#2E8BC0] hover:file:bg-lunavia-muted/50"
                                />
                            </div>

                            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                            <div className="mt-6 flex gap-3">
                                <button onClick={() => setSelectedPlan(null)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button
                                    onClick={submitUpgradeRequest}
                                    disabled={submitting}
                                    className="flex-1 rounded-lg bg-lunavia-primary px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
