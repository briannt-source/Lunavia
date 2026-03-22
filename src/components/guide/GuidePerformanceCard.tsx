'use client';

import { useEffect, useState } from 'react';

interface PerformanceData {
    guide: {
        id: string;
        name: string;
        avatar: string | null;
        about: string | null;
        plan: string;
        isAvailable: boolean;
        memberSince: string;
        memberSinceYears: number;
        experienceYears: number;
    };
    scores: {
        trustScore: number;
        reliabilityScore: number;
        overallRating: number;
        completionRate: number;
        onTimeRate: number;
        repeatHireRate: number;
    };
    ratings: {
        professionalism: number;
        communication: number;
        punctuality: number;
        knowledge: number;
        overall: number;
    };
    ratingDistribution: Record<string, number>;
    totalReviews: number;
    tourStats: {
        totalCompleted: number;
        totalAccepted: number;
        inProgress: number;
        completionRate: number;
        uniqueOperators: number;
        repeatOperators: number;
    };
    reliability: {
        score: number;
        lateCancellations: number;
        noShows: number;
        replacementRequests: number;
        onTimeRate: number;
    };
    coverage: {
        languages: string[];
        specialties: string[];
        marketsServed: Record<string, number>;
        citiesServed: string[];
        countriesServed: string[];
    };
    activity: {
        monthlyActivity: { month: string; tours: number }[];
        recentTours: any[];
        trustHistory: any[];
    };
    verified: {
        isDataVerified: boolean;
        source: string;
        lastUpdated: string;
        disclaimer: string;
    };
}

// ── Score Ring Component ──
function ScoreRing({ value, max, label, color, size = 80 }: {
    value: number; max: number; label: string; color: string; size?: number;
}) {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = Math.min(value / max, 1);
    const offset = circumference * (1 - pct);

    return (
        <div className="flex flex-col items-center gap-1">
            <div style={{ width: size, height: size }} className="relative">
                <svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke="#f3f4f6" strokeWidth="6" />
                    <circle cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={color} strokeWidth="6"
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-bold text-gray-900"
                    style={{ fontSize: size * 0.22 }}>
                    {typeof value === 'number' ? (value % 1 === 0 ? value : value.toFixed(1)) : value}
                </span>
            </div>
            <span className="text-xs font-medium text-gray-500 text-center leading-tight">{label}</span>
        </div>
    );
}

// ── Rating Bar ──
function RatingBar({ label, value, emoji }: { label: string; value: number; emoji: string }) {
    const pct = (value / 5) * 100;
    return (
        <div className="flex items-center gap-3">
            <span className="text-sm">{emoji}</span>
            <span className="text-xs text-gray-600 w-28 truncate">{label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-[#5BA4CF] transition-all duration-700"
                    style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-700 w-8 text-right">
                {value > 0 ? value.toFixed(1) : '—'}
            </span>
        </div>
    );
}

// ── Activity Chart (mini bar chart) ──
function ActivityChart({ data }: { data: { month: string; tours: number }[] }) {
    const maxTours = Math.max(...data.map(d => d.tours), 1);
    return (
        <div className="flex items-end gap-1 h-16">
            {data.map((d, i) => (
                <div key={d.month} className="flex flex-col items-center flex-1 gap-0.5">
                    <div
                        className="w-full rounded-t bg-gradient-to-t from-[#5BA4CF] to-indigo-300 transition-all duration-500 min-h-[2px]"
                        style={{ height: `${(d.tours / maxTours) * 100}%` }}
                        title={`${d.month}: ${d.tours} tours`}
                    />
                    {i % 3 === 0 && (
                        <span className="text-[9px] text-gray-400">
                            {d.month.split('-')[1]}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

// ═══════════════ MAIN COMPONENT ═══════════════
export default function GuidePerformanceCard({ guideId }: { guideId: string }) {
    const [data, setData] = useState<PerformanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/guides/${guideId}/performance`)
            .then(res => res.json())
            .then(d => {
                if (d.error) throw new Error(d.error);
                setData(d);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [guideId]);

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-100 rounded-2xl" />
                <div className="grid grid-cols-3 gap-3">
                    <div className="h-24 bg-gray-100 rounded-xl" />
                    <div className="h-24 bg-gray-100 rounded-xl" />
                    <div className="h-24 bg-gray-100 rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-2xl">
                <p className="text-sm">{error || 'No performance data available'}</p>
            </div>
        );
    }

    const { guide, scores, ratings, ratingDistribution, totalReviews, tourStats, reliability, coverage, activity, verified } = data;
    const hasActivity = activity.monthlyActivity.some(m => m.tours > 0);

    return (
        <div className="space-y-5">
            {/* ═══ Header: Verified Badge ═══ */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                        Verified by Lunavia
                    </span>
                </div>
                <span className="text-[10px] text-gray-400">
                    Updated {new Date(verified.lastUpdated).toLocaleDateString()}
                </span>
            </div>

            {/* ═══ Core Score Rings ═══ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    <ScoreRing value={scores.trustScore} max={100} label="Trust" color="#6366f1" />
                    <ScoreRing value={scores.reliabilityScore} max={100} label="Reliability" color="#10b981" />
                    <ScoreRing value={scores.overallRating} max={5} label="Rating" color="#f59e0b" />
                    <ScoreRing value={scores.completionRate} max={100} label="Completion" color="#8b5cf6" />
                    <ScoreRing value={scores.onTimeRate} max={100} label="On-Time" color="#06b6d4" />
                    <ScoreRing value={scores.repeatHireRate} max={100} label="Repeat Hire" color="#ec4899" />
                </div>
            </div>

            {/* ═══ Tour Stats Row ═══ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{tourStats.totalCompleted}</p>
                    <p className="text-xs text-gray-500 mt-1">Tours Completed</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{tourStats.uniqueOperators}</p>
                    <p className="text-xs text-gray-500 mt-1">Operators Served</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{coverage.citiesServed.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Cities Covered</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">
                        {guide.memberSinceYears > 0 ? `${guide.memberSinceYears}y` : '<1y'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">On Platform</p>
                </div>
            </div>

            {/* ═══ 5-Dimension Ratings ═══ */}
            {totalReviews > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-800">Performance Ratings</h3>
                        <span className="text-xs text-gray-400">{totalReviews} verified reviews</span>
                    </div>
                    <div className="space-y-3">
                        <RatingBar label="Professionalism" value={ratings.professionalism} emoji="🎯" />
                        <RatingBar label="Communication" value={ratings.communication} emoji="💬" />
                        <RatingBar label="Punctuality" value={ratings.punctuality} emoji="⏰" />
                        <RatingBar label="Knowledge" value={ratings.knowledge} emoji="📚" />
                        <RatingBar label="Overall" value={ratings.overall} emoji="⭐" />
                    </div>

                    {/* Rating Distribution */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = ratingDistribution[star] || 0;
                                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                return (
                                    <div key={star} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full bg-yellow-400"
                                                style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-[10px] text-gray-400">{star}★</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Activity Chart ═══ */}
            {hasActivity && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Activity (Last 12 months)</h3>
                    <ActivityChart data={activity.monthlyActivity} />
                </div>
            )}

            {/* ═══ Reliability Breakdown ═══ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Reliability Record</h3>
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                        <p className={`text-lg font-bold ${reliability.lateCancellations === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                            {reliability.lateCancellations}
                        </p>
                        <p className="text-[10px] text-gray-500">Late Cancels</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-lg font-bold ${reliability.noShows === 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {reliability.noShows}
                        </p>
                        <p className="text-[10px] text-gray-500">No-Shows</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-lg font-bold ${reliability.replacementRequests === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                            {reliability.replacementRequests}
                        </p>
                        <p className="text-[10px] text-gray-500">Replacements</p>
                    </div>
                </div>
            </div>

            {/* ═══ Coverage: Languages & Specialties ═══ */}
            {(coverage.languages.length > 0 || coverage.specialties.length > 0) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Expertise</h3>
                    {coverage.languages.length > 0 && (
                        <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1.5">Languages</p>
                            <div className="flex flex-wrap gap-1.5">
                                {coverage.languages.map(lang => (
                                    <span key={lang}
                                        className="inline-flex items-center text-xs bg-lunavia-light text-[#2E8BC0] px-2.5 py-1 rounded-full font-medium">
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {coverage.specialties.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-500 mb-1.5">Specialties</p>
                            <div className="flex flex-wrap gap-1.5">
                                {coverage.specialties.map(spec => (
                                    <span key={spec}
                                        className="inline-flex items-center text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {coverage.citiesServed.length > 0 && (
                        <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-1.5">Cities Served</p>
                            <div className="flex flex-wrap gap-1.5">
                                {coverage.citiesServed.slice(0, 8).map(city => (
                                    <span key={city}
                                        className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                                        📍 {city}
                                    </span>
                                ))}
                                {coverage.citiesServed.length > 8 && (
                                    <span className="text-xs text-gray-400">
                                        +{coverage.citiesServed.length - 8} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ Verified Disclaimer ═══ */}
            <div className="flex items-center gap-2 text-[10px] text-gray-400 px-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {verified.disclaimer}
            </div>
        </div>
    );
}
