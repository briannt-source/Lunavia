'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { PLAN_PRICING, type PlanDuration } from '@/lib/plans';
import DocumentUpload from '@/components/DocumentUpload';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DURATION_OPTIONS: { days: PlanDuration; label: string; short: string }[] = [
    { days: 30, label: 'Monthly', short: 'mo' },
    { days: 90, label: 'Quarterly', short: '3 mo' },
    { days: 365, label: 'Annual', short: 'yr' },
];

function getSavingsPercent(plan: string, duration: PlanDuration): number | null {
    const pricing = PLAN_PRICING[plan as keyof typeof PLAN_PRICING];
    if (!pricing || duration === 30) return null;
    const monthlyTotal = pricing[30] * (duration === 90 ? 3 : 12);
    const actualPrice = pricing[duration];
    if (!monthlyTotal || !actualPrice) return null;
    const savings = Math.round(((monthlyTotal - actualPrice) / monthlyTotal) * 100);
    return savings > 0 ? savings : null;
}

function getPriceForDuration(plan: string, duration: PlanDuration): number {
    const pricing = PLAN_PRICING[plan as keyof typeof PLAN_PRICING];
    if (!pricing) return 0;
    return pricing[duration] || 0;
}

// Plans aligned with pricing page (/pricing)
const PLANS = {
    operator: [
        {
            name: 'FREE', price: 0, label: 'Free',
            features: [
                '5 tours per month',
                '2 guides on your team',
                'Guide marketplace access',
                'Escrow-protected payments',
                'Tour lifecycle management',
                'Incident reporting',
                '5% commission per transaction',
            ],
            highlight: false
        },
        {
            name: 'PRO', price: 399_000, label: 'Pro',
            features: [
                '20 tours per month',
                '10 guides on your team',
                'Everything in Free',
                'SOS guide broadcast',
                'Live command center',
                'Advanced search filters',
                'Analytics & insights',
                'Portfolio & social sharing',
                'Multi-guide teams',
                'Voucher system',
                '3% commission per transaction',
            ],
            highlight: true
        },
        {
            name: 'ELITE', price: 799_000, label: 'Elite',
            features: [
                '50 tours per month',
                '30 guides on your team',
                'Everything in Pro',
                'Priority boost & visibility',
                'External agency tracking',
                'Priority support',
                '1.5% commission per transaction',
            ],
            highlight: false
        },
    ],
    guide: [
        {
            name: 'FREE', price: 0, label: 'Free',
            features: [
                '10 tour applications per month',
                'Apply to open tour requests',
                'Accept direct invitations',
                'Payout tracking',
                'Public profile & reviews',
                '5% platform service fee',
            ],
            highlight: false
        },
        {
            name: 'GUIDE_PRO', price: 149_000, label: 'Guide Pro',
            features: [
                'Unlimited tour applications',
                'Everything in Free',
                '1 penalty-free cancellation per quarter',
                'Priority matching in search',
                'Verified Pro badge',
                'Advanced analytics',
                '2% platform service fee (reduced)',
            ],
            highlight: true
        },
    ]
};

export default function SubscriptionPage() {
    const { data: session } = useSession();
    const { data, error, mutate } = useSWR('/api/account/subscription', fetcher);
    const [loadingUpgrade, setLoadingUpgrade] = useState<string | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<PlanDuration>(30);

    const [voucherCode, setVoucherCode] = useState('');
    const [redeemingVoucher, setRedeemingVoucher] = useState(false);
    const [voucherMsg, setVoucherMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [cancelingRequest, setCancelingRequest] = useState(false);
    const [uploadingProof, setUploadingProof] = useState(false);
    const [showProofUpload, setShowProofUpload] = useState(false);

    const handleRedeemVoucher = async () => {
        if (!voucherCode.trim()) return;
        setRedeemingVoucher(true);
        setVoucherMsg(null);
        try {
            const res = await fetch('/api/vouchers/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: voucherCode.trim() }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setVoucherMsg({ type: 'success', text: data.message || `Upgraded to ${data.plan}!` });
                setVoucherCode('');
                mutate(); // Refresh subscription data
            } else {
                setVoucherMsg({ type: 'error', text: data.error || 'Failed to redeem voucher' });
            }
        } catch {
            setVoucherMsg({ type: 'error', text: 'Network error — please try again' });
        } finally {
            setRedeemingVoucher(false);
        }
    };

    const handleCancelRequest = async () => {
        if (!pendingRequest) return;
        if (!confirm('Are you sure you want to cancel this pending upgrade request?')) return;
        setCancelingRequest(true);
        try {
            const res = await fetch(`/api/subscription/request/${pendingRequest.id}/cancel`, { method: 'POST' });
            if (!res.ok) throw new Error((await res.json()).error || 'Failed to cancel');
            mutate();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCancelingRequest(false);
        }
    };

    if (error) return (
        <div className="flex h-64 items-center justify-center">
            <div className="text-red-500 bg-red-50 px-4 py-2 rounded-xl text-sm font-semibold">Failed to load subscription data.</div>
        </div>
    );
    if (!data) return (
        <div className="flex h-64 items-center justify-center">
            <div className="animate-spin h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full" />
        </div>
    );

    const payload = data?.data ?? { currentPlan: 'FREE', pendingRequest: null, history: [] };
    const { currentPlan, pendingRequest, history } = payload;
    const role = (session?.user?.role as string)?.toLowerCase().includes('guide') ? 'guide' : 'operator';
    const availablePlans = PLANS[role as keyof typeof PLANS] || PLANS.operator;

    const currentPlanIndex = availablePlans.findIndex((p: any) => p.name === currentPlan?.toUpperCase());

    const handleUpgrade = async (plan: any) => {
        const price = getPriceForDuration(plan.name, selectedDuration);
        const durationLabel = DURATION_OPTIONS.find(d => d.days === selectedDuration)?.label || 'Monthly';
        if (!confirm(`Upgrade to ${plan.label} (${durationLabel}) for ₫${price.toLocaleString('vi-VN')}?`)) return;

        setLoadingUpgrade(plan.name);
        try {
            const formData = new FormData();
            formData.append('plan', plan.name);
            formData.append('durationDays', String(selectedDuration));
            formData.append('paymentMethod', 'BANK_TRANSFER');

            const res = await fetch('/api/subscription/upgrade-request', {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();
            if (!result.success) throw new Error(result.error);

            const bankInfo = result.data?.bankInstructions;
            if (bankInfo) {
                alert(
                    `Upgrade request submitted!\n\n` +
                    `Please transfer ₫${bankInfo.amount.toLocaleString('vi-VN')} to:\n` +
                    `Bank: ${bankInfo.bankName}\n` +
                    `Account: ${bankInfo.accountNumber}\n` +
                    `Name: ${bankInfo.accountName}\n` +
                    `Content: ${bankInfo.transferContent}\n\n` +
                    `Our team will verify your payment.`
                );
            } else {
                alert('Upgrade request submitted successfully!');
            }
            mutate();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoadingUpgrade(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 py-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Plans & Billing</h1>
                <p className="mt-3 text-slate-500">
                    Choose the plan that fits your needs. Scale operations and unlock premium limits.
                    Currently active on the <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{currentPlan}</span> plan.
                </p>
            </div>

            {/* Duration Toggle */}
            <div className="flex justify-center">
                <div className="inline-flex bg-slate-100 rounded-2xl p-1.5 gap-1">
                    {DURATION_OPTIONS.map(opt => (
                        <button
                            key={opt.days}
                            onClick={() => setSelectedDuration(opt.days)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                selectedDuration === opt.days
                                    ? 'bg-white text-slate-900 shadow-md'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {opt.label}
                            {opt.days === 365 && <span className="ml-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">BEST VALUE</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Request Status Alerts */}
            {pendingRequest && (
                <div className="max-w-3xl mx-auto mb-8">
                    {pendingRequest.status === 'PENDING' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start sm:items-center gap-4 shadow-sm">
                            <span className="text-2xl pt-1 sm:pt-0">⏳</span>
                            <div className="flex-1">
                                <h3 className="font-bold text-amber-900">Upgrade pending review</h3>
                                <p className="text-sm text-amber-700 mt-1">Your request to upgrade to <strong>{pendingRequest.requestedPlan}</strong> on {new Date(pendingRequest.createdAt).toLocaleDateString()} is being processed by our team.</p>
                                
                                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex-1 bg-amber-100/50 p-3 rounded-lg border border-amber-200/50 text-xs text-amber-800">
                                        <div className="font-semibold mb-1">Payment Verification</div>
                                        <div>Please contact Lunavia Customer Service directly and provide your transfer receipt to complete the verification.</div>
                                    </div>
                                    <button 
                                        disabled={cancelingRequest}
                                        onClick={handleCancelRequest}
                                        className="shrink-0 px-4 py-2 h-fit bg-white text-slate-700 hover:text-red-600 border border-slate-200 text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        {cancelingRequest ? 'Canceling...' : 'Cancel Request'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {pendingRequest.status === 'REJECTED' && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-start sm:items-center gap-4 mb-3">
                                <span className="text-2xl pt-1 sm:pt-0">❌</span>
                                <div>
                                    <h3 className="font-bold text-red-900">Upgrade request declined</h3>
                                    <p className="text-sm text-red-700 mt-1">Your request to upgrade to <strong>{pendingRequest.requestedPlan}</strong> was not approved.</p>
                                </div>
                            </div>
                            {pendingRequest.rejectionReason && (
                                <div className="ml-10 text-sm italic text-red-800 bg-red-100/50 p-3 rounded-xl border border-red-100">
                                    "{pendingRequest.rejectionReason}"
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Pricing Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4">
                {availablePlans.map((plan: any, index: number) => {
                    const isCurrent = plan.name === currentPlan?.toUpperCase();
                    const isDowngradeOrSame = index <= currentPlanIndex;
                    const isPending = pendingRequest?.status === 'PENDING' && pendingRequest?.requestedPlan === plan.name;
                    const hasPendingBlock = pendingRequest?.status === 'PENDING';
                    const canUpgrade = !isCurrent && !isDowngradeOrSame && !hasPendingBlock;

                    return (
                        <div key={plan.name} className={`relative flex flex-col rounded-3xl p-8 transition-all ${
                            isCurrent
                                ? 'bg-indigo-50 border-2 border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg scale-[1.02] z-10'
                                : plan.highlight
                                    ? 'bg-slate-900 border border-slate-800 text-white shadow-xl scale-[1.02] z-10'
                                    : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'
                        }`}>
                            {isCurrent && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                                    Current Plan
                                </div>
                            )}
                            {plan.highlight && !isCurrent && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className={`text-xl font-bold ${plan.highlight && !isCurrent ? 'text-white' : 'text-slate-900'} mb-2`}>{plan.label}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-4xl font-black tracking-tight ${plan.highlight && !isCurrent ? 'text-white' : 'text-slate-900'}`}>
                                        {plan.price === 0 ? 'Free' : `₫${getPriceForDuration(plan.name, selectedDuration).toLocaleString('vi-VN')}`}
                                    </span>
                                    {plan.price > 0 && (
                                        <span className={`text-sm font-medium ${plan.highlight && !isCurrent ? 'text-slate-400' : 'text-slate-500'}`}>
                                            /{DURATION_OPTIONS.find(d => d.days === selectedDuration)?.short || 'mo'}
                                        </span>
                                    )}
                                </div>
                                {plan.price > 0 && getSavingsPercent(plan.name, selectedDuration) && (
                                    <div className="mt-2">
                                        <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                            plan.highlight && !isCurrent ? 'bg-emerald-400/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            Save {getSavingsPercent(plan.name, selectedDuration)}% vs monthly
                                        </span>
                                    </div>
                                )}
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <svg className={`w-5 h-5 shrink-0 mt-0.5 ${plan.highlight && !isCurrent ? 'text-emerald-400' : 'text-indigo-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className={`text-sm ${plan.highlight && !isCurrent ? 'text-slate-300' : 'text-slate-600'} leading-tight`}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                disabled={!canUpgrade || !!loadingUpgrade}
                                onClick={() => handleUpgrade(plan)}
                                className={`w-full py-3.5 px-4 rounded-xl font-bold transition-all flex justify-center items-center gap-2
                                    ${isCurrent
                                        ? 'bg-indigo-100 text-indigo-700 cursor-default'
                                        : canUpgrade
                                            ? plan.highlight
                                                ? 'bg-white text-slate-900 hover:bg-gray-100 shadow-md active:scale-95'
                                                : 'bg-slate-900 text-white hover:bg-black shadow-md active:scale-95'
                                            : plan.highlight
                                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {loadingUpgrade === plan.name && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                                {isCurrent ? 'Your Current Plan' :
                                    isPending ? 'Approval Pending' :
                                        isDowngradeOrSame ? 'Not Available' :
                                            loadingUpgrade === plan.name ? 'Processing...' : `Upgrade to ${plan.label}`}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* ── Voucher Redeem ── */}
            <div className="pt-12 max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center text-lg">🎟️</span>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Have a Voucher?</h3>
                            <p className="text-xs text-slate-500">Enter your voucher code to activate a plan upgrade.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={voucherCode}
                            onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && handleRedeemVoucher()}
                            placeholder="Enter voucher code"
                            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase tracking-wider focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
                            disabled={redeemingVoucher}
                        />
                        <button
                            onClick={handleRedeemVoucher}
                            disabled={redeemingVoucher || !voucherCode.trim()}
                            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50"
                        >
                            {redeemingVoucher ? 'Redeeming...' : 'Redeem'}
                        </button>
                    </div>
                    {voucherMsg && (
                        <p className={`mt-3 text-sm font-medium ${voucherMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {voucherMsg.type === 'success' ? '✅ ' : '❌ '}{voucherMsg.text}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Billing History ── */}
            <div className="pt-12 max-w-4xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Billing & Request History</h2>
                    <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">Download Invoices</a>
                </div>
                
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase font-bold text-slate-500 bg-slate-50/80 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap">Date</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Action</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {history?.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl mb-3">📄</div>
                                            <div className="text-slate-500 font-medium">No previous upgrade requests found</div>
                                        </td>
                                    </tr>
                                ) : (
                                    history?.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5 whitespace-nowrap text-slate-600">
                                                {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-semibold text-slate-900">Upgrade to {item.requestedPlan}</div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap font-medium text-slate-900">
                                                ₫{Number(item.price).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase
                                                    ${item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200/50' :
                                                        item.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200/50' :
                                                            'bg-amber-100 text-amber-700 border border-amber-200/50'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
