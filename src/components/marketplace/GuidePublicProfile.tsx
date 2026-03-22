'use client';

import { TrustScoreRing } from '@/components/marketplace/TrustScoreRing';

// ── Types ────────────────────────────────────────────────────────────
interface GuideData {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    bio: string;
    trustScore: number;
    verificationStatus: string;
    experienceYears: number;
    languages: { language: string; level: string }[];
    certifications: string[];
    specialties: string[];
}

interface ActivityItem {
    id: string;
    date: string;
    title: string;
    location: string;
}

interface ReviewItem {
    id: string;
    operatorName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

interface GuidePublicProfileProps {
    guide: GuideData;
    recentActivity: ActivityItem[];
    reviews: ReviewItem[];
    onInvite?: (guideId: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────────
export default function GuidePublicProfile({ guide, recentActivity, reviews, onInvite }: GuidePublicProfileProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* ── Hero ──────────────────────────────────────────── */}
            <div className="rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 border border-gray-200 p-6 md:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Photo */}
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center shrink-0 overflow-hidden shadow-lg ring-4 ring-white">
                        {guide.avatarUrl ? (
                            <img src={guide.avatarUrl} alt={guide.name} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold text-purple-600">
                                {(guide.name || guide.email || 'G').charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left min-w-0">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                            <h1 className="text-2xl font-bold text-gray-900 truncate">{guide.name || 'Tour Guide'}</h1>
                            {guide.verificationStatus === 'APPROVED' && (
                                <svg className="h-6 w-6 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                            Professional Tour Guide
                            {guide.experienceYears > 0 && ` · ${guide.experienceYears} years experience`}
                        </p>

                        {/* Specialties */}
                        {guide.specialties.length > 0 && (
                            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                                {guide.specialties.map(s => (
                                    <span key={s} className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-600">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Trust Score + Invite */}
                    <div className="flex flex-col items-center gap-3 shrink-0">
                        <TrustScoreRing score={guide.trustScore} size="md" showTier showTooltip />
                        {onInvite && (
                            <button
                                onClick={() => onInvite(guide.id)}
                                className="rounded-lg bg-lunavia-primary px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm"
                            >
                                Invite to Tour
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Content Grid ──────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Bio + Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Bio */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-gray-900 mb-3">About</h2>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {guide.bio || 'No bio provided.'}
                        </p>
                    </div>

                    {/* Languages + Certifications */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Languages */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                                Languages
                            </h3>
                            {guide.languages.length === 0 ? (
                                <p className="text-sm text-gray-400">Not specified</p>
                            ) : (
                                <div className="space-y-2">
                                    {guide.languages.map((l, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">{l.language}</span>
                                            <span className="text-xs text-gray-400 capitalize">{l.level}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Certifications */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                Certifications
                            </h3>
                            {guide.certifications.length === 0 ? (
                                <p className="text-sm text-gray-400">None listed</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {guide.certifications.map((c, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                            <svg className="h-3 w-3 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {c}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Operator Reviews</h2>
                        {reviews.length === 0 ? (
                            <p className="text-sm text-gray-400">No reviews yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map(review => (
                                    <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-7 w-7 rounded-full bg-lunavia-muted/50 flex items-center justify-center">
                                                <span className="text-[10px] font-semibold text-[#5BA4CF]">
                                                    {review.operatorName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-900">{review.operatorName}</p>
                                                <StarRating rating={review.rating} />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
                                        <p className="text-[10px] text-gray-400 mt-1.5">
                                            {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Activity Timeline */}
                <div>
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-gray-400">No recent tours.</p>
                        ) : (
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200" />

                                <div className="space-y-4">
                                    {recentActivity.map((item, i) => (
                                        <div key={item.id} className="relative flex gap-3 pl-1">
                                            {/* Dot */}
                                            <div className="relative z-10 mt-1.5">
                                                <div className={`h-2.5 w-2.5 rounded-full ring-2 ring-white ${i === 0 ? 'bg-lunavia-light0' : 'bg-gray-300'}`} />
                                            </div>
                                            {/* Content */}
                                            <div className="min-w-0 pb-1">
                                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                                <p className="text-sm font-medium text-gray-900 truncate mt-0.5">{item.title}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    </svg>
                                                    {item.location}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
