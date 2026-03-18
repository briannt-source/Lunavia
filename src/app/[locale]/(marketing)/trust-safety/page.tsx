import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'TrustSafety' });
    return {
        title: t('title'),
        description: t('desc'),
    };
}

const CheckBadge = () => (
    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

export default async function TrustSafetyPage() {
    const t = await getTranslations('TrustSafety');

    return (
        <div className="overflow-hidden">
            {/* Header */}
            <section className="relative pt-28 pb-16 text-center px-6">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-blue-50/30 to-slate-50" />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-200/30 rounded-full blur-[120px]" />
                </div>

                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 mb-6">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {t('hero.badge')}
                </span>

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                    {t('hero.title')}
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    {t('hero.subtitle')}
                </p>
            </section>

            {/* Overview: Two Scores */}
            <section className="pb-16 px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl mb-4">🛡️</div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">{t('overview.trust.title')}</h2>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            {t('overview.trust.desc')}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-600">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            {t('overview.trust.note')}
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl mb-4">📊</div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">{t('overview.reliability.title')}</h2>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            {t('overview.reliability.desc')}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-600">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            {t('overview.reliability.note')}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ OPERATOR TRUST ═══ */}
            <section className="py-16 bg-white border-y border-slate-100 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 block">{t('operator.tag')}</span>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">{t('operator.title')}</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">{t('operator.desc')}</p>
                    </div>

                    {/* Formula breakdown */}
                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 mb-10">
                        <div className="text-sm font-mono text-center text-slate-700 mb-6 font-bold">
                            {t('operator.formula')}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-5 border border-blue-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="font-semibold text-sm text-slate-900">{t('operator.legal.title')}</span>
                                </div>
                                <ul className="text-xs text-slate-500 space-y-1 ml-5">
                                    <li>{t('operator.legal.i1')} <strong className="text-slate-700">{t('operator.legal.v1')}</strong></li>
                                    <li>{t('operator.legal.i2')} <strong className="text-slate-700">{t('operator.legal.v2')}</strong></li>
                                    <li>{t('operator.legal.i3')} <strong className="text-slate-700">{t('operator.legal.v3')}</strong></li>
                                </ul>
                            </div>
                            <div className="bg-white rounded-xl p-5 border border-emerald-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="font-semibold text-sm text-slate-900">{t('operator.compliance.title')}</span>
                                </div>
                                <ul className="text-xs text-slate-500 space-y-1 ml-5">
                                    <li>{t('operator.compliance.i1')} <strong className="text-slate-700">{t('operator.compliance.v1')}</strong></li>
                                    <li>{t('operator.compliance.i2')} <strong className="text-slate-700">{t('operator.compliance.v2')}</strong></li>
                                    <li>{t('operator.compliance.i3')} <strong className="text-slate-700">{t('operator.compliance.v3')}</strong></li>
                                </ul>
                            </div>
                            <div className="bg-white rounded-xl p-5 border border-indigo-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-3 h-3 rounded-full bg-indigo-500" />
                                    <span className="font-semibold text-sm text-slate-900">{t('operator.performance.title')}</span>
                                </div>
                                <p className="text-xs text-slate-500 ml-5">{t('operator.performance.desc')}</p>
                            </div>
                            <div className="bg-white rounded-xl p-5 border border-amber-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                                    <span className="font-semibold text-sm text-slate-900">{t('operator.financial.title')}</span>
                                </div>
                                <p className="text-xs text-slate-500 ml-5">{t('operator.financial.desc')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Penalties */}
                    <div className="bg-red-50 rounded-2xl p-8 border border-red-100 mb-6">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="text-lg">⚠️</span> {t('operator.penalties.title')}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">{t('operator.penalties.desc')}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-white rounded-lg p-4">
                                <div className="font-semibold text-sm text-slate-900 mb-1">{t('operator.penalties.opTitle')}</div>
                                <div className="text-xs text-slate-500">{t('operator.penalties.opDesc')}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <div className="font-semibold text-sm text-slate-900 mb-1">{t('operator.penalties.finTitle')}</div>
                                <div className="text-xs text-slate-500">{t('operator.penalties.finDesc')}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <div className="font-semibold text-sm text-slate-900 mb-1">{t('operator.penalties.riskTitle')}</div>
                                <div className="text-xs text-slate-500">{t('operator.penalties.riskDesc')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ GUIDE TRUST ═══ */}
            <section className="py-16 bg-slate-50 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">{t('guide.tag')}</span>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">{t('guide.title')}</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">{t('guide.desc')}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 border border-slate-200 mb-10">
                        <div className="text-sm font-mono text-center text-slate-700 mb-6 font-bold">
                            {t('guide.formula')}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl p-5 border border-emerald-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="font-semibold text-sm text-slate-900">{t('guide.base.title')}</span>
                                </div>
                                <p className="text-xs text-slate-500 ml-5">{t('guide.base.desc')}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-blue-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="font-semibold text-sm text-slate-900">{t('guide.completion.title')}</span>
                                </div>
                                <p className="text-xs text-slate-500 ml-5">{t('guide.completion.desc')}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-indigo-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-3 h-3 rounded-full bg-indigo-500" />
                                    <span className="font-semibold text-sm text-slate-900">{t('guide.rating.title')}</span>
                                </div>
                                <p className="text-xs text-slate-500 ml-5">{t('guide.rating.desc')}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-amber-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                                    <span className="font-semibold text-sm text-slate-900">{t('guide.reliability.title')}</span>
                                </div>
                                <p className="text-xs text-slate-500 ml-5">{t('guide.reliability.desc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ RELIABILITY SCORE ═══ */}
            <section className="py-16 bg-white border-y border-slate-100 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2 block">{t('reliabilityScore.tag')}</span>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">{t('reliabilityScore.title')}</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">{t('reliabilityScore.desc')}</p>
                    </div>

                    {/* Score zones */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 text-center">
                            <div className="text-4xl font-bold text-emerald-600 mb-2">95–100%</div>
                            <div className="font-semibold text-slate-900 mb-1">{t('reliabilityScore.zones.excellent.title')}</div>
                            <ul className="text-xs text-slate-500 space-y-1 text-left mt-3">
                                <li className="flex items-start gap-1.5"><CheckBadge /> {t('reliabilityScore.zones.excellent.i1')}</li>
                                <li className="flex items-start gap-1.5"><CheckBadge /> {t('reliabilityScore.zones.excellent.i2')}</li>
                                <li className="flex items-start gap-1.5"><CheckBadge /> {t('reliabilityScore.zones.excellent.i3')}</li>
                                <li className="flex items-start gap-1.5"><CheckBadge /> {t('reliabilityScore.zones.excellent.i4')}</li>
                            </ul>
                        </div>
                        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 text-center">
                            <div className="text-4xl font-bold text-amber-600 mb-2">70–94%</div>
                            <div className="font-semibold text-slate-900 mb-1">{t('reliabilityScore.zones.standard.title')}</div>
                            <ul className="text-xs text-slate-500 space-y-1 text-left mt-3">
                                <li className="flex items-start gap-1.5"><CheckBadge /> {t('reliabilityScore.zones.standard.i1')}</li>
                                <li className="flex items-start gap-1.5"><CheckBadge /> {t('reliabilityScore.zones.standard.i2')}</li>
                                <li className="flex items-start gap-1.5"><CheckBadge /> {t('reliabilityScore.zones.standard.i3')}</li>
                            </ul>
                        </div>
                        <div className="bg-red-50 rounded-2xl p-6 border border-red-200 text-center">
                            <div className="text-4xl font-bold text-red-600 mb-2">&lt; 70%</div>
                            <div className="font-semibold text-slate-900 mb-1">{t('reliabilityScore.zones.probation.title')}</div>
                            <ul className="text-xs text-slate-500 space-y-1 text-left mt-3">
                                <li className="flex items-start gap-1.5">
                                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    {t('reliabilityScore.zones.probation.i1')}
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    {t('reliabilityScore.zones.probation.i2')}
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    {t('reliabilityScore.zones.probation.i3')}
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* What affects reliability */}
                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 mb-10">
                        <h3 className="font-bold text-slate-900 mb-6 text-center">{t('reliabilityScore.affects.title')}</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 bg-white rounded-xl p-4 border border-red-100">
                                <span className="text-2xl">🚨</span>
                                <div>
                                    <div className="font-semibold text-sm text-slate-900">{t('reliabilityScore.affects.late.title')}</div>
                                    <div className="text-xs text-red-600 font-bold mt-0.5">{t('reliabilityScore.affects.late.value')}</div>
                                    <div className="text-xs text-slate-500 mt-1">{t('reliabilityScore.affects.late.desc')}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 bg-white rounded-xl p-4 border border-red-100">
                                <span className="text-2xl">❌</span>
                                <div>
                                    <div className="font-semibold text-sm text-slate-900">{t('reliabilityScore.affects.noshow.title')}</div>
                                    <div className="text-xs text-red-600 font-bold mt-0.5">{t('reliabilityScore.affects.noshow.value')}</div>
                                    <div className="text-xs text-slate-500 mt-1">{t('reliabilityScore.affects.noshow.desc')}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 bg-white rounded-xl p-4 border border-amber-100">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <div className="font-semibold text-sm text-slate-900">{t('reliabilityScore.affects.incident.title')}</div>
                                    <div className="text-xs text-amber-600 font-bold mt-0.5">{t('reliabilityScore.affects.incident.value')}</div>
                                    <div className="text-xs text-slate-500 mt-1">{t('reliabilityScore.affects.incident.desc')}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 bg-white rounded-xl p-4 border border-emerald-100">
                                <span className="text-2xl">✅</span>
                                <div>
                                    <div className="font-semibold text-sm text-slate-900">{t('reliabilityScore.affects.completion.title')}</div>
                                    <div className="text-xs text-emerald-600 font-bold mt-0.5">{t('reliabilityScore.affects.completion.value')}</div>
                                    <div className="text-xs text-slate-500 mt-1">{t('reliabilityScore.affects.completion.desc')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ PLATFORM FEE ═══ */}
            <section className="py-16 bg-slate-50 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">{t('fees.title')}</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">{t('fees.desc')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm">🏢</span>
                                {t('fees.operatorTitle')}
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">{t('fees.opSub')}</span>
                                    <span className="font-semibold text-slate-900">{t('fees.opSubVal')}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">{t('fees.opComm')}</span>
                                    <span className="font-semibold text-slate-900">{t('fees.opCommVal')}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">{t('fees.opOps')}</span>
                                    <span className="font-semibold text-emerald-600">{t('fees.opOpsVal')}</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">{t('fees.opNote')}</p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-sm">🧑‍🏫</span>
                                {t('fees.guideTitle')}
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">{t('fees.gdFree')}</span>
                                    <span className="font-semibold text-amber-600">{t('fees.gdFreeVal')}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">{t('fees.gdPro')}</span>
                                    <span className="font-semibold text-emerald-600">{t('fees.gdProVal')}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">{t('fees.gdSub')}</span>
                                    <span className="font-semibold text-slate-900">{t('fees.gdSubVal')}</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">{t('fees.gdNote')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ TRUST DECAY ═══ */}
            <section className="py-16 bg-white border-y border-slate-100 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">{t('decay.title')}</h2>
                        <p className="text-slate-500 max-w-xl mx-auto text-sm">{t('decay.desc')}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center">
                            <div className="text-3xl mb-3">⏳</div>
                            <div className="font-semibold text-slate-900 text-sm mb-2">{t('decay.inactivity.title')}</div>
                            <div className="text-xs text-slate-500">{t('decay.inactivity.desc')}</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center">
                            <div className="text-3xl mb-3">📈</div>
                            <div className="font-semibold text-slate-900 text-sm mb-2">{t('decay.recovery.title')}</div>
                            <div className="text-xs text-slate-500">{t('decay.recovery.desc')}</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center">
                            <div className="text-3xl mb-3">🔒</div>
                            <div className="font-semibold text-slate-900 text-sm mb-2">{t('decay.caps.title')}</div>
                            <div className="text-xs text-slate-500">{t('decay.caps.desc')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ MATCHING WEIGHT ═══ */}
            <section className="py-16 bg-slate-50 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">{t('matching.title')}</h2>
                        <p className="text-slate-500 max-w-xl mx-auto text-sm">{t('matching.desc')}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                        <div className="text-sm font-mono text-center text-slate-700 mb-6 font-bold">
                            {t('matching.formula')}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                            <div className="flex items-start gap-3">
                                <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">60%</span>
                                <div>
                                    <div className="font-semibold text-slate-900">{t('matching.rel.title')}</div>
                                    <div className="text-xs text-slate-500">{t('matching.rel.desc')}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs flex-shrink-0">40%</span>
                                <div>
                                    <div className="font-semibold text-slate-900">{t('matching.trust.title')}</div>
                                    <div className="text-xs text-slate-500">{t('matching.trust.desc')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ TOUR HEALTH CROSS-LINK ═══ */}
            <section className="py-16 bg-slate-50 border-t border-slate-100 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-blue-600/20">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-shrink-0 text-5xl">🏥</div>
                            <div className="flex-grow text-center md:text-left">
                                <h3 className="text-xl font-bold mb-2">{t('tourHealth.title')}</h3>
                                <p className="text-sm text-blue-100 leading-relaxed">{t('tourHealth.desc')}</p>
                            </div>
                            <Link href="/tour-health" className="flex-shrink-0 px-6 py-3 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition text-sm shadow-md">
                                {t('tourHealth.btn')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-white border-t border-slate-100 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('cta.title')}</h2>
                    <p className="text-slate-500 mb-8">{t('cta.desc')}</p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link href="/signup" className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/25 text-lg">
                            {t('cta.start')}
                        </Link>
                        <Link href="/pricing" className="px-8 py-4 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 transition text-lg shadow-sm">
                            {t('cta.pricing')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
