import Link from 'next/link';

export default function HelpPage() {
    return (
        <div className="overflow-hidden bg-[#FDFBF7]">
            {/* Hero */}
            <section className="pt-24 pb-20 text-center px-6">
                <span className="inline-block px-4 py-1.5 rounded-full bg-lunavia-light text-lunavia-primary text-[10px] font-bold tracking-wide mb-6 uppercase">
                    Public Help Center
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Where can we take you today?
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto mb-10">
                    Find answers to help your travel business soar. From booking logistics to guide certifications, we're here to light the way.
                </p>

                {/* Search */}
                <div className="max-w-xl mx-auto relative flex shadow-lg rounded-full">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search for guides, workflows, or trust scores..."
                        className="w-full pl-14 pr-32 py-4 rounded-full border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-lunavia-primary outline-none text-gray-700"
                    />
                    <button className="absolute right-2 top-2 bottom-2 bg-lunavia-primary text-white px-6 rounded-full text-sm font-semibold hover:bg-lunavia-primary-hover transition">
                        Search
                    </button>
                </div>
            </section>

            {/* Category Cards */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center hover:shadow-lg transition cursor-pointer group">
                        <div className="w-12 h-12 bg-lunavia-light rounded-full flex items-center justify-center text-lunavia-primary mx-auto mb-4 group-hover:scale-110 transition">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">For Operators</h3>
                        <p className="text-sm text-gray-500">Manage bookings, contracts, and fleet logistics with ease.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center hover:shadow-lg transition cursor-pointer group">
                        <div className="w-12 h-12 bg-[#E8F4FD] rounded-full flex items-center justify-center text-[#5BA4CF] mx-auto mb-4 group-hover:scale-110 transition">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">For Guides</h3>
                        <p className="text-sm text-gray-500">Showcase your expertise and find opportunities worldwide.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center hover:shadow-lg transition cursor-pointer group">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4 group-hover:scale-110 transition">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Trust Score</h3>
                        <p className="text-sm text-gray-500">Understanding our transparency and safety standards.</p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-8">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Explore Topics</h4>
                        <ul className="space-y-4">
                            <li><button className="flex items-center gap-3 text-sm font-semibold text-white bg-lunavia-primary px-4 py-2 rounded-lg w-full shadow-lg shadow-blue-200">
                                <span>🚀</span> Getting Started
                            </button></li>
                            <li><button className="flex items-center gap-3 text-sm text-gray-600 px-4 py-2 hover:bg-gray-50 rounded-lg w-full transition">
                                <span>💳</span> Fees & Bookings
                            </button></li>
                            <li><button className="flex items-center gap-3 text-sm text-gray-600 px-4 py-2 hover:bg-gray-50 rounded-lg w-full transition">
                                <span>🛡️</span> Trust & Safety
                            </button></li>
                            <li><button className="flex items-center gap-3 text-sm text-gray-600 px-4 py-2 hover:bg-gray-50 rounded-lg w-full transition">
                                <span>🛠️</span> Workflow Tools
                            </button></li>
                        </ul>
                    </div>

                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                        <h5 className="text-xs font-bold text-orange-600 mb-2">Pro Tip</h5>
                        <p className="text-xs text-orange-800 leading-relaxed">Check your Trust Score dashboard regularly to unlock premium operator badges.</p>
                    </div>
                </div>

                {/* Article List */}
                <div className="flex-grow">
                    <div className="flex items-baseline justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <span className="text-blue-300">#</span> Getting Started
                        </h2>
                        <span className="text-xs text-gray-400">12 articles found</span>
                    </div>

                    <div className="space-y-4">
                        {/* Expanded Item */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-semibold text-gray-900 text-lg">How does Lunavia maintain neutrality between operators and guides?</h3>
                                <button className="bg-lunavia-light p-1 rounded hover:bg-lunavia-muted/50 text-lunavia-primary">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                                </button>
                            </div>
                            <div className="prose prose-sm text-gray-500 leading-relaxed">
                                <p>Lunavia operates as a neutral marketplace infrastructure. We do not participate in tour operations or guide management. Our platform provides:</p>
                                <ul className="list-disc pl-5 space-y-2 mt-4 marker:text-blue-300">
                                    <li>Standardized contracts verified by industry experts</li>
                                    <li>Escrow-based payments for guaranteed security</li>
                                    <li>A transparent Trust Score system for objective evaluation</li>
                                </ul>
                                <p className="mt-4 italic text-gray-400">We act as a facilitator, not an intermediary party, ensuring a level playing field for all.</p>
                            </div>
                        </div>

                        {/* Collapsed Items */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition cursor-pointer">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900">What are the platform fees for booking a guide?</h3>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition cursor-pointer">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900">How is the Trust Score calculated for new accounts?</h3>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition cursor-pointer">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900">Can I integrate Lunavia with my existing booking software?</h3>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* CTA Block */}
                    <div className="bg-lunavia-light rounded-3xl p-8 mt-12 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lunavia-primary font-bold flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> The Lunavia Charter</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Our Commitment to Neutrality</h3>
                            <p className="text-sm text-gray-600 max-w-lg mb-6">Transparency is our compass. We never favor one role over the other, ensuring that both Tour Operators and Freelance Guides have equal access to data, fair arbitration, and secure payment systems.</p>
                            <Link href="#" className="text-lunavia-primary font-semibold text-sm hover:underline">Read the Neutrality Charter →</Link>
                        </div>
                        <div className="hidden md:block opacity-50">
                            {/* Abstract Decorative Element */}
                            <div className="w-24 h-24 rounded-full border-4 border-lunavia-muted/60 border-dashed animate-spin-slow"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="bg-gradient-to-b from-slate-50 to-blue-50 py-24 text-center mt-20 relative overflow-hidden border-t border-slate-200">
                <div className="max-w-2xl mx-auto px-6 relative z-10">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Still have questions?</h2>
                    <p className="text-slate-500 mb-10">Our friendly support team is like a personal travel concierge, ready to assist you 24/7.</p>
                    <div className="flex items-center justify-center gap-4">
                        <Link href="#" className="px-8 py-3 bg-lunavia-primary text-white font-bold rounded-full hover:bg-lunavia-primary-hover transition shadow-lg shadow-[#2E8BC0]/20">Contact Support</Link>
                        <Link href="#" className="px-8 py-3 bg-white text-slate-700 font-semibold rounded-full border border-slate-200 hover:bg-slate-50 transition shadow-sm">View Docs</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
