import Link from 'next/link';

export default function DocumentationPage() {
    return (
        <div className="overflow-hidden">
            {/* Header */}
            <section className="relative pt-28 pb-16 px-6">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-[#E8F4FD]/50 to-slate-50" />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-200/30 rounded-full blur-[120px]" />
                </div>
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F4FD] border border-[#5BA4CF]/30 text-xs font-semibold text-[#2E8BC0] mb-8">
                        <svg className="w-3.5 h-3.5 text-[#5BA4CF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        Product Documentation
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
                        How Lunavia Works
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        A deeper look at the platform logic, compliance structure, and operational model for serious operators.
                    </p>
                </div>
            </section>

            {/* Table of Contents */}
            <section className="px-6 pb-16">
                <div className="max-w-4xl mx-auto">
                    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">On This Page</h3>
                        <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                                { label: 'Operator Categories', anchor: '#operator-categories' },
                                { label: 'Trust Score', anchor: '#trust-score' },
                                { label: 'Risk Levels', anchor: '#risk-levels' },
                                { label: 'Escrow Protection', anchor: '#escrow' },
                                { label: 'Hybrid Model', anchor: '#hybrid-model' },
                                { label: 'Compliance Transparency', anchor: '#compliance' },
                            ].map((item) => (
                                <a key={item.anchor} href={item.anchor} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-lunavia-primary hover:bg-lunavia-light transition">
                                    <svg className="w-4 h-4 text-lunavia-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
            </section>

            {/* ─── Operator Categories ─── */}
            <section id="operator-categories" className="py-16 px-6 scroll-mt-24">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-lunavia-light border border-lunavia-muted/60 flex items-center justify-center">
                            <svg className="w-5 h-5 text-lunavia-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Operator Categories</h2>
                    </div>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Lunavia recognizes different types of tour operators, each with specific compliance requirements and capabilities. This categorization ensures that the right tools and oversight are applied to each business model.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { type: 'Licensed Operator', desc: 'Fully licensed tour companies with government-issued operating permits. Highest compliance tier with access to all platform features.', badge: 'Full Access', color: 'emerald' },
                            { type: 'Agency Operator', desc: 'Travel agencies that coordinate tours through licensed providers. Standard compliance requirements with marketplace and booking access.', badge: 'Standard Access', color: 'blue' },
                            { type: 'Sole Operator', desc: 'Individual professionals operating under personal registration. Reduced tour limits with graduated compliance as they grow.', badge: 'Starter Access', color: 'amber' },
                        ].map((cat) => {
                            const colorMap: Record<string, string> = {
                                emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                                blue: 'bg-lunavia-light border-lunavia-muted/60 text-lunavia-primary-hover',
                                amber: 'bg-amber-50 border-amber-200 text-amber-700',
                            };
                            return (
                                <div key={cat.type} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border mb-4 ${colorMap[cat.color]}`}>
                                        {cat.badge}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{cat.type}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{cat.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6"><hr className="border-slate-200" /></div>

            {/* ─── Trust Score ─── */}
            <section id="trust-score" className="py-16 px-6 scroll-mt-24">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F4FD] border border-[#5BA4CF]/30 flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#5BA4CF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Trust Score</h2>
                    </div>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Every participant on Lunavia has a Trust Score. This score is a transparent, merit-based metric
                        that reflects real operational performance across the platform.
                    </p>
                    <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-6">Key Principles</h3>
                        <div className="space-y-4">
                            {[
                                { title: 'Earned, not purchased', desc: 'Trust is accumulated through verified performance — completed tours, positive feedback, compliance adherence.' },
                                { title: 'Transparent to all parties', desc: 'Both operators and guides can see trust metrics. Scores are visible on profiles and during tour matching.' },
                                { title: 'Dynamic and fair', desc: 'Scores adjust based on recent activity. A single incident does not permanently affect standing, but patterns do.' },
                                { title: 'Affects marketplace visibility', desc: 'Higher trust scores lead to better ranking in marketplace results, rewarding consistent, quality service.' },
                            ].map((item) => (
                                <div key={item.title} className="flex gap-4">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-[#B2DBF1]/50 flex-shrink-0 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-[#5BA4CF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 mb-1">{item.title}</div>
                                        <div className="text-sm text-slate-500">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6"><hr className="border-slate-200" /></div>

            {/* ─── Risk Levels ─── */}
            <section id="risk-levels" className="py-16 px-6 scroll-mt-24">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Risk Levels</h2>
                    </div>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Lunavia classifies participants into risk levels based on trust score trends, compliance history, and incident records.
                        These levels determine the intensity of platform oversight.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { level: 'Green', desc: 'Good standing. Full platform access, standard monitoring. The default for verified participants with positive track records.', dot: 'bg-emerald-500', border: 'border-emerald-200 bg-emerald-50' },
                            { level: 'Yellow', desc: 'Under review. Triggered by declining trust scores or minor compliance flags. Enhanced monitoring with possible restrictions.', dot: 'bg-amber-500', border: 'border-amber-200 bg-amber-50' },
                            { level: 'Red', desc: 'High risk. Serious compliance violations or sustained negative performance. Limited marketplace access pending review.', dot: 'bg-red-500', border: 'border-red-200 bg-red-50' },
                        ].map((risk) => (
                            <div key={risk.level} className={`rounded-2xl border p-6 ${risk.border}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-3 h-3 rounded-full ${risk.dot}`} />
                                    <h3 className="text-lg font-bold text-slate-900">{risk.level}</h3>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">{risk.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6"><hr className="border-slate-200" /></div>

            {/* ─── Escrow Protection ─── */}
            <section id="escrow" className="py-16 px-6 scroll-mt-24">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Escrow Protection</h2>
                    </div>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        All financial transactions on Lunavia are protected through an escrow mechanism. This ensures that funds are only released when both parties confirm successful service delivery.
                    </p>
                    <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-6">How Escrow Works</h3>
                        <div className="space-y-6">
                            {[
                                { step: '01', title: 'Funds Held', desc: 'When a tour is confirmed, payment is collected and held in escrow by the platform.' },
                                { step: '02', title: 'Service Delivered', desc: 'The operator conducts the tour with the assigned guide. Both parties operate with confidence.' },
                                { step: '03', title: 'Confirmation', desc: 'Upon tour completion, the operator confirms delivery. Disputes can be raised within a defined window.' },
                                { step: '04', title: 'Funds Released', desc: 'After confirmation (or dispute resolution), funds are released to the guide minus platform commission.' },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-5">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex-shrink-0 flex items-center justify-center">
                                        <span className="text-sm font-bold text-emerald-600">{item.step}</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 mb-1">{item.title}</div>
                                        <div className="text-sm text-slate-500">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6"><hr className="border-slate-200" /></div>

            {/* ─── Hybrid Model ─── */}
            <section id="hybrid-model" className="py-16 px-6 scroll-mt-24">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F4FD] border border-[#5BA4CF]/30 flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#5BA4CF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Hybrid Model</h2>
                    </div>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        The Hybrid Model allows operators to use a mix of in-house and marketplace guides for their tours.
                        This flexible workforce approach ensures optimal coverage regardless of demand fluctuations.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">In-House Guides</h3>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>Directly employed or contracted by the operator</li>
                                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>Not visible on the public marketplace</li>
                                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>Assigned to tours without application process</li>
                                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>Contract-verified for compliance</li>
                            </ul>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-[#E8F4FD] border border-[#5BA4CF]/30 flex items-center justify-center mb-4">
                                <svg className="w-5 h-5 text-[#5BA4CF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Marketplace Guides</h3>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li className="flex items-start gap-2"><span className="text-[#5BA4CF] mt-0.5">•</span>Independent, verified freelance professionals</li>
                                <li className="flex items-start gap-2"><span className="text-[#5BA4CF] mt-0.5">•</span>Discoverable through the public marketplace</li>
                                <li className="flex items-start gap-2"><span className="text-[#5BA4CF] mt-0.5">•</span>Apply to open tour positions posted by operators</li>
                                <li className="flex items-start gap-2"><span className="text-[#5BA4CF] mt-0.5">•</span>Escrow-protected engagement terms</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6"><hr className="border-slate-200" /></div>

            {/* ─── Compliance Transparency ─── */}
            <section id="compliance" className="py-16 px-6 scroll-mt-24">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
                            <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Compliance Transparency</h2>
                    </div>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Lunavia provides a transparent compliance framework that lets participants understand their standing,
                        obligations, and the platform&apos;s expectations at every interaction point.
                    </p>
                    <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { title: 'Identity Verification', desc: 'All operators and guides complete identity verification (KYC/KYB) before accessing core features.' },
                                { title: 'Document Management', desc: 'Licenses, certifications, and permits are stored, tracked, and flagged for renewal.' },
                                { title: 'Audit Trail', desc: 'Every significant action is logged with timestamps, actors, and contexts for traceability.' },
                                { title: 'Incident Reporting', desc: 'Structured reporting workflow for operational incidents, with automatic risk level reassessment.' },
                            ].map((item) => (
                                <div key={item.title} className="flex gap-4">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-violet-100 flex-shrink-0 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 mb-1">{item.title}</div>
                                        <div className="text-sm text-slate-500">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-gradient-to-b from-slate-50 to-blue-50">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to get started?</h2>
                    <p className="text-slate-500 mb-8">Join the platform built for compliant, transparent operations.</p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link href="/signup" className="px-8 py-4 rounded-xl bg-lunavia-primary text-white font-semibold hover:bg-lunavia-primary-hover transition shadow-lg shadow-[#2E8BC0]/20">
                            Start Free
                        </Link>
                        <Link href="/pricing" className="px-8 py-4 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 transition shadow-sm">
                            View Pricing
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
