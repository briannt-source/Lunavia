import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'TourHealth' });
    return {
        title: t('title'),
        description: t('desc'),
    };
}

export default async function TourHealthPage() {
    const t = await getTranslations('TourHealth');

    return (
        <div className="overflow-hidden">
            {/* Header */}
            <section className="relative pt-28 pb-16 text-center px-6">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-slate-50/50 to-white" />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#2E8BC0]/15 rounded-full blur-[120px]" />
                </div>

                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lunavia-light border border-lunavia-muted/60 text-xs font-semibold text-lunavia-primary-hover mb-6">
                    <span className="w-2 h-2 rounded-full bg-lunavia-light0 animate-pulse" />
                    {t('hero.badge')}
                </span>

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                    {t('hero.title')}
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-6">
                    {t('hero.subtitle')}
                </p>

                <div className="flex items-center justify-center gap-6 text-sm text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1.5">🟢 {t('indicators.healthy')}</span>
                    <span className="flex items-center gap-1.5">🟡 {t('indicators.minorRisk')}</span>
                    <span className="flex items-center gap-1.5">🟠 {t('indicators.atRisk')}</span>
                    <span className="flex items-center gap-1.5">🔴 {t('indicators.critical')}</span>
                    <span className="flex items-center gap-1.5">🟣 {t('indicators.sosActive')}</span>
                </div>
            </section>

            {/* What Is Tour Health */}
            <section className="py-16 bg-white border-y border-slate-100 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div>
                            <span className="text-xs font-bold text-lunavia-primary uppercase tracking-widest mb-3 block">{t('whatIsIt.tag')}</span>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('whatIsIt.title')}</h2>
                            <p className="text-slate-500 leading-relaxed mb-4">
                                {t('whatIsIt.p1')}
                            </p>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {t('whatIsIt.p2')}
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
                            {[
                                { icon: '🚐', ...t.raw('whatIsIt.items.uber') as {label: string, desc: string} },
                                { icon: '📦', ...t.raw('whatIsIt.items.logistics') as {label: string, desc: string} },
                                { icon: '✈️', ...t.raw('whatIsIt.items.airline') as {label: string, desc: string} },
                                { icon: '🏥', ...t.raw('whatIsIt.items.patient') as {label: string, desc: string} },
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-slate-100">
                                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                                    <div>
                                        <div className="font-semibold text-sm text-slate-900">{item.label}</div>
                                        <div className="text-xs text-slate-500">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Health Score Formula */}
            <section className="py-16 bg-slate-50 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold text-[#5BA4CF] uppercase tracking-widest mb-2 block">{t('scoreSystem.tag')}</span>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">{t('scoreSystem.title')}</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">{t('scoreSystem.desc')}</p>
                    </div>

                    {/* 5 Factors */}
                    <div className="space-y-4 mb-12">
                        {[
                            {
                                weight: '30%', color: 'blue',
                                name: t('scoreSystem.factors.f1.name'),
                                description: t('scoreSystem.factors.f1.desc'),
                                details: [t('scoreSystem.factors.f1.d1'), t('scoreSystem.factors.f1.d2'), t('scoreSystem.factors.f1.d3')],
                            },
                            {
                                weight: '20%', color: 'amber',
                                name: t('scoreSystem.factors.f2.name'),
                                description: t('scoreSystem.factors.f2.desc'),
                                details: [t('scoreSystem.factors.f2.d1'), t('scoreSystem.factors.f2.d2'), t('scoreSystem.factors.f2.d3'), t('scoreSystem.factors.f2.d4'), t('scoreSystem.factors.f2.d5')],
                            },
                            {
                                weight: '20%', color: 'orange',
                                name: t('scoreSystem.factors.f3.name'),
                                description: t('scoreSystem.factors.f3.desc'),
                                details: [t('scoreSystem.factors.f3.d1'), t('scoreSystem.factors.f3.d2'), t('scoreSystem.factors.f3.d3')],
                            },
                            {
                                weight: '20%', color: 'red',
                                name: t('scoreSystem.factors.f4.name'),
                                description: t('scoreSystem.factors.f4.desc'),
                                details: [t('scoreSystem.factors.f4.d1'), t('scoreSystem.factors.f4.d2'), t('scoreSystem.factors.f4.d3'), t('scoreSystem.factors.f4.d4'), t('scoreSystem.factors.f4.d5')],
                            },
                            {
                                weight: '10%', color: 'emerald',
                                name: t('scoreSystem.factors.f5.name'),
                                description: t('scoreSystem.factors.f5.desc'),
                                details: [t('scoreSystem.factors.f5.d1'), t('scoreSystem.factors.f5.d2'), t('scoreSystem.factors.f5.d3'), t('scoreSystem.factors.f5.d4'), t('scoreSystem.factors.f5.d5')],
                            },
                        ].map((factor) => (
                            <div key={factor.name} className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-start gap-4">
                                <div className={`w-14 h-14 rounded-xl bg-${factor.color}-100 flex items-center justify-center flex-shrink-0`}>
                                    <span className={`text-lg font-bold text-${factor.color}-600`}>{factor.weight}</span>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-slate-900 mb-1">{factor.name}</h3>
                                    <p className="text-sm text-slate-500 mb-3">{factor.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {factor.details.map((d, i) => (
                                            <span key={i} className="text-xs bg-slate-50 rounded-lg px-3 py-1.5 text-slate-600 border border-slate-100">{d}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Formula */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-center">
                        <div className="text-sm text-slate-400 mb-2">{t('scoreSystem.formulaTitle')}</div>
                        <div className="text-white font-mono text-sm md:text-base leading-relaxed">
                            {t.rich('scoreSystem.formula', {
                                segment: (chunks) => <span className="text-blue-400">{chunks}</span>,
                                start: (chunks) => <span className="text-amber-400">{chunks}</span>,
                                skipped: (chunks) => <span className="text-orange-400">{chunks}</span>,
                                incidents: (chunks) => <span className="text-red-400">{chunks}</span>,
                                guide: (chunks) => <span className="text-emerald-400">{chunks}</span>
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Status Zones */}
            <section className="py-16 bg-white border-y border-slate-100 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">{t('statusZones.tag')}</span>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">{t('statusZones.title')}</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">{t('statusZones.desc')}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="rounded-2xl p-6 border-2 border-emerald-200 bg-emerald-50">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">🟢</span>
                                <div>
                                    <div className="text-2xl font-bold text-emerald-700">80–100</div>
                                    <div className="font-semibold text-emerald-600">{t('statusZones.healthy.title')}</div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600">{t('statusZones.healthy.desc')}</p>
                        </div>

                        <div className="rounded-2xl p-6 border-2 border-amber-200 bg-amber-50">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">🟡</span>
                                <div>
                                    <div className="text-2xl font-bold text-amber-700">60–79</div>
                                    <div className="font-semibold text-amber-600">{t('statusZones.minorRisk.title')}</div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600">{t('statusZones.minorRisk.desc')}</p>
                        </div>

                        <div className="rounded-2xl p-6 border-2 border-orange-200 bg-orange-50">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">🟠</span>
                                <div>
                                    <div className="text-2xl font-bold text-orange-700">40–59</div>
                                    <div className="font-semibold text-orange-600">{t('statusZones.atRisk.title')}</div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600">{t('statusZones.atRisk.desc')}</p>
                        </div>

                        <div className="rounded-2xl p-6 border-2 border-red-200 bg-red-50">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">🔴</span>
                                <div>
                                    <div className="text-2xl font-bold text-red-700">0–39</div>
                                    <div className="font-semibold text-red-600">{t('statusZones.critical.title')}</div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600">{t('statusZones.critical.desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Health State Machine */}
            <section className="py-16 bg-slate-50 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2 block">{t('stateMachine.tag')}</span>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">{t('stateMachine.title')}</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">{t('stateMachine.desc')}</p>
                    </div>

                    <div className="space-y-4 mb-10">
                        {[
                            {
                                state: t('stateMachine.states.healthy.title'), emoji: '🟢', priority: 1, color: 'emerald',
                                desc: t('stateMachine.states.healthy.desc'),
                                triggers: [t('stateMachine.states.healthy.t1'), t('stateMachine.states.healthy.t2')],
                            },
                            {
                                state: t('stateMachine.states.atRisk.title'), emoji: '🟡', priority: 2, color: 'amber',
                                desc: t('stateMachine.states.atRisk.desc'),
                                triggers: [t('stateMachine.states.atRisk.t1'), t('stateMachine.states.atRisk.t2'), t('stateMachine.states.atRisk.t3')],
                            },
                            {
                                state: t('stateMachine.states.delayed.title'), emoji: '🟠', priority: 3, color: 'orange',
                                desc: t('stateMachine.states.delayed.desc'),
                                triggers: [t('stateMachine.states.delayed.t1'), t('stateMachine.states.delayed.t2')],
                            },
                            {
                                state: t('stateMachine.states.incident.title'), emoji: '🔴', priority: 4, color: 'red',
                                desc: t('stateMachine.states.incident.desc'),
                                triggers: [t('stateMachine.states.incident.t1'), t('stateMachine.states.incident.t2'), t('stateMachine.states.incident.t3')],
                            },
                            {
                                state: t('stateMachine.states.sosActive.title'), emoji: '🟣', priority: 5, color: 'purple',
                                desc: t('stateMachine.states.sosActive.desc'),
                                triggers: [t('stateMachine.states.sosActive.t1'), t('stateMachine.states.sosActive.t2'), t('stateMachine.states.sosActive.t3')],
                            },
                        ].map((s, idx) => (
                            <div key={idx} className={`bg-white rounded-2xl p-6 border border-${s.color}-200 flex flex-col sm:flex-row items-start gap-4`}>
                                <div className="flex items-center gap-3 sm:w-48 flex-shrink-0">
                                    <span className="text-2xl">{s.emoji}</span>
                                    <div>
                                        <div className="font-mono font-bold text-sm text-slate-900">{s.state}</div>
                                        <div className="text-xs text-slate-400">Priority {s.priority}</div>
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm text-slate-600 mb-2">{s.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {s.triggers.map((t, i) => (
                                            <span key={i} className="text-xs bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-slate-600">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Priority note */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-center">
                        <div className="text-sm text-slate-400 mb-2">{t('stateMachine.prioritySystem')}</div>
                        <div className="text-white font-mono text-sm leading-relaxed whitespace-pre-line">
                            {t.rich('stateMachine.priorityChain', {
                                sos: (chunks) => <span className="text-purple-400">{chunks}</span>,
                                incident: (chunks) => <span className="text-red-400">{chunks}</span>,
                                delayed: (chunks) => <span className="text-orange-400">{chunks}</span>,
                                risk: (chunks) => <span className="text-amber-400">{chunks}</span>,
                                healthy: (chunks) => <span className="text-emerald-400">{chunks}</span>
                            })}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{t('stateMachine.priorityDesc')}</p>
                    </div>
                </div>
            </section>

            {/* Who Sees What */}
            <section className="py-16 bg-white border-y border-slate-100 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">{t('whoSeesWhat.title')}</h2>
                        <p className="text-slate-500 max-w-lg mx-auto text-sm">{t('whoSeesWhat.desc')}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center">
                            <div className="text-3xl mb-3">🏢</div>
                            <div className="font-bold text-slate-900 mb-2">{t('whoSeesWhat.operator.title')}</div>
                            <div className="text-sm text-slate-500 space-y-1">
                                <p>{t.rich('whoSeesWhat.operator.i1', { strong: (chunks) => <strong>{chunks}</strong> })}</p>
                                <p>{t('whoSeesWhat.operator.i2')}</p>
                                <p>{t('whoSeesWhat.operator.i3')}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center">
                            <div className="text-3xl mb-3">👨‍💼</div>
                            <div className="font-bold text-slate-900 mb-2">{t('whoSeesWhat.admin.title')}</div>
                            <div className="text-sm text-slate-500 space-y-1">
                                <p>{t('whoSeesWhat.admin.i1')}</p>
                                <p>{t('whoSeesWhat.admin.i2')}</p>
                                <p>{t('whoSeesWhat.admin.i3')}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center">
                            <div className="text-3xl mb-3">🔔</div>
                            <div className="font-bold text-slate-900 mb-2">{t('whoSeesWhat.alert.title')}</div>
                            <div className="text-sm text-slate-500 space-y-1">
                                <p>{t('whoSeesWhat.alert.i1')}</p>
                                <p>{t('whoSeesWhat.alert.i2')}</p>
                                <p>{t('whoSeesWhat.alert.i3')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Integration */}
            <section className="py-16 bg-slate-50 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">{t('integratedWith.title')}</h2>
                        <p className="text-slate-500 max-w-lg mx-auto text-sm">{t('integratedWith.desc')}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { icon: '📡', ...t.raw('integratedWith.items.cc') as {name: string, desc: string} },
                            { icon: '🚨', ...t.raw('integratedWith.items.sos') as {name: string, desc: string} },
                            { icon: '📋', ...t.raw('integratedWith.items.ir') as {name: string, desc: string} },
                            { icon: '🔔', ...t.raw('integratedWith.items.ae') as {name: string, desc: string} },
                            { icon: '📊', ...t.raw('integratedWith.items.et') as {name: string, desc: string} },
                            { icon: '🔄', ...t.raw('integratedWith.items.gr') as {name: string, desc: string} },
                            { icon: '🛡️', ...t.raw('integratedWith.items.ts') as {name: string, desc: string} },
                            { icon: '💰', ...t.raw('integratedWith.items.es') as {name: string, desc: string} },
                        ].map((item, index) => (
                            <div key={index} className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                                <div className="text-xl mb-2">{item.icon}</div>
                                <div className="font-semibold text-xs text-slate-900">{item.name}</div>
                                <div className="text-xs text-slate-400">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-white border-t border-slate-100 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('cta.title')}</h2>
                    <p className="text-slate-500 mb-8">{t('cta.desc')}</p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link href="/signup" className="px-8 py-4 rounded-xl bg-lunavia-primary text-white font-semibold hover:bg-lunavia-primary-hover transition shadow-lg shadow-[#2E8BC0]/20 text-lg">
                            {t('cta.start')}
                        </Link>
                        <Link href="/trust-safety" className="px-8 py-4 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 transition text-lg shadow-sm">
                            {t('cta.trustSafety')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
