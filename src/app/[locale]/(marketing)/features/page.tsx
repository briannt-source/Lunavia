'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

const CheckIcon = () => (
    <svg className="w-5 h-5 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);
const XIcon = () => (
    <svg className="w-5 h-5 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

type ProductLine = 'marketplace' | 'operations' | 'guides';

interface FeatureRow {
    category: string;
    feature: string;
    description: string;
    plans: Record<string, boolean | string>;
}

export default function FeaturesPage() {
    const t = useTranslations('MarketingFeatures');
    const [tab, setTab] = useState<ProductLine>('marketplace');

    const MARKETPLACE_FEATURES: FeatureRow[] = [
        // Pricing & Limits
        { category: t('categories.Pricing'), feature: t('marketplaceFeatures.f1.feature'), description: t('marketplaceFeatures.f1.description'), plans: { free: t('table.values.Free'), pro: '₫399K', elite: '₫799K', enterprise: t('table.values.Custom') } },
        { category: t('categories.Pricing'), feature: t('marketplaceFeatures.f2.feature'), description: t('marketplaceFeatures.f2.description'), plans: { free: '5%', pro: '3%', elite: '1.5%', enterprise: t('table.values.Custom') } },
        { category: t('categories.Pricing'), feature: t('marketplaceFeatures.f3.feature'), description: t('marketplaceFeatures.f3.description'), plans: { free: '—', pro: '−17%', elite: '−17%', enterprise: '—' } },
        { category: t('categories.Pricing'), feature: t('marketplaceFeatures.f4.feature'), description: t('marketplaceFeatures.f4.description'), plans: { free: '—', pro: '−27%', elite: '−27%', enterprise: '—' } },

        // Limits
        { category: t('categories.Limits'), feature: t('marketplaceFeatures.f5.feature'), description: t('marketplaceFeatures.f5.description'), plans: { free: '5', pro: '20', elite: '50', enterprise: t('table.values.Custom') } },
        { category: t('categories.Limits'), feature: t('marketplaceFeatures.f6.feature'), description: t('marketplaceFeatures.f6.description'), plans: { free: '2', pro: '10', elite: '30', enterprise: t('table.values.Custom') } },
        { category: t('categories.Limits'), feature: t('marketplaceFeatures.f7.feature'), description: t('marketplaceFeatures.f7.description'), plans: { free: '1', pro: '3', elite: '5', enterprise: t('table.values.Custom') } },

        // Core Features
        { category: t('categories.Core'), feature: t('marketplaceFeatures.f8.feature'), description: t('marketplaceFeatures.f8.description'), plans: { free: true, pro: true, elite: true, enterprise: true } },
        { category: t('categories.Core'), feature: t('marketplaceFeatures.f9.feature'), description: t('marketplaceFeatures.f9.description'), plans: { free: true, pro: true, elite: true, enterprise: true } },
        { category: t('categories.Core'), feature: t('marketplaceFeatures.f10.feature'), description: t('marketplaceFeatures.f10.description'), plans: { free: true, pro: true, elite: true, enterprise: true } },
        { category: t('categories.Core'), feature: t('marketplaceFeatures.f11.feature'), description: t('marketplaceFeatures.f11.description'), plans: { free: true, pro: true, elite: true, enterprise: true } },
        { category: t('categories.Core'), feature: t('marketplaceFeatures.f12.feature'), description: t('marketplaceFeatures.f12.description'), plans: { free: true, pro: true, elite: true, enterprise: true } },

        // Advanced Features
        { category: t('categories.Advanced'), feature: t('marketplaceFeatures.f13.feature'), description: t('marketplaceFeatures.f13.description'), plans: { free: false, pro: true, elite: true, enterprise: true } },
        { category: t('categories.Advanced'), feature: t('marketplaceFeatures.f14.feature'), description: t('marketplaceFeatures.f14.description'), plans: { free: false, pro: true, elite: true, enterprise: true } },
        { category: t('categories.Advanced'), feature: t('marketplaceFeatures.f15.feature'), description: t('marketplaceFeatures.f15.description'), plans: { free: false, pro: true, elite: true, enterprise: true } },
        { category: t('categories.Advanced'), feature: t('marketplaceFeatures.f16.feature'), description: t('marketplaceFeatures.f16.description'), plans: { free: false, pro: true, elite: true, enterprise: true } },
        { category: t('categories.Advanced'), feature: t('marketplaceFeatures.f17.feature'), description: t('marketplaceFeatures.f17.description'), plans: { free: false, pro: true, elite: true, enterprise: true } },
        { category: t('categories.Advanced'), feature: t('marketplaceFeatures.f18.feature'), description: t('marketplaceFeatures.f18.description'), plans: { free: false, pro: true, elite: true, enterprise: true } },

        // Analytics & Branding
        { category: t('categories.Analytics & Branding'), feature: t('marketplaceFeatures.f19.feature'), description: t('marketplaceFeatures.f19.description'), plans: { free: false, pro: true, elite: true, enterprise: true } },
        { category: t('categories.Analytics & Branding'), feature: t('marketplaceFeatures.f20.feature'), description: t('marketplaceFeatures.f20.description'), plans: { free: false, pro: true, elite: true, enterprise: true } },

        // Premium
        { category: t('categories.Premium'), feature: t('marketplaceFeatures.f21.feature'), description: t('marketplaceFeatures.f21.description'), plans: { free: false, pro: false, elite: true, enterprise: true } },
        { category: t('categories.Premium'), feature: t('marketplaceFeatures.f22.feature'), description: t('marketplaceFeatures.f22.description'), plans: { free: false, pro: false, elite: true, enterprise: true } },
        { category: t('categories.Premium'), feature: t('marketplaceFeatures.f23.feature'), description: t('marketplaceFeatures.f23.description'), plans: { free: false, pro: false, elite: true, enterprise: true } },

        // Enterprise
        { category: t('categories.Enterprise'), feature: t('marketplaceFeatures.f24.feature'), description: t('marketplaceFeatures.f24.description'), plans: { free: false, pro: false, elite: false, enterprise: true } },
        { category: t('categories.Enterprise'), feature: t('marketplaceFeatures.f25.feature'), description: t('marketplaceFeatures.f25.description'), plans: { free: false, pro: false, elite: false, enterprise: true } },
        { category: t('categories.Enterprise'), feature: t('marketplaceFeatures.f26.feature'), description: t('marketplaceFeatures.f26.description'), plans: { free: false, pro: false, elite: false, enterprise: true } },
    ];

    const OPERATIONS_FEATURES: FeatureRow[] = [
        { category: t('categories.Pricing'), feature: t('operationsFeatures.f1.feature'), description: t('operationsFeatures.f1.description'), plans: { starter: '₫199K', business: '₫499K', enterprise: t('table.values.Custom') } },
        { category: t('categories.Pricing'), feature: t('operationsFeatures.f2.feature'), description: t('operationsFeatures.f2.description'), plans: { starter: '0%', business: '0%', enterprise: '0%' } },
        { category: t('categories.Limits'), feature: t('operationsFeatures.f3.feature'), description: t('operationsFeatures.f3.description'), plans: { starter: '15', business: '50', enterprise: t('table.values.Custom') } },
        { category: t('categories.Limits'), feature: t('operationsFeatures.f4.feature'), description: t('operationsFeatures.f4.description'), plans: { starter: '5', business: '20', enterprise: t('table.values.Custom') } },
        { category: t('categories.Limits'), feature: t('operationsFeatures.f5.feature'), description: t('operationsFeatures.f5.description'), plans: { starter: '3', business: '5', enterprise: t('table.values.Custom') } },
        { category: t('categories.Core'), feature: t('operationsFeatures.f6.feature'), description: t('operationsFeatures.f6.description'), plans: { starter: true, business: true, enterprise: true } },
        { category: t('categories.Core'), feature: t('operationsFeatures.f7.feature'), description: t('operationsFeatures.f7.description'), plans: { starter: true, business: true, enterprise: true } },
        { category: t('categories.Core'), feature: t('operationsFeatures.f8.feature'), description: t('operationsFeatures.f8.description'), plans: { starter: true, business: true, enterprise: true } },
        { category: t('categories.Core'), feature: t('operationsFeatures.f9.feature'), description: t('operationsFeatures.f9.description'), plans: { starter: true, business: true, enterprise: true } },
        { category: t('categories.Core'), feature: t('operationsFeatures.f10.feature'), description: t('operationsFeatures.f10.description'), plans: { starter: true, business: true, enterprise: true } },
        { category: t('categories.Core'), feature: t('operationsFeatures.f11.feature'), description: t('operationsFeatures.f11.description'), plans: { starter: true, business: true, enterprise: true } },
        { category: t('categories.Advanced'), feature: t('operationsFeatures.f12.feature'), description: t('operationsFeatures.f12.description'), plans: { starter: false, business: true, enterprise: true } },
        { category: t('categories.Advanced'), feature: t('operationsFeatures.f13.feature'), description: t('operationsFeatures.f13.description'), plans: { starter: false, business: true, enterprise: true } },
        { category: t('categories.Advanced'), feature: t('operationsFeatures.f14.feature'), description: t('operationsFeatures.f14.description'), plans: { starter: false, business: true, enterprise: true } },
        { category: t('categories.Enterprise'), feature: t('operationsFeatures.f15.feature'), description: t('operationsFeatures.f15.description'), plans: { starter: false, business: false, enterprise: true } },
        { category: t('categories.Enterprise'), feature: t('operationsFeatures.f16.feature'), description: t('operationsFeatures.f16.description'), plans: { starter: false, business: false, enterprise: true } },
    ];

    const GUIDE_FEATURES: FeatureRow[] = [
        { category: t('categories.Pricing'), feature: t('guideFeatures.f1.feature'), description: t('guideFeatures.f1.description'), plans: { free: t('table.values.Free'), pro: '₫149K/mo' } },
        { category: t('categories.Pricing'), feature: t('guideFeatures.f2.feature'), description: t('guideFeatures.f2.description'), plans: { free: '5%', pro: '2%' } },
        { category: t('categories.Limits'), feature: t('guideFeatures.f3.feature'), description: t('guideFeatures.f3.description'), plans: { free: '10', pro: t('table.values.Unlimited') } },
        { category: t('categories.Core'), feature: t('guideFeatures.f4.feature'), description: t('guideFeatures.f4.description'), plans: { free: true, pro: true } },
        { category: t('categories.Core'), feature: t('guideFeatures.f5.feature'), description: t('guideFeatures.f5.description'), plans: { free: true, pro: true } },
        { category: t('categories.Core'), feature: t('guideFeatures.f6.feature'), description: t('guideFeatures.f6.description'), plans: { free: true, pro: true } },
        { category: t('categories.Core'), feature: t('guideFeatures.f7.feature'), description: t('guideFeatures.f7.description'), plans: { free: true, pro: true } },
        { category: t('categories.Pro Benefits'), feature: t('guideFeatures.f8.feature'), description: t('guideFeatures.f8.description'), plans: { free: false, pro: true } },
        { category: t('categories.Pro Benefits'), feature: t('guideFeatures.f9.feature'), description: t('guideFeatures.f9.description'), plans: { free: false, pro: true } },
        { category: t('categories.Pro Benefits'), feature: t('guideFeatures.f10.feature'), description: t('guideFeatures.f10.description'), plans: { free: false, pro: true } },
        { category: t('categories.Pro Benefits'), feature: t('guideFeatures.f11.feature'), description: t('guideFeatures.f11.description'), plans: { free: false, pro: true } },
        { category: t('categories.Pro Benefits'), feature: t('guideFeatures.f12.feature'), description: t('guideFeatures.f12.description'), plans: { free: false, pro: true } },
    ];

    const PLAN_COLUMNS: Record<ProductLine, { key: string; label: string; highlight?: boolean }[]> = {
        marketplace: [
            { key: 'free', label: t('table.plans.mp_free') },
            { key: 'pro', label: t('table.plans.mp_pro'), highlight: true },
            { key: 'elite', label: t('table.plans.mp_elite') },
            { key: 'enterprise', label: t('table.plans.mp_enterprise') },
        ],
        operations: [
            { key: 'starter', label: t('table.plans.ops_starter') },
            { key: 'business', label: t('table.plans.ops_business'), highlight: true },
            { key: 'enterprise', label: t('table.plans.ops_enterprise') },
        ],
        guides: [
            { key: 'free', label: t('table.plans.guide_free') },
            { key: 'pro', label: t('table.plans.guide_pro'), highlight: true },
        ],
    };

    const features = tab === 'marketplace' ? MARKETPLACE_FEATURES : tab === 'operations' ? OPERATIONS_FEATURES : GUIDE_FEATURES;
    const columns = PLAN_COLUMNS[tab];
    const categories = [...new Set(features.map(f => f.category))];

    return (
        <div className="overflow-hidden">
            {/* Header */}
            <section className="relative pt-28 pb-16 text-center px-6">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-slate-50/50 to-white" />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-200/30 rounded-full blur-[120px]" />
                </div>

                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F4FD] border border-[#5BA4CF]/30 text-xs font-semibold text-[#2E8BC0] mb-6">
                    <span className="w-2 h-2 rounded-full bg-[#E8F4FD]0 animate-pulse" />
                    {t('hero.badge')}
                </span>

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                    {t('hero.title')}
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
                    {t('hero.subtitle')}
                </p>

                {/* Product Toggle */}
                <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {[
                        { key: 'marketplace' as const, label: t('hero.tabs.marketplace.label'), desc: t('hero.tabs.marketplace.desc') },
                        { key: 'operations' as const, label: t('hero.tabs.operations.label'), desc: t('hero.tabs.operations.desc') },
                        { key: 'guides' as const, label: t('hero.tabs.guides.label'), desc: t('hero.tabs.guides.desc') },
                    ].map(tabItem => (
                        <button
                            key={tabItem.key}
                            onClick={() => setTab(tabItem.key)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === tabItem.key
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            {tabItem.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Comparison Table */}
            <section className="pb-24 px-4 md:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider py-4 px-6 w-[40%] min-w-[250px]">{t('table.feature')}</th>
                                    {columns.map(col => (
                                        <th key={col.key} className={`text-center py-4 px-4 min-w-[100px] ${col.highlight ? 'bg-[#E8F4FD]' : ''}`}>
                                            <span className={`text-sm font-bold ${col.highlight ? 'text-[#5BA4CF]' : 'text-slate-900'}`}>{col.label}</span>
                                            {col.highlight && <div className="text-[10px] text-indigo-400 mt-0.5">{t('table.recommended')}</div>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat, catIndex) => (
                                    <>
                                        {/* Category header */}
                                        <tr key={`cat-${cat}`} className="bg-slate-50/50">
                                            <td colSpan={columns.length + 1} className="px-6 py-3">
                                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{cat}</span>
                                            </td>
                                        </tr>
                                        {/* Feature rows */}
                                        {features.filter(f => f.category === cat).map((row, i) => (
                                            <tr key={row.feature} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                                                <td className="px-6 py-3.5">
                                                    <div className="text-sm font-medium text-slate-900">{row.feature}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">{row.description}</div>
                                                </td>
                                                {columns.map(col => {
                                                    const val = row.plans[col.key];
                                                    return (
                                                        <td key={col.key} className={`px-4 py-3.5 text-center ${col.highlight ? 'bg-[#E8F4FD]/30' : ''}`}>
                                                            {typeof val === 'boolean' ? (
                                                                val ? <CheckIcon /> : <XIcon />
                                                            ) : (
                                                                <span className="text-sm font-semibold text-slate-700">{val}</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> {t('table.included')}</span>
                        <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> {t('table.notIncluded')}</span>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-slate-50 border-t border-slate-100 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('cta.title')}</h2>
                    <p className="text-slate-500 mb-8">{t('cta.subtitle')}</p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link href="/signup" className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/25 text-lg">
                            {t('cta.start')}
                        </Link>
                        <Link href="/pricing" className="px-8 py-4 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 transition text-lg shadow-sm">
                            {t('cta.pricing')}
                        </Link>
                        <Link href="/contact" className="px-8 py-4 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 transition text-lg shadow-sm">
                            {t('cta.contact')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
