'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

type ProductTab = 'marketplace' | 'operations';
type BillingPeriod = 'monthly' | 'quarterly' | 'annual';

function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount);
}

const BILLING_MULTIPLIERS: Record<BillingPeriod, { label: string; months: number }> = {
    monthly: { label: '/ month', months: 1 },
    quarterly: { label: '/ quarter', months: 3 },
    annual: { label: '/ year', months: 12 },
};

interface PlanCard {
    name: string;
    price: Record<BillingPeriod, number>;
    desc: string;
    cta: string;
    popular?: boolean;
    enterprise?: boolean;
    commission: string;
    limits: { tours: string; team: string; guidesPerTour: string };
    features: string[];
    excluded?: string[];
}

const MARKETPLACE_PLANS: PlanCard[] = [
    {
        name: 'Free',
        price: { monthly: 0, quarterly: 0, annual: 0 },
        desc: 'Get started with basic marketplace access.',
        cta: 'Start Free',
        commission: '5%',
        limits: { tours: '10 / month', team: '5 guides', guidesPerTour: '2' },
        features: [
            'Guide marketplace access',
            'Escrow-protected payments',
            'Tour lifecycle management',
            'Incident reporting',
            'Payment disputes',
        ],
        excluded: [
            'SOS broadcast',
            'Command center',
            'Advanced filters',
            'Analytics & insights',
            'Portfolio & sharing',
            'Voucher system',
            'Priority boost',
        ],
    },
    {
        name: 'Pro',
        price: { monthly: 1_299_000, quarterly: 3_599_000, annual: 12_999_000 },
        desc: 'Scale your operations with advanced tools.',
        cta: 'Upgrade to Pro',
        popular: true,
        commission: '3%',
        limits: { tours: '50 / month', team: '20 guides', guidesPerTour: '5' },
        features: [
            'Everything in Free',
            'SOS guide broadcast',
            'Live command center',
            'Advanced search filters',
            'Analytics & insights',
            'Portfolio & social sharing',
            'Multi-guide teams',
            'Voucher system',
            'Full tour segments',
        ],
        excluded: ['Priority boost', 'External tracking'],
    },
    {
        name: 'Elite',
        price: { monthly: 3_499_000, quarterly: 9_999_000, annual: 34_999_000 },
        desc: 'For high-volume operators needing full power.',
        cta: 'Go Elite',
        commission: '1.5%',
        limits: { tours: 'Unlimited', team: '100 guides', guidesPerTour: '10' },
        features: [
            'Everything in Pro',
            'Priority boost & visibility',
            'External agency tracking',
            'Lowest commission rate',
            'Priority support',
        ],
    },
    {
        name: 'Enterprise',
        price: { monthly: 0, quarterly: 0, annual: 0 },
        desc: 'Custom solution for large-scale operations.',
        cta: 'Contact Sales',
        enterprise: true,
        commission: 'Custom',
        limits: { tours: 'Custom', team: 'Custom', guidesPerTour: 'Custom' },
        features: [
            'Everything in Elite',
            'Custom tour & team limits',
            'Negotiated commission',
            'Dedicated account manager',
            'SLA guarantee',
            'Custom integrations',
        ],
    },
];

const OPERATIONS_PLANS: PlanCard[] = [
    {
        name: 'Ops Starter',
        price: { monthly: 899_000, quarterly: 2_499_000, annual: 8_999_000 },
        desc: 'Internal team management for small operators.',
        cta: 'Get Started',
        commission: '0%',
        limits: { tours: '30 / month', team: '15 guides', guidesPerTour: '5' },
        features: [
            'Tour creation & management',
            'Live command center',
            'Team management & invites',
            'Multi-guide per tour',
            'Full tour segments',
            'Incident reporting',
        ],
        excluded: [
            'No marketplace (closed ecosystem)',
            'Analytics & insights',
            'External tracking',
            'Voucher system',
        ],
    },
    {
        name: 'Ops Business',
        price: { monthly: 2_499_000, quarterly: 6_999_000, annual: 24_999_000 },
        desc: 'Full operations suite for established companies.',
        cta: 'Upgrade',
        popular: true,
        commission: '0%',
        limits: { tours: '100 / month', team: '50 guides', guidesPerTour: '10' },
        features: [
            'Everything in Ops Starter',
            'Analytics & insights',
            'External agency tracking',
            'Voucher system',
            'Portfolio & sharing',
            'Priority support',
        ],
    },
    {
        name: 'Enterprise',
        price: { monthly: 0, quarterly: 0, annual: 0 },
        desc: 'Custom solution with optional marketplace.',
        cta: 'Contact Sales',
        enterprise: true,
        commission: 'Custom',
        limits: { tours: 'Custom', team: 'Custom', guidesPerTour: 'Custom' },
        features: [
            'Everything in Ops Business',
            'Optional marketplace access',
            'Custom limits',
            'Dedicated account manager',
            'SLA guarantee',
            'Custom integrations',
        ],
    },
];

const COMPARISON_FEATURES = [
    { key: 'Subscription', free: 'Free', pro: '₫1.3M/mo', elite: '₫3.5M/mo', enterprise: 'Custom' },
    { key: 'Commission', free: '5%', pro: '3%', elite: '1.5%', enterprise: 'Custom' },
    { key: 'Tours / month', free: '10', pro: '50', elite: 'Unlimited', enterprise: 'Custom' },
    { key: 'Team size', free: '5', pro: '20', elite: '100', enterprise: 'Custom' },
    { key: 'Guides per tour', free: '2', pro: '5', elite: '10', enterprise: 'Custom' },
    { key: 'Marketplace', free: true, pro: true, elite: true, enterprise: true },
    { key: 'SOS Broadcast', free: false, pro: true, elite: true, enterprise: true },
    { key: 'Command Center', free: false, pro: true, elite: true, enterprise: true },
    { key: 'Advanced Filters', free: false, pro: true, elite: true, enterprise: true },
    { key: 'Analytics', free: false, pro: true, elite: true, enterprise: true },
    { key: 'Portfolio', free: false, pro: true, elite: true, enterprise: true },
    { key: 'External Tracking', free: false, pro: false, elite: true, enterprise: true },
    { key: 'Priority Boost', free: false, pro: false, elite: true, enterprise: true },
    { key: 'Vouchers', free: false, pro: true, elite: true, enterprise: true },
];

export default function PricingPage() {
    const t = useTranslations('MarketingPricing');
    const { data: session, status } = useSession();
    const [tab, setTab] = useState<ProductTab>('marketplace');
    const [billing, setBilling] = useState<BillingPeriod>('monthly');
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [showPromo, setShowPromo] = useState(true);

    const translatedMarketplacePlans: PlanCard[] = MARKETPLACE_PLANS.map(plan => {
        const key = plan.name === 'Free' ? 'Free' : plan.name === 'Pro' ? 'Pro' : plan.name === 'Elite' ? 'Elite' : 'Enterprise';
        return {
            ...plan,
            name: t(`plans.Marketplace.${key}.name`),
            desc: t(`plans.Marketplace.${key}.desc`),
            cta: t(`plans.Marketplace.${key}.cta`),
            limits: {
                tours: t(`plans.Marketplace.${key}.limits.tours`),
                team: t(`plans.Marketplace.${key}.limits.team`),
                guidesPerTour: t(`plans.Marketplace.${key}.limits.guidesPerTour`)
            },
            features: t.raw(`plans.Marketplace.${key}.features`),
            excluded: t.raw(`plans.Marketplace.${key}.excluded`) || []
        };
    });

    const translatedOperationsPlans: PlanCard[] = OPERATIONS_PLANS.map(plan => {
        const key = plan.name === 'Ops Starter' ? 'Starter' : plan.name === 'Ops Business' ? 'Business' : 'Enterprise';
        return {
            ...plan,
            name: t(`plans.Operations.${key}.name`),
            desc: t(`plans.Operations.${key}.desc`),
            cta: t(`plans.Operations.${key}.cta`),
            limits: {
                tours: t(`plans.Operations.${key}.limits.tours`),
                team: t(`plans.Operations.${key}.limits.team`),
                guidesPerTour: t(`plans.Operations.${key}.limits.guidesPerTour`)
            },
            features: t.raw(`plans.Operations.${key}.features`),
            excluded: t.raw(`plans.Operations.${key}.excluded`) || []
        };
    });

    const plans = tab === 'marketplace' ? translatedMarketplacePlans : translatedOperationsPlans;
    const expandedPlan = plans.find(p => p.name === selectedPlan) || (selectedPlan ? (tab === 'marketplace' ? MARKETPLACE_PLANS : OPERATIONS_PLANS).find(p => p.name === selectedPlan) : undefined);

    const translatedComparisonFeatures = COMPARISON_FEATURES.map(f => ({
        ...f,
        key: t(`compare.features.${f.key}`) || f.key,
        pro: f.pro === '₫1.3M/mo' ? t('compare.values.Pro_Subs') : f.pro,
        elite: f.elite === '₫3.5M/mo' ? t('compare.values.Elite_Subs') : f.elite === 'Unlimited' ? t('compare.values.Unlimited') : f.elite,
        enterprise: f.enterprise === 'Custom' ? t('compare.values.Custom') : f.enterprise
    }));

    return (
        <div className="overflow-hidden">
            {/* Header */}
            <section className="relative pt-28 pb-16 text-center px-6">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-indigo-50/50 to-slate-50" />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-200/30 rounded-full blur-[120px]" />
                </div>

                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 mb-6">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    {t('header.badge')}
                </span>

                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4 leading-tight">
                    {t('header.title')}
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
                    {t('header.subtitle')}
                </p>

                {/* Product Line Toggle */}
                <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 mb-6">
                    <button
                        onClick={() => setTab('marketplace')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'marketplace'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-900'
                            }`}
                    >
                        {t('tabs.marketplace')}
                    </button>
                    <button
                        onClick={() => setTab('operations')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'operations'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-900'
                            }`}
                    >
                        {t('tabs.operations')}
                    </button>
                </div>

                {/* Product Description */}
                <div className="max-w-xl mx-auto mb-8">
                    {tab === 'marketplace' ? (
                        <p className="text-sm text-slate-500 bg-white border border-slate-200 rounded-xl p-4">
                            <strong className="text-slate-700">{t('desc.marketplace')}</strong> {t('desc.marketplaceText')}
                        </p>
                    ) : (
                        <p className="text-sm text-slate-500 bg-white border border-slate-200 rounded-xl p-4">
                            <strong className="text-slate-700">{t('desc.operations')}</strong> {t('desc.operationsText')}
                        </p>
                    )}
                </div>

                {/* Billing Toggle */}
                <div className="inline-flex items-center bg-white p-1 rounded-xl border border-slate-200">
                    {(['monthly', 'quarterly', 'annual'] as BillingPeriod[]).map((period) => (
                        <button
                            key={period}
                            onClick={() => setBilling(period)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${billing === period
                                ? 'bg-slate-900 text-white shadow'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            {t(`billing.${period}`)}
                            {period === 'quarterly' && <span className="ml-1 text-xs text-emerald-400 font-bold">-17%</span>}
                            {period === 'annual' && <span className="ml-1 text-xs text-emerald-400 font-bold">-27%</span>}
                        </button>
                    ))}
                </div>
            </section>

            {/* First 100 Users Promo */}
            {showPromo && (
                <section className="px-6 pb-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="relative rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <button 
                                onClick={() => setShowPromo(false)} 
                                className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 transition"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex-shrink-0 flex items-center justify-center text-2xl">🎉</div>
                            <div className="flex-grow pr-6">
                                <div className="font-bold text-slate-900 text-base">{t('promo.title')}</div>
                                <div className="text-slate-600 text-sm mt-1">{t('promo.desc1')}<strong className="text-blue-700">{t('promo.descHighlight')}</strong>{t('promo.desc2')}</div>
                            </div>
                            <Link href={`/signup?mode=${tab}`} className="flex-shrink-0 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/25 whitespace-nowrap mt-2 sm:mt-0">
                                {t('promo.cta')}
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Pricing Cards */}
            <section className="pb-24 px-6">
                <div className={`max-w-7xl mx-auto flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide ${plans.length === 4 ? 'md:grid md:grid-cols-2 lg:grid-cols-4' : 'md:grid md:grid-cols-3'}`}>
                    {plans.map((plan) => {
                        const isSelected = selectedPlan === plan.name;
                        return (
                            <div
                                key={plan.name}
                                onClick={() => setSelectedPlan(isSelected ? null : plan.name)}
                                className={`relative p-8 rounded-2xl transition-all duration-300 flex flex-col min-w-[300px] snap-center flex-shrink-0 md:min-w-0 md:flex-shrink cursor-pointer ${isSelected
                                    ? 'bg-white border-2 border-emerald-500 shadow-xl shadow-emerald-100 ring-4 ring-emerald-100 md:-translate-y-1'
                                    : plan.popular
                                        ? 'bg-white border-2 border-blue-500 shadow-xl shadow-blue-100 z-10'
                                        : plan.enterprise
                                            ? 'bg-slate-900 text-white shadow-xl'
                                            : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-lg mt-4 mb-4'
                                    }`}
                            >
                                <h3 className={`text-xl font-bold mb-2 ${plan.enterprise && !isSelected ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>

                                {/* Price */}
                                <div className="flex items-baseline gap-1 mb-1">
                                    {plan.enterprise ? (
                                        <span className="text-2xl font-bold">{t('card.custom')}</span>
                                    ) : plan.price[billing] === 0 ? (
                                        <span className="text-3xl font-bold">{t('card.free')}</span>
                                    ) : (
                                        <>
                                            <span className={`text-3xl font-bold ${plan.enterprise && !isSelected ? '' : 'text-slate-900'}`}>
                                                ₫{formatVND(plan.price[billing])}
                                            </span>
                                            <span className={`text-sm ${plan.enterprise && !isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {BILLING_MULTIPLIERS[billing].label}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Commission badge */}
                                <div className={`text-xs font-semibold mb-4 ${plan.enterprise && !isSelected ? 'text-slate-400' : plan.commission === '0%' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                    {plan.commission === '0%' ? t('card.noCommission') : t('card.commission', { pct: plan.commission })}
                                </div>

                                <p className={`text-sm mb-6 ${plan.enterprise && !isSelected ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>

                                {/* Limits */}
                                <div className={`rounded-xl p-4 mb-6 space-y-2 ${plan.enterprise && !isSelected ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                    {Object.entries(plan.limits).map(([key, val]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                            <span className={plan.enterprise && !isSelected ? 'text-slate-400' : 'text-slate-500'}>
                                                {key === 'tours' ? t('card.tours') : key === 'team' ? t('card.teamSize') : t('card.guidesPerTour')}
                                            </span>
                                            <span className={`font-semibold ${plan.enterprise && !isSelected ? 'text-white' : 'text-slate-900'}`}>{val as string}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Features */}
                                <div className="flex-grow space-y-3 mb-8">
                                    {(Array.isArray(plan.features) ? plan.features : []).map((f) => (
                                        <div key={f} className="flex items-start gap-2">
                                            <CheckIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.enterprise && !isSelected ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                            <span className={`text-sm ${plan.enterprise && !isSelected ? 'text-slate-300' : 'text-slate-600'}`}>{f}</span>
                                        </div>
                                    ))}
                                    {(Array.isArray(plan.excluded) ? plan.excluded : []).map((f) => (
                                        <div key={f} className="flex items-start gap-2">
                                            <XIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.enterprise && !isSelected ? 'text-slate-600' : 'text-slate-300'}`} />
                                            <span className={`text-sm ${plan.enterprise && !isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{f}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <Link
                                    href={plan.enterprise ? '/contact' : (status === 'authenticated' ? '/dashboard/account/subscription' : `/signup?mode=${tab}`)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`block w-full py-3 px-6 rounded-xl text-center font-semibold transition ${isSelected
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/25'
                                        : plan.popular
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25'
                                            : plan.enterprise
                                                ? 'bg-white text-slate-900 hover:bg-slate-100'
                                                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    {isSelected ? t('card.choose', { name: plan.name }) : plan.cta}
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* Click to select hint */}
                <p className="text-center text-xs text-slate-400 mt-4">{t('card.clickToSelect1')}<Link href="/features" className="text-blue-600 hover:underline">{t('card.clickToSelectLink')}</Link></p>
            </section>

            {/* ── Expanded Plan Modal ── */}
            {expandedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedPlan(null)}>
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 relative animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close */}
                        <button onClick={() => setSelectedPlan(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        {/* Selected badge */}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 mb-4">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            Selected Plan
                        </span>

                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{expandedPlan.name}</h2>
                        <div className="flex items-baseline gap-1 mb-1">
                            {expandedPlan.enterprise ? (
                                <span className="text-3xl font-bold text-slate-900">Custom</span>
                            ) : expandedPlan.price[billing] === 0 ? (
                                <span className="text-3xl font-bold text-slate-900">Free</span>
                            ) : (
                                <>
                                    <span className="text-3xl font-bold text-slate-900">₫{formatVND(expandedPlan.price[billing])}</span>
                                    <span className="text-sm text-slate-500">{BILLING_MULTIPLIERS[billing].label}</span>
                                </>
                            )}
                        </div>
                        <div className={`text-sm font-semibold mb-4 ${expandedPlan.commission === '0%' ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {expandedPlan.commission === '0%' ? '✨ No commission' : `${expandedPlan.commission} commission per transaction`}
                        </div>
                        <p className="text-sm text-slate-500 mb-6">{expandedPlan.desc}</p>

                        {/* Limits */}
                        <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2">
                            {Object.entries(expandedPlan.limits).map(([key, val]) => (
                                <div key={key} className="flex justify-between text-sm">
                                    <span className="text-slate-500">{key === 'tours' ? 'Tours' : key === 'team' ? 'Team size' : 'Guides/tour'}</span>
                                    <span className="font-semibold text-slate-900">{val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Features */}
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Included Features</h4>
                        <div className="space-y-2.5 mb-6">
                            {(Array.isArray(expandedPlan.features) ? expandedPlan.features : []).map((f) => (
                                <div key={f} className="flex items-start gap-2">
                                    <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700">{f}</span>
                                </div>
                            ))}
                        </div>
                        {Array.isArray(expandedPlan.excluded) && expandedPlan.excluded.length > 0 && (
                            <>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Not Included</h4>
                                <div className="space-y-2.5 mb-6">
                                    {expandedPlan.excluded.map((f) => (
                                        <div key={f} className="flex items-start gap-2">
                                            <XIcon className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-slate-400">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* CTA */}
                        <Link
                            href={expandedPlan.enterprise ? '/contact' : (status === 'authenticated' ? '/dashboard/account/subscription' : `/signup?mode=${tab}`)}
                            className="block w-full py-3.5 px-6 rounded-xl text-center font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/25 text-lg"
                        >
                            {expandedPlan.enterprise ? 'Contact Sales' : `Choose ${expandedPlan.name}`}
                        </Link>
                        <p className="text-center text-xs text-slate-400 mt-3">Click outside or press × to close</p>
                    </div>
                </div>
            )}

            {/* Comparison Table (Marketplace only) */}
            {tab === 'marketplace' && (
                <section className="py-20 bg-white border-y border-slate-100 px-6">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">{t('compare.title')}</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left text-sm font-semibold text-slate-500 py-4 pr-4 uppercase tracking-wider">{t('compare.feature')}</th>
                                        <th className="text-center text-sm font-bold text-slate-900 py-4 px-4">{t('compare.free')}</th>
                                        <th className="text-center text-sm font-bold text-blue-600 py-4 px-4">{t('compare.pro')}</th>
                                        <th className="text-center text-sm font-bold text-slate-900 py-4 px-4">{t('compare.elite')}</th>
                                        <th className="text-center text-sm font-bold text-slate-900 py-4 px-4">{t('compare.enterprise')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {translatedComparisonFeatures.map((row) => (
                                        <tr key={row.key} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 pr-4 text-sm text-slate-600">{row.key}</td>
                                            {(['free', 'pro', 'elite', 'enterprise'] as const).map((col) => {
                                                const val = row[col];
                                                return (
                                                    <td key={col} className="py-3 px-4 text-center">
                                                        {typeof val === 'boolean' ? (
                                                            val ? <CheckIcon className="w-5 h-5 text-emerald-500 mx-auto" /> : <XIcon className="w-5 h-5 text-slate-300 mx-auto" />
                                                        ) : (
                                                            <span className="text-sm font-medium text-slate-900">{val as string}</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}

            {/* Tour Guide Plans */}
            <section className="py-20 bg-white border-y border-slate-100 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 block">{t('guide.badge')}</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('guide.title')}</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">
                            {t('guide.subtitle')}
                        </p>
                    </div>

                    {/* Platform fee notice */}
                    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex items-start gap-4 mb-10 max-w-3xl mx-auto">
                        <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
                        <div>
                            <div className="font-semibold text-amber-800 text-sm">{t('guide.feeTitle')}</div>
                            <div className="text-slate-600 text-sm mt-1">
                                {t('guide.feeDesc')}
                            </div>
                        </div>
                    </div>

                    {/* Guide Plan Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
                        {/* Guide Free */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col hover:shadow-lg transition-shadow mt-4 mb-4">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('guide.freePlan')}</h3>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-3xl font-bold text-slate-900">{t('card.free')}</span>
                            </div>
                            <div className="text-sm font-semibold text-amber-600 mb-4">{t('guide.freeFeeDesc')}</div>
                            <p className="text-sm text-slate-500 mb-6">{t('guide.freeDesc')}</p>

                            <div className="rounded-xl bg-slate-50 p-4 mb-6 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('guide.freeApplications')}</span>
                                    <span className="font-semibold text-slate-900">10 / month</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('guide.freePlatformFee')}</span>
                                    <span className="font-semibold text-amber-600">5%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('guide.freeCancellation')}</span>
                                    <span className="font-semibold text-slate-900">{t('guide.none')}</span>
                                </div>
                            </div>

                            <div className="flex-grow space-y-3 mb-8">
                                {(t.raw('guide.freeFeatures') as string[]).map((f) => (
                                    <div key={f} className="flex items-start gap-2">
                                        <CheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                                        <span className="text-sm text-slate-600">{f}</span>
                                    </div>
                                ))}
                                {(t.raw('guide.freeExcluded') as string[]).map((f) => (
                                    <div key={f} className="flex items-start gap-2">
                                        <XIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-300" />
                                        <span className="text-sm text-slate-400">{f}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href="/signup?mode=marketplace" className="block w-full py-3 px-6 rounded-xl text-center font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition">
                                {t('guide.startFree')}
                            </Link>
                        </div>

                        {/* Guide Pro */}
                        <div className="relative bg-white rounded-2xl border-2 border-emerald-500 p-8 flex flex-col shadow-xl shadow-emerald-100 z-10">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('guide.proPlan')}</h3>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-3xl font-bold text-slate-900">₫{formatVND(billing === 'monthly' ? 149_000 : billing === 'quarterly' ? 369_000 : 1_299_000)}</span>
                                <span className="text-sm text-slate-500">{BILLING_MULTIPLIERS[billing].label}</span>
                            </div>
                            <div className="text-sm font-semibold text-emerald-600 mb-4">{t('guide.proFeeDesc')}</div>
                            <p className="text-sm text-slate-500 mb-6">{t('guide.proDesc')}</p>

                            <div className="rounded-xl bg-emerald-50 p-4 mb-6 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('guide.freeApplications')}</span>
                                    <span className="font-semibold text-slate-900">{t('guide.unlimited')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('guide.freePlatformFee')}</span>
                                    <span className="font-semibold text-emerald-600">2%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('guide.freeCancellation')}</span>
                                    <span className="font-semibold text-slate-900">1 / quarter</span>
                                </div>
                            </div>

                            <div className="flex-grow space-y-3 mb-8">
                                {(t.raw('guide.proFeatures') as string[]).map((f) => (
                                    <div key={f} className="flex items-start gap-2">
                                        <CheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                                        <span className="text-sm text-slate-600">{f}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href="/signup?mode=marketplace" className="block w-full py-3 px-6 rounded-xl text-center font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/25">
                                {t('guide.upgradePro')}
                            </Link>
                        </div>
                    </div>

                    {/* Reliability Rules */}
                    <div className="max-w-3xl mx-auto">
                        <h3 className="text-xl font-bold text-slate-900 text-center mb-6">{t('guide.rulesTitle')}</h3>
                        <p className="text-center text-sm text-slate-500 mb-8">
                            {t('guide.rulesDesc1')}
                            {' '}<Link href="/trust-safety" className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2">{t('guide.rulesDescLink')}</Link>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                                <div className="text-lg mb-2">🚨</div>
                                <div className="font-semibold text-slate-900 text-sm mb-1">{t('guide.penaltyTitle')}</div>
                                <div className="text-xs text-slate-500">{t('guide.penaltyDesc1')}<strong className="text-red-600">{t('guide.penaltyDescHighlight')}</strong>{t('guide.penaltyDesc2')}</div>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                                <div className="text-lg mb-2">⚠️</div>
                                <div className="font-semibold text-slate-900 text-sm mb-1">{t('guide.warningTitle')}</div>
                                <div className="text-xs text-slate-500">{t('guide.warningDesc1')}<strong className="text-amber-600">{t('guide.warningDescHighlight')}</strong>{t('guide.warningDesc2')}</div>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                                <div className="text-lg mb-2">✅</div>
                                <div className="font-semibold text-slate-900 text-sm mb-1">{t('guide.rewardTitle')}</div>
                                <div className="text-xs text-slate-500">{t('guide.rewardDesc1')}<strong className="text-emerald-600">{t('guide.rewardDescHighlight')}</strong>{t('guide.rewardDesc2')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-slate-50 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">{t('faq.title')}</h2>
                    <div className="text-left space-y-6 mt-10">
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-900 mb-2">{t('faq.q1')}</h3>
                            <p className="text-sm text-slate-500">{t('faq.a1')}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-900 mb-2">{t('faq.q2')}</h3>
                            <p className="text-sm text-slate-500">{t('faq.a2')}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-900 mb-2">{t('faq.q3')}</h3>
                            <p className="text-sm text-slate-500">{t('faq.a3')}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-900 mb-2">{t('faq.q4')}</h3>
                            <p className="text-sm text-slate-500">{t('faq.a4')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-white border-t border-slate-100 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('bottomCta.title')}</h2>
                    <p className="text-slate-500 mb-8">{t('bottomCta.subtitle')}</p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link href="/signup?mode=marketplace" className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/25 text-lg">
                            {t('bottomCta.startFree')}
                        </Link>
                        <Link href="/contact" className="px-8 py-4 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 transition text-lg shadow-sm">
                            {t('bottomCta.contactSales')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
