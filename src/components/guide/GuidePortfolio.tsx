'use client';

import React from 'react';

interface PortfolioProps {
    guide: {
        email: string;
        kycStatus: string;
        trustScore: number;
        trustState: string;
        completedTourCount: number;
        joinedAt: string;
    };
    feedbackSummary: {
        avgRating: number;
        totalReviews: number;
        topTags: string[];
    };
}

export function GuidePortfolio({ guide, feedbackSummary }: PortfolioProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
            {/* Header / Banner */}
            <div className="bg-indigo-900 p-8 text-white relative">
                <div className="relative z-10 flex items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-lunavia-light0 border-4 border-white/20 flex items-center justify-center text-4xl font-bold shadow-2xl">
                        {guide.email[0].toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">{guide.email.split('@')[0]}</h1>
                            {guide.kycStatus === 'APPROVED' && (
                                <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Verified</span>
                            )}
                        </div>
                        <p className="text-indigo-200 font-medium">Licensed Lunavia Tour Guide</p>
                        <div className="flex gap-4 mt-3 text-sm opacity-80">
                            <span>📅 Joined {new Date(guide.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                            <span>📍 Vietnam</span>
                        </div>
                    </div>
                </div>
                {/* Abstract shape */}
                <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
            </div>

            <div className="p-8 grid md:grid-cols-3 gap-8">
                {/* Stats Sidebar */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Trust Summary</h3>
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
                            <div className="text-4xl font-black text-[#5BA4CF] mb-1">{guide.trustScore}</div>
                            <div className="text-xs font-bold text-gray-900 uppercase tracking-wide">{guide.trustState} Status</div>
                            <p className="text-[10px] text-gray-500 mt-2">Certified reliability score based on platform history.</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Platform Badges</h3>
                        <div className="flex flex-wrap gap-2">
                            {guide.completedTourCount >= 50 && (
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-200">Elite Veteran</span>
                            )}
                            {guide.trustScore >= 95 && (
                                <span className="bg-lunavia-muted/50 text-lunavia-primary-hover text-[10px] font-bold px-3 py-1 rounded-full border border-lunavia-muted/60">Top Trusted</span>
                            )}
                            {guide.kycStatus === 'APPROVED' && (
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full border border-green-200">KYC Verified</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Experience */}
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Operational Performance</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border rounded-xl shadow-sm">
                                <div className="text-2xl font-bold text-gray-900">{guide.completedTourCount}</div>
                                <div className="text-xs text-gray-500 font-medium">Tours Completed</div>
                            </div>
                            <div className="p-4 border rounded-xl shadow-sm">
                                <div className="text-2xl font-bold text-gray-900">{feedbackSummary.avgRating.toFixed(1)} <span className="text-amber-400 text-lg">★</span></div>
                                <div className="text-xs text-gray-500 font-medium">Avg Operator Rating</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Top Endorsements</h3>
                        <div className="flex flex-wrap gap-2">
                            {feedbackSummary.topTags.map((tag, i) => (
                                <span key={i} className="bg-gray-100 text-gray-700 text-xs font-medium px-4 py-2 rounded-lg border border-gray-200">
                                    {tag.replace('GUIDE_', '').replace('_', ' ')}
                                </span>
                            ))}
                            {feedbackSummary.topTags.length === 0 && (
                                <p className="text-xs text-gray-500 italic">No specific endorsements collected yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                            <span>PORTFOLIO ID: {guide.email.substring(0, 4)}-{guide.joinedAt.substring(0, 4)}</span>
                            <span>VERIFIED BY LUNAVIA SYSTEM</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print / Export Footer */}
            <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-between items-center print:hidden">
                <p className="text-xs text-gray-500 font-medium">This is a system-generated performance portfolio.</p>
                <button
                    onClick={() => window.print()}
                    className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-bold text-white hover:bg-black transition shadow-md"
                >
                    Print / Export PDF
                </button>
            </div>
        </div>
    );
}
