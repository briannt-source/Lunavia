import Link from 'next/link';

export const metadata = {
    title: 'Verification Guide — Lunavia',
    description: 'Everything you need to know about KYC and KYB verification on Lunavia. Document requirements, accepted formats, and review timeline.',
};

const Shield = () => (
    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const DocIcon = () => (
    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export default function VerificationGuidePage() {
    return (
        <div className="overflow-hidden">
            {/* Hero */}
            <section className="relative pt-28 pb-16 text-center px-6">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-blue-50/30 to-slate-50" />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-200/30 rounded-full blur-[120px]" />
                </div>

                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-6">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    Verification Guide
                </span>

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                    Get verified on Lunavia
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    Verification protects everyone on the platform — operators, guides, and travelers. Here&apos;s exactly what you need and why.
                </p>
            </section>

            {/* Why Verification */}
            <section className="pb-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Why verification matters</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">Lunavia uses identity verification (KYC/KYB) to create a trusted ecosystem where everyone operates transparently.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { icon: '🛡️', title: 'Trust & Safety', desc: 'Verified accounts earn higher trust scores, get priority in matching, and access more features.' },
                            { icon: '💰', title: 'Financial Protection', desc: 'Verification is required before handling escrow payments — protecting both operators and guides.' },
                            { icon: '⚖️', title: 'Regulatory Compliance', desc: 'Tourism regulations require licensed operators and guides. Verification ensures legal compliance.' },
                        ].map((item) => (
                            <div key={item.title} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
                                <div className="text-3xl mb-3">{item.icon}</div>
                                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ KYB — OPERATOR VERIFICATION ═══ */}
            <section className="py-16 bg-white border-y border-slate-100 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 block">For Operators (KYB)</span>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Operator Verification</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">Know Your Business (KYB) verification confirms your legal business status. Requirements depend on your operator category.</p>
                    </div>

                    {/* Tour Operator */}
                    <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg">🏛️</span>
                            <div>
                                <h3 className="font-bold text-slate-900">Licensed Tour Operator</h3>
                                <p className="text-xs text-blue-600 font-semibold">Highest trust tier — up to 90 trust points</p>
                            </div>
                        </div>
                        <div className="space-y-3 mt-4">
                            <div className="flex items-start gap-3">
                                <DocIcon />
                                <div>
                                    <div className="font-semibold text-sm text-slate-900">Business Registration Certificate</div>
                                    <div className="text-xs text-slate-500">Official company registration document from the government</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <DocIcon />
                                <div>
                                    <div className="font-semibold text-sm text-slate-900">Tour Operator License</div>
                                    <div className="text-xs text-slate-500">Valid tour operator license issued by the tourism authority</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <DocIcon />
                                <div>
                                    <div className="font-semibold text-sm text-slate-900">Director/Owner ID</div>
                                    <div className="text-xs text-slate-500">National ID card or passport of the company director/owner</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-200">
                            <p className="text-xs text-slate-500"><strong>Also required:</strong> Business Registration Number + Tour Operator License Number</p>
                        </div>
                    </div>

                    {/* Travel Agency */}
                    <div className="bg-purple-50 rounded-2xl p-8 border border-purple-200 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-lg">✈️</span>
                            <div>
                                <h3 className="font-bold text-slate-900">Travel Agency</h3>
                                <p className="text-xs text-purple-600 font-semibold">Mid trust tier — up to 70 trust points</p>
                            </div>
                        </div>
                        <div className="space-y-3 mt-4">
                            <div className="flex items-start gap-3">
                                <DocIcon />
                                <div>
                                    <div className="font-semibold text-sm text-slate-900">Business Registration Certificate</div>
                                    <div className="text-xs text-slate-500">Official company registration from the government</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <DocIcon />
                                <div>
                                    <div className="font-semibold text-sm text-slate-900">Director/Owner ID</div>
                                    <div className="text-xs text-slate-500">National ID card or passport of the company director/owner</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-purple-200">
                            <p className="text-xs text-slate-500"><strong>Also required:</strong> Business Registration Number</p>
                        </div>
                    </div>

                    {/* Sole Proprietor */}
                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-lg">👤</span>
                            <div>
                                <h3 className="font-bold text-slate-900">Sole Proprietor</h3>
                                <p className="text-xs text-slate-500 font-semibold">Entry tier — up to 50 trust points</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">No business documents required. You can verify with just your company logo. However, your trust score will start lower than verified companies.</p>
                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-start gap-2">
                            <Shield />
                            <p className="text-xs text-slate-500">You can upgrade your operator category later by submitting business documents as your company grows.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ KYC — GUIDE VERIFICATION ═══ */}
            <section className="py-16 bg-slate-50 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">For Guides (KYC)</span>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Guide Verification</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">Know Your Customer (KYC) verification confirms your identity and professional credentials as a tour guide.</p>
                    </div>

                    {/* Licensed Guide */}
                    <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-200 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg">🪪</span>
                            <div>
                                <h3 className="font-bold text-slate-900">Licensed Guide</h3>
                                <p className="text-xs text-emerald-600 font-semibold">Can operate as main guide on all tours</p>
                            </div>
                        </div>
                        <div className="space-y-3 mt-4">
                            <div className="flex items-start gap-3">
                                <DocIcon />
                                <div>
                                    <div className="font-semibold text-sm text-slate-900">Identity Documents</div>
                                    <div className="text-xs text-slate-500">National ID card (front &amp; back) or passport — must be valid and clearly readable</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <DocIcon />
                                <div>
                                    <div className="font-semibold text-sm text-slate-900">Proof of Address</div>
                                    <div className="text-xs text-slate-500">Recent utility bill, bank statement, or government letter (within last 3 months)</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <DocIcon />
                                <div>
                                    <div className="font-semibold text-sm text-slate-900">Guide License Card</div>
                                    <div className="text-xs text-slate-500">Official tour guide license/card issued by the tourism authority (front &amp; back)</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-emerald-200">
                            <p className="text-xs text-slate-500"><strong>Also required:</strong> Guide License Number</p>
                        </div>
                    </div>

                    {/* Intern */}
                    <div className="bg-amber-50 rounded-2xl p-8 border border-amber-200">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-lg">🎓</span>
                            <div>
                                <h3 className="font-bold text-slate-900">Intern (Sub-guide)</h3>
                                <p className="text-xs text-amber-600 font-semibold">Can only be assigned as sub-guide</p>
                            </div>
                        </div>
                        <div className="space-y-3 mt-4">
                            <div className="flex items-start gap-3">
                                <DocIcon />
                                <div>
                                    <div className="font-semibold text-sm text-slate-900">Identity Documents</div>
                                    <div className="text-xs text-slate-500">National ID card (front &amp; back) or passport</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <DocIcon />
                                <div>
                                    <div className="font-semibold text-sm text-slate-900">Proof of Address</div>
                                    <div className="text-xs text-slate-500">Recent utility bill, bank statement, or government letter</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-amber-200 flex items-start gap-2">
                            <Shield />
                            <p className="text-xs text-slate-500">No guide license required for interns. You can upgrade to a licensed guide by submitting your license card later.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ FILE REQUIREMENTS ═══ */}
            <section className="py-16 bg-white border-y border-slate-100 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Document Requirements</h2>
                        <p className="text-slate-500 max-w-xl mx-auto text-sm">To ensure smooth processing, please follow these guidelines when uploading documents.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="text-lg">📄</span> Accepted Formats
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { ext: 'PDF', desc: 'Recommended for multi-page documents' },
                                    { ext: 'JPG / JPEG', desc: 'Photos or scanned documents' },
                                    { ext: 'PNG', desc: 'Screenshots or digital documents' },
                                ].map((f) => (
                                    <div key={f.ext} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-100">
                                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{f.ext}</span>
                                        <span className="text-sm text-slate-600">{f.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="text-lg">✅</span> Quality Guidelines
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    'Maximum file size: 10MB per file',
                                    'Documents must be clearly readable — no blur',
                                    'All four corners of the document must be visible',
                                    'No editing, cropping important info, or watermarks',
                                    'Color scans preferred over black & white',
                                    'Translated documents must be certified/notarized',
                                ].map((rule, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                        <Shield />
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ REVIEW TIMELINE ═══ */}
            <section className="py-16 bg-slate-50 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Review Process</h2>
                        <p className="text-slate-500 max-w-xl mx-auto text-sm">What happens after you submit your documents.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {[
                            { step: '1', icon: '📤', title: 'Submit', desc: 'Upload required documents and fill in your details', time: '~5 min' },
                            { step: '2', icon: '🔍', title: 'Under Review', desc: 'Our team reviews your documents for authenticity', time: '1–3 business days' },
                            { step: '3', icon: '✅', title: 'Approved', desc: 'Your account is verified and trust score updated', time: 'Instant' },
                            { step: '4', icon: '🚀', title: 'Go Live', desc: 'Start publishing tours or applying to guide', time: 'Immediate' },
                        ].map((s) => (
                            <div key={s.step} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center relative">
                                <div className="text-3xl mb-3">{s.icon}</div>
                                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center">{s.step}</div>
                                <h3 className="font-bold text-slate-900 text-sm mb-1">{s.title}</h3>
                                <p className="text-xs text-slate-500 mb-3">{s.desc}</p>
                                <span className="inline-block text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{s.time}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 bg-amber-50 rounded-2xl p-6 border border-amber-200">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <span className="text-lg">💡</span> If your submission is rejected
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            You&apos;ll receive a notification with the reason for rejection. Common reasons include: blurry documents, expired IDs, or missing required files. You can resubmit as many times as needed — there&apos;s no penalty for resubmission.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-white border-t border-slate-100 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to get verified?</h2>
                    <p className="text-slate-500 mb-8 max-w-lg mx-auto">Create your account and complete verification to start operating on Lunavia. It only takes a few minutes.</p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link href="/signup" className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/25 text-lg">
                            Create Account
                        </Link>
                        <Link href="/trust-safety" className="px-8 py-4 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 transition text-lg shadow-sm">
                            Trust & Safety
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
