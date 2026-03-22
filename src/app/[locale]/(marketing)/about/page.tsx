import { getTranslations } from 'next-intl/server';

export default async function AboutPage() {
    const t = await getTranslations('MarketingAbout');
    return (
        <div className="overflow-hidden">
            {/* ─── Hero ─── */}
            <section className="relative pt-28 pb-24 px-6">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-blue-50/50 to-slate-50" />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-200/30 rounded-full blur-[120px]" />
                </div>
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F4FD] border border-[#5BA4CF]/30 text-xs font-semibold text-[#2E8BC0] mb-8">
                        <svg className="w-3.5 h-3.5 text-[#5BA4CF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        {t('hero.badge')}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                        {t('hero.title1')}{' '}
                        <span className="bg-gradient-to-r from-[#5BA4CF] to-lunavia-primary bg-clip-text text-transparent">
                            {t('hero.title2')}
                        </span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        {t('hero.subtitle')}
                    </p>
                </div>
            </section>

            {/* ─── Vision ─── */}
            <section className="py-24 px-6 bg-white border-y border-slate-100">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-xs font-bold text-lunavia-primary uppercase tracking-widest mb-4 block">{t('vision.badge')}</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                                {t('vision.title')}
                            </h2>
                            <p className="text-slate-500 leading-relaxed mb-6">
                                {t('vision.desc1')}
                            </p>
                            <p className="text-slate-500 leading-relaxed">
                                {t('vision.desc2')}
                            </p>
                        </div>
                        <div className="rounded-3xl bg-slate-50 border border-slate-200 p-10 shadow-sm">
                            <div className="space-y-6">
                                {[
                                    { metric: t('vision.m1Value'), label: t('vision.m1Label'), color: 'text-lunavia-primary' },
                                    { metric: t('vision.m2Value'), label: t('vision.m2Label'), color: 'text-emerald-600' },
                                    { metric: t('vision.m3Value'), label: t('vision.m3Label'), color: 'text-[#5BA4CF]' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                        <span className={`text-2xl font-bold ${item.color} whitespace-nowrap`}>{item.metric}</span>
                                        <span className="text-sm text-slate-500 mt-1">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Infrastructure First ─── */}
            <section className="py-24 bg-slate-50 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-bold text-[#5BA4CF] uppercase tracking-widest mb-4 block">{t('approach.badge')}</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{t('approach.title')}</h2>
                        <p className="text-slate-500 text-lg">
                            {t('approach.subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
                                title: t('approach.c1Title'),
                                desc: t('approach.c1Desc'),
                                color: 'blue',
                            },
                            {
                                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
                                title: t('approach.c2Title'),
                                desc: t('approach.c2Desc'),
                                color: 'emerald',
                            },
                            {
                                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
                                title: t('approach.c3Title'),
                                desc: t('approach.c3Desc'),
                                color: 'indigo',
                            },
                        ].map((item) => {
                            const colorMap: Record<string, string> = {
                                blue: 'bg-lunavia-light border-lunavia-muted/40 text-lunavia-primary',
                                emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
                                indigo: 'bg-[#E8F4FD] border-[#5BA4CF]/20 text-[#5BA4CF]',
                            };
                            return (
                                <div key={item.title} className="p-8 rounded-2xl bg-white border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300 shadow-sm">
                                    <div className={`w-12 h-12 rounded-xl ${colorMap[item.color]} border flex items-center justify-center mb-5`}>
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── Regulatory Compliance ─── */}
            <section className="py-24 px-6 bg-white border-y border-slate-100">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="rounded-3xl bg-slate-50 border border-slate-200 p-8 shadow-sm">
                                <div className="space-y-4">
                                    {(t.raw('compliance.items') as string[]).map((item) => (
                                        <div key={item} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <span className="text-sm text-slate-600">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 block">{t('compliance.badge')}</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                                {t('compliance.title')}
                            </h2>
                            <p className="text-slate-500 leading-relaxed mb-6">
                                {t('compliance.desc1')}
                            </p>
                            <p className="text-slate-500 leading-relaxed">
                                {t('compliance.desc2')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Long-term Vision ─── */}
            <section className="py-24 bg-gradient-to-b from-slate-50 to-blue-50 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-xs font-bold text-[#5BA4CF] uppercase tracking-widest mb-4 block">{t('visionLong.badge')}</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
                        {t('visionLong.title')}
                    </h2>
                    <p className="text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed mb-12">
                        {t('visionLong.subtitle')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        {[
                            {
                                phase: t('visionLong.p1Phase'),
                                title: t('visionLong.p1Title'),
                                desc: t('visionLong.p1Desc'),
                                color: 'blue',
                            },
                            {
                                phase: t('visionLong.p2Phase'),
                                title: t('visionLong.p2Title'),
                                desc: t('visionLong.p2Desc'),
                                color: 'indigo',
                            },
                            {
                                phase: t('visionLong.p3Phase'),
                                title: t('visionLong.p3Title'),
                                desc: t('visionLong.p3Desc'),
                                color: 'violet',
                            },
                        ].map((item) => {
                            const colorMap: Record<string, string> = {
                                blue: 'text-lunavia-primary-hover bg-lunavia-light border-lunavia-muted/60',
                                indigo: 'text-[#2E8BC0] bg-[#E8F4FD] border-[#5BA4CF]/30',
                                violet: 'text-violet-700 bg-violet-50 border-violet-200',
                            };
                            return (
                                <div key={item.phase} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border mb-4 ${colorMap[item.color]}`}>
                                        {item.phase}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}
