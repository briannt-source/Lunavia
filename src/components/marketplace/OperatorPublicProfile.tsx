'use client';

import { TrustScoreRing } from '@/components/marketplace/TrustScoreRing';

// ── Types ────────────────────────────────────────────────────────────
interface OperatorData {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    bio: string;
    trustScore: number;
    verificationStatus: string;
    operatorCategory: string;
    operatingRegion: string;
    tourSpecialties: string[];
}

interface OperatorStats {
    completedTours: number;
    collaborationSuccessRate: number; // percentage
    avgGuideTrust: number;           // aggregated, no individual guide data
    avgRating: number;
    totalReviews: number;
}

interface TourItem {
    id: string;
    title: string;
    location: string;
    startDate: string;
    status: string;
}

interface ReviewItem {
    id: string;
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

interface OperatorPublicProfileProps {
    operator: OperatorData;
    stats: OperatorStats;
    tours: TourItem[];
    reviews: ReviewItem[];
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

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        COMPLETED: 'bg-green-100 text-green-700',
        PUBLISHED: 'bg-lunavia-muted/50 text-[#2E8BC0]',
        IN_PROGRESS: 'bg-lunavia-muted/50 text-lunavia-primary-hover',
        CANCELLED: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
}

// ── Main Component ───────────────────────────────────────────────────
export default function OperatorPublicProfile({ operator, stats, tours, reviews }: OperatorPublicProfileProps) {
    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* ── Hero Banner ───────────────────────────────────── */}
            <div className="rounded-2xl bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/30 border border-gray-200 p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar */}
                    <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                        {operator.avatarUrl ? (
                            <img src={operator.avatarUrl} alt={operator.name} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-[#5BA4CF]">
                                {(operator.name || operator.email || 'O').charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left min-w-0">
                        <p className="text-[10px] font-semibold text-[#5BA4CF] uppercase tracking-widest mb-1">Tour Operator</p>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                            <h1 className="text-2xl font-bold text-gray-900 truncate">{operator.name || 'Tour Operator'}</h1>
                            {operator.verificationStatus === 'APPROVED' && (
                                <svg className="h-6 w-6 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                            <span className="capitalize">{operator.operatorCategory?.toLowerCase().replace(/_/g, ' ') || 'operator'}</span>
                            {operator.operatingRegion && (
                                <>
                                    <span className="text-gray-300">·</span>
                                    <span className="flex items-center gap-1">
                                        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        {operator.operatingRegion}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Trust Score */}
                    <div className="shrink-0">
                        <TrustScoreRing score={operator.trustScore} size="md" showTier showTooltip />
                    </div>
                </div>
            </div>

            {/* ── Aggregated Metrics ────────────────────────────── */}
            {/* IMPORTANT: No individual guide data exposed here */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
                    <div className="text-3xl font-bold text-[#5BA4CF]">{stats.completedTours}</div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">Tours Completed</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
                    <div className="text-3xl font-bold text-green-600">{stats.collaborationSuccessRate}%</div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">Collaboration Success Rate</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
                    <div className="text-3xl font-bold text-purple-600">{stats.avgGuideTrust}</div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">Average Guide Trust</div>
                </div>
            </div>

            {/* ── Two Column Layout ─────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Bio + Specialties + Tours */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Bio */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-gray-900 mb-3">About</h2>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {operator.bio || 'No company bio provided.'}
                        </p>

                        {/* Region + Specialties */}
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {operator.operatingRegion && (
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Operating Region</h3>
                                    <p className="text-sm text-gray-700">{operator.operatingRegion}</p>
                                </div>
                            )}
                            {operator.tourSpecialties.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Specialties</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {operator.tourSpecialties.map(s => (
                                            <span key={s} className="inline-flex items-center rounded-md bg-lunavia-light px-2 py-0.5 text-xs font-medium text-[#5BA4CF]">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Published Tours */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Tours</h2>
                        {tours.length === 0 ? (
                            <p className="text-sm text-gray-400">No public tours yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {tours.map(tour => (
                                    <div key={tour.id} className="rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="font-medium text-gray-900 text-sm truncate">{tour.title}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                    <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    </svg>
                                                    {tour.location}
                                                    <span className="text-gray-300 mx-0.5">·</span>
                                                    {new Date(tour.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <StatusBadge status={tour.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Reviews */}
                <div>
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-gray-900">Reviews</h2>
                            {stats.totalReviews > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <StarRating rating={stats.avgRating} />
                                    <span className="text-xs text-gray-400">{stats.totalReviews}</span>
                                </div>
                            )}
                        </div>
                        {reviews.length === 0 ? (
                            <p className="text-sm text-gray-400">No reviews yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map(review => (
                                    <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
                                                <span className="text-[10px] font-semibold text-gray-500">
                                                    {review.reviewerName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-900">{review.reviewerName}</p>
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
            </div>
        </div>
    );
}
