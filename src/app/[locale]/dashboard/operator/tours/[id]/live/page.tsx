'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ExecutionTimeline, type SegmentData } from '@/components/execution/ExecutionTimeline';
import { canAccessFeature, getEffectivePlan, type UserPlan } from '@/lib/plans';

interface TourInfo {
    id: string;
    title: string;
    status: string;
    startTime: string;
    endTime: string;
    returnStatus?: string;
    returnNotes?: string;
    guideReturnedAt?: string;
}

const POLL_INTERVAL_MS = 15_000; // 15 seconds

const REJECT_REASONS = [
    { value: 'REJECTED_INCOMPLETE', label: 'Tour Incomplete', desc: 'Guide did not complete required segments' },
    { value: 'REJECTED_QUALITY', label: 'Quality Issues', desc: 'Tour quality did not meet standards' },
    { value: 'REJECTED_INCIDENT', label: 'Unresolved Incident', desc: 'An incident was not properly handled' },
    { value: 'REJECTED_OTHER', label: 'Other Reason', desc: 'Specify in the notes below' },
];

export default function OperatorLiveTourPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const tourId = params.id as string;

    // Feature gate: COMMAND_CENTER = PRO+ only
    const userPlan = (session?.user as any)?.plan || 'FREE';
    const effectivePlan = getEffectivePlan(userPlan, (session?.user as any)?.planExpiresAt);
    const hasCommandCenter = canAccessFeature(effectivePlan as UserPlan, 'COMMAND_CENTER');

    const [tour, setTour] = useState<TourInfo | null>(null);
    const [segments, setSegments] = useState<SegmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Confirm/Reject state
    const [acting, setActing] = useState<string | null>(null);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectNotes, setRejectNotes] = useState('');
    const [actionResult, setActionResult] = useState<{ type: 'confirmed' | 'rejected'; message: string } | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`/api/tours/${tourId}/execution`);
            const json = await res.json();
            if (json.success) {
                setTour(json.data.tour);
                setSegments(json.data.segments);
                setLastUpdated(new Date());
            } else {
                setError(json.error || 'Failed to load');
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }, [tourId]);

    useEffect(() => {
        fetchData();
        // Auto-refresh only for PRO+ with COMMAND_CENTER feature
        if (hasCommandCenter) {
            const interval = setInterval(fetchData, POLL_INTERVAL_MS);
            return () => clearInterval(interval);
        }
    }, [fetchData, hasCommandCenter]);

    const confirmTour = async () => {
        setActing('confirm');
        setError('');
        try {
            const res = await fetch(`/api/requests/${tourId}/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'CONFIRM' }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || json.message || 'Failed');
            setActionResult({ type: 'confirmed', message: 'Tour confirmed and closed. Payout will be released to the guide.' });
            await fetchData();
        } catch (e: any) { setError(e.message); }
        finally { setActing(null); }
    };

    const rejectTour = async () => {
        if (!rejectReason) { setError('Please select a reason'); return; }
        if (rejectReason === 'REJECTED_OTHER' && !rejectNotes.trim()) { setError('Notes are required for "Other" reason'); return; }

        setActing('reject');
        setError('');
        try {
            const res = await fetch(`/api/requests/${tourId}/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'REJECT',
                    reason: rejectReason,
                    notes: rejectNotes.trim() || undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || json.message || 'Failed');
            setActionResult({ type: 'rejected', message: 'Tour has been disputed. An incident has been created for our operations team to review.' });
            setShowRejectForm(false);
            await fetchData();
        } catch (e: any) { setError(e.message); }
        finally { setActing(null); }
    };

    const startTour = async () => {
        setActing('start');
        setError('');
        try {
            const res = await fetch(`/api/requests/${tourId}/start`, { method: 'POST' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || json.message || 'Failed to start tour');
            await fetchData();
        } catch (e: any) { setError(e.message); }
        finally { setActing(null); }
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        });
    };

    const formatTime = (iso: string) => {
        return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse text-gray-500 text-lg">Loading tour execution...</div>
            </div>
        );
    }

    if (error && !tour) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-3">
                    <div className="text-red-500 text-lg font-medium">{error || 'Tour not found'}</div>
                    <button
                        onClick={() => router.push('/dashboard/operator/tours')}
                        className="text-[#5BA4CF] underline text-sm"
                    >
                        Back to Tours
                    </button>
                </div>
            </div>
        );
    }

    if (!tour) return null;

    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        ASSIGNED: { bg: 'bg-lunavia-light', text: 'text-lunavia-primary-hover', label: 'Assigned' },
        READY: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Ready' },
        IN_PROGRESS: { bg: 'bg-green-50', text: 'text-green-700', label: 'In Progress' },
        COMPLETED: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending Confirmation' },
        CLOSED: { bg: 'bg-green-50', text: 'text-green-700', label: 'Confirmed & Closed' },
        DISPUTED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Disputed' },
    };

    const sc = statusConfig[tour.status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: tour.status };

    const completedSegments = segments.filter(s => s.checkIn && s.checkIn.status === 'COMPLETED').length;
    const skippedSegments = segments.filter(s => s.checkIn && s.checkIn.status === 'SKIPPED').length;
    const isFreeFormMode = segments.length > 0 && segments.every(s => s.type === 'OTHER' && s.checkIn);

    const isCompleted = tour.status === 'COMPLETED';
    const isClosed = tour.status === 'CLOSED';
    const isDisputed = tour.status === 'DISPUTED';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <button
                                onClick={() => router.push('/dashboard/operator/tours')}
                                className="text-sm text-gray-500 hover:text-[#5BA4CF] mb-1 flex items-center gap-1"
                            >
                                ← Back to Tours
                            </button>
                            <h1 className="text-xl font-bold text-gray-900 truncate">{tour.title}</h1>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                <span>{formatDate(tour.startTime)}</span>
                                <span>•</span>
                                <span>{formatTime(tour.startTime)} – {formatTime(tour.endTime)}</span>
                            </div>
                        </div>
                        <div className="text-right ml-4 shrink-0">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${sc.bg} ${sc.text}`}>
                                {tour.status === 'IN_PROGRESS' && (
                                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                                )}
                                {sc.label}
                            </span>
                        </div>
                    </div>

                    {/* Stats bar */}
                    {isFreeFormMode ? (
                        <div className="mt-4 bg-lunavia-light rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-[#2E8BC0]">{segments.length}</div>
                            <div className="text-xs text-[#5BA4CF]">Activities Logged by Guide</div>
                        </div>
                    ) : segments.length > 0 ? (
                        <div className="mt-4 grid grid-cols-3 gap-3">
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                <div className="text-xl font-bold text-green-700">{completedSegments}</div>
                                <div className="text-xs text-green-600">Completed</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <div className="text-xl font-bold text-gray-700">{segments.length - completedSegments - skippedSegments}</div>
                                <div className="text-xs text-gray-600">Remaining</div>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3 text-center">
                                <div className="text-xl font-bold text-amber-700">{skippedSegments}</div>
                                <div className="text-xs text-amber-600">Skipped</div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-xs text-gray-500">No itinerary defined — guide will log activities freely</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Live indicator / Plan banner */}
            {tour.status === 'IN_PROGRESS' && hasCommandCenter && (
                <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>Auto-refreshing every 15s</span>
                        {lastUpdated && <span>• Last: {lastUpdated.toLocaleTimeString()}</span>}
                    </div>
                </div>
            )}

            {/* Free plan — manual refresh + upgrade banner */}
            {!hasCommandCenter && (
                <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-4 space-y-3">
                    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-sm text-amber-800">
                            <span>📡</span>
                            <span>Basic view — upgrade to <strong>Pro</strong> for live auto-refresh & command center</span>
                        </div>
                        <button
                            onClick={fetchData}
                            className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-medium transition"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                    {lastUpdated && (
                        <div className="text-xs text-gray-400 text-right">
                            Last refreshed: {lastUpdated.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            )}

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center justify-between">
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="text-red-400 ml-2">✕</button>
                    </div>
                )}

                {/* ── Start Tour / Waiting for Check-in Banner ── */}
                {tour.status === 'ASSIGNED' && (
                    <div className="bg-lunavia-light border border-lunavia-muted/60 rounded-2xl p-5 text-center">
                        <div className="text-4xl mb-2">⏳</div>
                        <h2 className="font-bold text-blue-800 text-lg">Waiting for Guide Check-in</h2>
                        <p className="text-sm text-lunavia-primary mt-1">The guide needs to check in before the tour can start.</p>
                    </div>
                )}

                {tour.status === 'READY' && (
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-center space-y-4">
                        <div className="text-4xl">🚀</div>
                        <div>
                            <h2 className="font-bold text-emerald-900 text-lg">Guide Checked In — Ready to Start</h2>
                            <p className="text-sm text-emerald-700 mt-1">The guide has arrived and is ready. Start the tour when you're ready.</p>
                        </div>
                        <button
                            onClick={startTour}
                            disabled={acting === 'start'}
                            className="w-full max-w-sm mx-auto py-4 bg-emerald-600 text-white font-bold rounded-xl text-base hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50 shadow-lg"
                        >
                            {acting === 'start' ? '⏳ Starting...' : '🚀 Start Tour Now'}
                        </button>
                    </div>
                )}

                {/* ── Action Result Banner ─────────────────── */}
                {actionResult && (
                    <div className={`rounded-2xl p-5 text-center border ${actionResult.type === 'confirmed'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                        <div className="text-4xl mb-2">{actionResult.type === 'confirmed' ? '✅' : '⚠️'}</div>
                        <h2 className={`font-bold text-lg ${actionResult.type === 'confirmed' ? 'text-green-800' : 'text-red-800'}`}>
                            {actionResult.type === 'confirmed' ? 'Tour Confirmed' : 'Tour Disputed'}
                        </h2>
                        <p className={`text-sm mt-1 ${actionResult.type === 'confirmed' ? 'text-green-600' : 'text-red-600'}`}>{actionResult.message}</p>
                    </div>
                )}

                {/* ── Closed Banner ────────────────────────── */}
                {isClosed && !actionResult && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                        <div className="text-4xl mb-2">✅</div>
                        <h2 className="font-bold text-green-800 text-lg">Tour Confirmed & Closed</h2>
                        <p className="text-sm text-green-600 mt-1">This tour has been confirmed. Payout has been processed.</p>
                    </div>
                )}

                {/* ── Disputed Banner ──────────────────────── */}
                {isDisputed && !actionResult && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
                        <div className="text-4xl mb-2">⚠️</div>
                        <h2 className="font-bold text-red-800 text-lg">Tour Under Dispute</h2>
                        <p className="text-sm text-red-600 mt-1">This tour is under dispute. Our operations team will review and resolve.</p>
                    </div>
                )}

                {/* ── Guide Return Report ─────────────────── */}
                {(isCompleted || isClosed || isDisputed) && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-lg">📋</span> Guide Tour Report
                        </h3>

                        <div className="space-y-4">
                            {/* Return time */}
                            {tour.guideReturnedAt && (
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-500 w-28 shrink-0">Returned at</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(tour.guideReturnedAt).toLocaleString('en-US', {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            )}

                            {/* Completion status */}
                            {tour.returnStatus && (
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-500 w-28 shrink-0">Status</span>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                        tour.returnStatus === 'COMPLETED_OK' ? 'bg-green-100 text-green-700' :
                                        tour.returnStatus === 'COMPLETED_WITH_ISSUES' ? 'bg-amber-100 text-amber-700' :
                                        'bg-orange-100 text-orange-700'
                                    }`}>
                                        {tour.returnStatus === 'COMPLETED_OK' ? '✅ Completed OK' :
                                         tour.returnStatus === 'COMPLETED_WITH_ISSUES' ? '⚠️ With Issues' :
                                         '🔶 Partial'}
                                    </span>
                                </div>
                            )}

                            {/* Notes */}
                            {tour.returnNotes && (
                                <div>
                                    <span className="text-gray-500 text-sm block mb-1">Report Notes</span>
                                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {tour.returnNotes}
                                    </div>
                                </div>
                            )}

                            {!tour.guideReturnedAt && !tour.returnStatus && (
                                <p className="text-sm text-gray-400 italic">Guide has not yet returned this tour.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Confirm / Reject Actions ───────────── */}
                {isCompleted && !actionResult && (
                    <div className="bg-white rounded-xl border-2 border-[#5BA4CF]/30 p-6">
                        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <span className="text-lg">🤝</span> Confirm Tour Completion
                        </h3>
                        <p className="text-sm text-gray-500 mb-5">Review the guide&apos;s report above and confirm or reject the tour completion.</p>

                        {!showRejectForm ? (
                            <div className="space-y-3">
                                <button
                                    onClick={confirmTour}
                                    disabled={acting === 'confirm'}
                                    className="w-full py-4 bg-green-600 text-white font-bold rounded-xl text-base hover:bg-green-700 active:scale-95 transition disabled:opacity-50"
                                >
                                    {acting === 'confirm' ? '⏳ Confirming...' : '✅ Confirm & Close Tour'}
                                </button>
                                <p className="text-[10px] text-gray-400 text-center">Confirming will release the escrow payout to the guide and close the tour.</p>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                                    <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or</span></div>
                                </div>

                                <button
                                    onClick={() => setShowRejectForm(true)}
                                    className="w-full py-3 bg-white border border-red-200 text-red-600 font-semibold rounded-xl text-sm hover:bg-red-50 active:scale-95 transition"
                                >
                                    ⚠️ Reject & Raise Dispute
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 block mb-2">Rejection Reason *</label>
                                    <div className="space-y-2">
                                        {REJECT_REASONS.map(r => (
                                            <button
                                                key={r.value}
                                                onClick={() => setRejectReason(r.value)}
                                                className={`w-full text-left p-3 rounded-xl border-2 transition ${rejectReason === r.value
                                                    ? 'border-red-400 bg-red-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="font-semibold text-sm text-gray-900">{r.label}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                                        Notes {rejectReason === 'REJECTED_OTHER' ? '*' : <span className="text-gray-400 font-normal">(optional)</span>}
                                    </label>
                                    <textarea
                                        value={rejectNotes}
                                        onChange={e => setRejectNotes(e.target.value)}
                                        placeholder="Explain the issue in detail..."
                                        className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-24 focus:border-red-300 focus:ring-2 focus:ring-red-100 outline-none"
                                    />
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <p className="text-xs text-amber-700">
                                        <strong>⚠️ Warning:</strong> Rejecting will create a dispute. The escrow payout will be held until our operations team resolves the issue.
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setShowRejectForm(false); setRejectReason(''); setRejectNotes(''); }}
                                        className="flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={rejectTour}
                                        disabled={acting === 'reject' || !rejectReason}
                                        className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 active:scale-95 transition disabled:opacity-50"
                                    >
                                        {acting === 'reject' ? '⏳ Submitting...' : '⚠️ Submit Dispute'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Timeline / Activity Log */}
                {segments.length === 0 && !['COMPLETED', 'CLOSED', 'DISPUTED'].includes(tour.status) ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <div className="text-4xl mb-3">📝</div>
                        <p className="font-medium text-gray-700">No itinerary defined</p>
                        <p className="text-sm text-gray-500">The guide will log activities freely during this tour.</p>
                    </div>
                ) : isFreeFormMode ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <span>📝</span> Guide Activity Log
                        </h3>
                        {segments.map((seg, idx) => (
                            <div key={seg.id} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono text-gray-400">{idx + 1}</span>
                                    <span className="font-medium text-gray-900 text-sm">{seg.title}</span>
                                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-green-100 text-green-700">✓</span>
                                </div>
                                {(seg as any).locationName && (
                                    <p className="text-xs text-gray-500 mt-1 ml-6">📍 {(seg as any).locationName}</p>
                                )}
                                {seg.checkIn?.note && (
                                    <p className="text-xs text-gray-500 mt-1 ml-6">{seg.checkIn.note}</p>
                                )}
                                {seg.checkIn?.checkInTime && (
                                    <p className="text-[10px] text-gray-400 mt-0.5 ml-6">
                                        ⏰ {new Date(seg.checkIn.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : segments.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <ExecutionTimeline segments={segments} tourStatus={tour.status} />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
