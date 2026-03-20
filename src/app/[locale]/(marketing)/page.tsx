import { Link } from '@/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
    const t = await getTranslations('Home');
    const session = await getServerSession(authOptions);
    if (session?.user) redirect('/dashboard');

    return (
        <div className="overflow-hidden">
            {/* ─── Hero ─── */}
            <section className="relative pt-28 pb-36 overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-indigo-50/50 to-slate-50" />
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-200/30 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-indigo-200/20 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 text-center relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 mb-8">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {t('hero.badge')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8 max-w-5xl mx-auto leading-[1.1]">
                        {t('hero.title1')}
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {t('hero.title2')}
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                        {t('hero.subtitle')}
                    </p>

                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link href="/signup" className="group px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 text-lg flex items-center gap-2">
                            {t('hero.cta1')}
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </Link>
                        <Link href="/about" className="px-8 py-4 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition text-lg shadow-sm">
                            {t('hero.cta2')}
                        </Link>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="mt-24 max-w-4xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { value: t('stats.val1'), label: t('stats.label1') },
                            { value: t('stats.val2'), label: t('stats.label2') },
                            { value: t('stats.val3'), label: t('stats.label3') },
                            { value: t('stats.val4'), label: t('stats.label4') },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                <div className="text-xl font-bold text-slate-900 mb-1">{stat.value}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Core Modules ─── */}
            <section className="py-28 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 block">{t('modules.badge')}</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">{t('modules.title')}</h2>
                        <p className="text-slate-500 text-lg">{t('modules.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Tour Management */}
                        <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 shadow-sm">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
                                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('modules.m1.title')}</h3>
                            <p className="text-slate-500 leading-relaxed">{t('modules.m1.desc')}</p>
                        </div>

                        {/* Guide Marketplace */}
                        <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 shadow-sm">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6">
                                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('modules.m2.title')}</h3>
                            <p className="text-slate-500 leading-relaxed">{t('modules.m2.desc')}</p>
                        </div>

                        {/* Escrow & Trust */}
                        <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 shadow-sm">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6">
                                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('modules.m3.title')}</h3>
                            <p className="text-slate-500 leading-relaxed">{t('modules.m3.desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Hybrid Model ─── */}
            <section className="py-28 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4 block">{t('hybrid.badge')}</span>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                {t('hybrid.title1')}
                                <span className="text-slate-400">{t('hybrid.title2')}</span>
                            </h2>
                            <p className="text-lg text-slate-500 leading-relaxed mb-8">
                                {t('hybrid.subtitle')}
                            </p>
                            <div className="space-y-4">
                                {[
                                    { title: t('hybrid.assign.title'), desc: t('hybrid.assign.desc') },
                                    { title: t('hybrid.open.title'), desc: t('hybrid.open.desc') },
                                ].map((item) => (
                                    <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center">
                                            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900 mb-1">{item.title}</div>
                                            <div className="text-sm text-slate-500">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visual diagram */}
                        <div className="relative">
                            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-10">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        <span className="font-semibold text-blue-700 text-sm">{t('hybrid.diagram.operator')}</span>
                                    </div>
                                </div>
                                <div className="flex justify-center mb-6">
                                    <div className="w-px h-8 bg-gradient-to-b from-blue-300 to-transparent"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 mx-auto mb-3 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <div className="font-semibold text-emerald-700 text-sm mb-1">{t('hybrid.diagram.inHouse')}</div>
                                        <div className="text-xs text-slate-500">{t('hybrid.diagram.inHouseDesc')}</div>
                                    </div>
                                    <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-6 text-center">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 mx-auto mb-3 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 019-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                        </div>
                                        <div className="font-semibold text-indigo-700 text-sm mb-1">{t('hybrid.diagram.marketplace')}</div>
                                        <div className="text-xs text-slate-500">{t('hybrid.diagram.marketplaceDesc')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Compliance & Governance ─── */}
            <section className="py-28 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 block">{t('compliance.badge')}</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">{t('compliance.title')}</h2>
                        <p className="text-slate-500 text-lg">{t('compliance.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                                title: t('compliance.c1.title'),
                                desc: t('compliance.c1.desc'),
                                color: 'blue',
                            },
                            {
                                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
                                title: t('compliance.c2.title'),
                                desc: t('compliance.c2.desc'),
                                color: 'indigo',
                            },
                            {
                                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
                                title: t('compliance.c3.title'),
                                desc: t('compliance.c3.desc'),
                                color: 'emerald',
                            },
                            {
                                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
                                title: t('compliance.c4.title'),
                                desc: t('compliance.c4.desc'),
                                color: 'amber',
                            },
                        ].map((item) => {
                            const colorMap: Record<string, string> = {
                                blue: 'bg-blue-50 border-blue-100 text-blue-600',
                                indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
                                emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
                                amber: 'bg-amber-50 border-amber-100 text-amber-600',
                            };
                            return (
                                <div key={item.title} className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300 shadow-sm">
                                    <div className={`w-12 h-12 rounded-xl ${colorMap[item.color]} border flex items-center justify-center mb-5`}>
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── Money Flow Transparency ─── */}
            <section className="py-28 bg-gradient-to-b from-white to-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 block">{t('moneyFlow.badge')}</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">{t('moneyFlow.title')}</h2>
                        <p className="text-slate-500 text-lg">{t('moneyFlow.subtitle')}</p>
                    </div>

                    {/* Flow Diagram — 4 steps */}
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
                            {/* Step 1: Deposit 10% */}
                            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-6 text-center">
                                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                                <h3 className="font-bold text-blue-900 mb-2">{t('moneyFlow.step1.title')}</h3>
                                <p className="text-sm text-blue-700 leading-relaxed">{t('moneyFlow.step1.desc')}</p>
                                <div className="mt-4 px-3 py-2 rounded-xl bg-blue-100 border border-blue-200">
                                    <div className="text-xs text-blue-600 font-medium">{t('moneyFlow.step1.example')}</div>
                                    <div className="text-lg font-bold text-blue-800">{t('moneyFlow.step1.amount')}</div>
                                </div>
                            </div>

                            {/* Step 2: Full Escrow */}
                            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center">
                                <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                                <h3 className="font-bold text-amber-900 mb-2">{t('moneyFlow.step2.title')}</h3>
                                <p className="text-sm text-amber-700 leading-relaxed">{t('moneyFlow.step2.desc')}</p>
                                <div className="mt-4 px-3 py-2 rounded-xl bg-amber-100 border border-amber-200">
                                    <div className="text-xs text-amber-600 font-medium">{t('moneyFlow.step2.example')}</div>
                                    <div className="text-lg font-bold text-amber-800">🔒 {t('moneyFlow.step2.amount')}</div>
                                </div>
                            </div>

                            {/* Step 3: Tour Completed */}
                            <div className="rounded-2xl bg-violet-50 border border-violet-200 p-6 text-center">
                                <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                                <h3 className="font-bold text-violet-900 mb-2">{t('moneyFlow.step3.title')}</h3>
                                <p className="text-sm text-violet-700 leading-relaxed">{t('moneyFlow.step3.desc')}</p>
                                <div className="mt-4 px-3 py-2 rounded-xl bg-violet-100 border border-violet-200">
                                    <div className="text-xs text-violet-600 font-medium">{t('moneyFlow.step3.example')}</div>
                                    <div className="text-lg font-bold text-violet-800">{t('moneyFlow.step3.status')}</div>
                                </div>
                            </div>

                            {/* Step 4: Guide Payout */}
                            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
                                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
                                <h3 className="font-bold text-emerald-900 mb-2">{t('moneyFlow.step4.title')}</h3>
                                <p className="text-sm text-emerald-700 leading-relaxed">{t('moneyFlow.step4.desc')}</p>
                                <div className="mt-4 px-3 py-2 rounded-xl bg-emerald-100 border border-emerald-200">
                                    <div className="text-xs text-emerald-600 font-medium">{t('moneyFlow.step4.example')}</div>
                                    <div className="text-lg font-bold text-emerald-800">{t('moneyFlow.step4.amount')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Fee summary */}
                        <div className="mt-10 rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">5%</div>
                                    <div className="text-sm text-slate-600 mt-1">{t('moneyFlow.fees.operator')}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{t('moneyFlow.fees.operatorNote')}</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-amber-600">10%</div>
                                    <div className="text-sm text-slate-600 mt-1">{t('moneyFlow.fees.deposit')}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{t('moneyFlow.fees.depositNote')}</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-indigo-600">2-5%</div>
                                    <div className="text-sm text-slate-600 mt-1">{t('moneyFlow.fees.guide')}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{t('moneyFlow.fees.guideNote')}</div>
                                </div>
                            </div>
                        </div>

                        <p className="text-center text-xs text-slate-400 mt-4">{t('moneyFlow.disclaimer')}</p>
                    </div>
                </div>
            </section>
            <section className="py-28 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 block">{t('howItWorks.badge')}</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">{t('howItWorks.title')}</h2>
                        <p className="text-slate-500 text-lg">{t('howItWorks.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Operator Flow */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg">🏢</div>
                                <h3 className="text-xl font-bold text-slate-900">{t('howItWorks.operatorTitle')}</h3>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { step: '1', title: t('howItWorks.os1.title'), desc: t('howItWorks.os1.desc') },
                                    { step: '2', title: t('howItWorks.os2.title'), desc: t('howItWorks.os2.desc') },
                                    { step: '3', title: t('howItWorks.os3.title'), desc: t('howItWorks.os3.desc') },
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">{item.step}</div>
                                        <div>
                                            <div className="font-semibold text-slate-900 mb-1">{item.title}</div>
                                            <div className="text-sm text-slate-500">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Guide Flow */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg">🧭</div>
                                <h3 className="text-xl font-bold text-slate-900">{t('howItWorks.guideTitle')}</h3>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { step: '1', title: t('howItWorks.gs1.title'), desc: t('howItWorks.gs1.desc') },
                                    { step: '2', title: t('howItWorks.gs2.title'), desc: t('howItWorks.gs2.desc') },
                                    { step: '3', title: t('howItWorks.gs3.title'), desc: t('howItWorks.gs3.desc') },
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">{item.step}</div>
                                        <div>
                                            <div className="font-semibold text-slate-900 mb-1">{item.title}</div>
                                            <div className="text-sm text-slate-500">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Two Products ─── */}
            <section className="py-28 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4 block">{t('products.badge')}</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">{t('products.title')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Marketplace */}
                        <div className="group p-10 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 shadow-sm">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-8 text-3xl">🌐</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">{t('products.marketplace.title')}</h3>
                            <p className="text-slate-500 leading-relaxed mb-6">
                                {t('products.marketplace.desc1')}<strong className="text-slate-700">{t('products.marketplace.descHighlight')}</strong>{t('products.marketplace.desc2')}
                            </p>
                            <div className="space-y-2 mb-8">
                                {[t('products.marketplace.f1'), t('products.marketplace.f2'), t('products.marketplace.f3'), t('products.marketplace.f4')].map((f) => (
                                    <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        {f}
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-slate-500 mb-6">{t('products.marketplace.pricePrefix')}<strong className="text-slate-900">{t('products.marketplace.priceDisplay')}</strong>{t('products.marketplace.priceSuffix')}</div>
                            <Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
                                {t('products.marketplace.cta')}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </Link>
                        </div>

                        {/* Operations */}
                        <div className="group p-10 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 shadow-sm">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-8 text-3xl">🏢</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">{t('products.operations.title')}</h3>
                            <p className="text-slate-500 leading-relaxed mb-6">
                                {t('products.operations.desc1')}<strong className="text-slate-700">{t('products.operations.descHighlight')}</strong>{t('products.operations.desc2')}
                            </p>
                            <div className="space-y-2 mb-8">
                                {[t('products.operations.f1'), t('products.operations.f2'), t('products.operations.f3'), t('products.operations.f4')].map((f) => (
                                    <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                                        <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        {f}
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-slate-500 mb-6">{t('products.operations.pricePrefix')}<strong className="text-slate-900">{t('products.operations.priceDisplay')}</strong>{t('products.operations.priceSuffix')}</div>
                            <Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
                                {t('products.operations.cta')}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="py-28 bg-gradient-to-b from-slate-50 to-blue-50 relative overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-200/30 rounded-full blur-[120px]" />
                </div>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">{t('cta.title')}</h2>
                    <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">{t('cta.subtitle')}</p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link href="/signup" className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/25 text-lg">
                            {t('cta.btn1')}
                        </Link>
                        <Link href="/pricing" className="px-8 py-4 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 transition text-lg shadow-sm">
                            {t('cta.btn2')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
