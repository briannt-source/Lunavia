'use client';

import { useEffect, useState, useCallback } from 'react';
import { TourExecutionTimeline } from '@/components/execution/TourExecutionTimeline';
import { TourHealthBadge } from '@/components/execution/TourHealthBadge';
import { useTourGeolocation } from '@/hooks/useTourGeolocation';
import { GuestListPanel } from '@/components/tour/GuestListPanel';

// ── Guide Mobile Execution Interface ──────────────────────────────────
// Mobile-first tour execution with large buttons and minimal text

interface Segment {
    id: string;
    title: string;
    type: string;
    plannedStartTime: string | null;
    orderIndex: number;
    checkIn: { id: string; status: string; checkInTime: string; note: string | null } | null;
}

interface TourData {
    tour: { id: string; title: string; status: string; startTime: string; endTime: string | null };
    segments: Segment[];
}

// ── Status Helpers ────────────────────────────────────────────────────

const SEGMENT_STATES: Record<string, { label: string; bg: string; text: string }> = {
    ARRIVED: { label: 'Arrived', bg: 'bg-blue-100', text: 'text-blue-700' },
    STARTED: { label: 'In Progress', bg: 'bg-indigo-100', text: 'text-indigo-700' },
    COMPLETED: { label: 'Done', bg: 'bg-green-100', text: 'text-green-700' },
    SKIPPED: { label: 'Skipped', bg: 'bg-gray-200', text: 'text-gray-600' },
};

const COMPLETION_STATUSES = [
    { value: 'COMPLETED_OK', label: '✅ Completed Successfully', desc: 'Tour went as planned, no issues' },
    { value: 'COMPLETED_WITH_ISSUES', label: '⚠️ Completed with Issues', desc: 'Tour completed but had problems' },
    { value: 'PARTIALLY_COMPLETED', label: '🔶 Partially Completed', desc: 'Some segments were skipped or cut short' },
];

function nextAction(checkIn: Segment['checkIn']): { label: string; status: string; color: string } | null {
    if (!checkIn) return { label: '📍 Arrived', status: 'ARRIVED', color: 'bg-blue-600 hover:bg-blue-700' };
    switch (checkIn.status) {
        case 'ARRIVED': return { label: '▶️ Start', status: 'STARTED', color: 'bg-indigo-600 hover:bg-indigo-700' };
        case 'STARTED': return { label: '✅ Complete', status: 'COMPLETED', color: 'bg-green-600 hover:bg-green-700' };
        default: return null;
    }
}

// ── Main Component ────────────────────────────────────────────────────

export function GuideExecutionInterface({ tourId }: { tourId: string }) {
    const [data, setData] = useState<TourData | null>(null);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState<string | null>(null);
    const [showTimeline, setShowTimeline] = useState(false);
    const [showIncident, setShowIncident] = useState(false);
    const [showNote, setShowNote] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [incidentDesc, setIncidentDesc] = useState('');
    const [incidentSev, setIncidentSev] = useState('MEDIUM');
    const [error, setError] = useState('');

    // Return Tour state
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [returnStatus, setReturnStatus] = useState('COMPLETED_OK');
    const [returnNotes, setReturnNotes] = useState('');
    const [returnIncident, setReturnIncident] = useState('');
    const [returnSuccess, setReturnSuccess] = useState(false);
    const [guestWarning, setGuestWarning] = useState('');

    // Free-form Activity Log state
    const [showActivityForm, setShowActivityForm] = useState(false);
    const [activityTitle, setActivityTitle] = useState('');
    const [activityLocation, setActivityLocation] = useState('');
    const [activityNotes, setActivityNotes] = useState('');
    const [hadPredefinedSegments, setHadPredefinedSegments] = useState<boolean | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`/api/tours/${tourId}/execution`);
            const json = await res.json();
            if (json.success) {
                setData(json.data);
                // Track if operator created itinerary (first load only)
                if (hadPredefinedSegments === null) {
                    const segs = json.data.segments || [];
                    // Predefined = segments exist and at least one is NOT type OTHER or has no check-in yet
                    const isPredefined = segs.length > 0 && segs.some((s: any) => s.type !== 'OTHER' || !s.checkIn);
                    setHadPredefinedSegments(isPredefined);
                }
            }
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [tourId, hadPredefinedSegments]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Live Tracking Hook
    const isTourActive = data?.tour.status === 'IN_PROGRESS';
    const { isTracking, lastPingAt, error: geoError } = useTourGeolocation({
        tourId,
        isActive: !!isTourActive,
        pingIntervalMs: 60000 // Send ping every 60 seconds
    });

    // ── Actions ───────────────────────────────────────────────────

    const startTour = async () => {
        setActing('start');
        setError('');
        try {
            const res = await fetch(`/api/requests/${tourId}/start`, { method: 'POST' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed');
            await fetchData();
        } catch (e: any) { setError(e.message); }
        finally { setActing(null); }
    };

    const checkInSegment = async (segmentId: string, status: string) => {
        setActing(segmentId);
        setError('');
        try {
            const res = await fetch(`/api/segments/${segmentId}/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed');
            await fetchData();
        } catch (e: any) { setError(e.message); }
        finally { setActing(null); }
    };

    const skipSegment = async (segmentId: string) => {
        setActing(`skip-${segmentId}`);
        setError('');
        try {
            const res = await fetch(`/api/segments/${segmentId}/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'SKIPPED', notes: 'Skipped by guide' }),
            });
            if (!res.ok) throw new Error('Failed to skip');
            await fetchData();
        } catch (e: any) { setError(e.message); }
        finally { setActing(null); }
    };

    const submitIncident = async () => {
        if (!incidentDesc.trim()) return;
        setActing('incident');
        try {
            const res = await fetch('/api/incidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: tourId,
                    description: incidentDesc,
                    severity: incidentSev,
                }),
            });
            if (!res.ok) throw new Error('Failed to report');
            setIncidentDesc('');
            setShowIncident(false);
            await fetchData();
        } catch (e: any) { setError(e.message); }
        finally { setActing(null); }
    };

    const submitReturnTour = async () => {
        setActing('return');
        setError('');
        try {
            const res = await fetch(`/api/requests/${tourId}/return-tour`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    completionStatus: returnStatus,
                    notes: returnNotes.trim() || undefined,
                    incidentSummary: returnIncident.trim() || undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || json.message || 'Failed to return tour');
            setReturnSuccess(true);
            await fetchData();
        } catch (e: any) { setError(e.message); }
        finally { setActing(null); }
    };

    const submitActivityLog = async () => {
        if (!activityTitle.trim()) { setError('Activity title is required'); return; }
        setActing('activity');
        setError('');
        try {
            const res = await fetch(`/api/tours/${tourId}/activity-log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: activityTitle.trim(),
                    locationName: activityLocation.trim() || undefined,
                    notes: activityNotes.trim() || undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to log activity');
            setActivityTitle('');
            setActivityLocation('');
            setActivityNotes('');
            setShowActivityForm(false);
            await fetchData();
        } catch (e: any) { setError(e.message); }
        finally { setActing(null); }
    };

    // ── Loading State ─────────────────────────────────────────────

    if (loading || !data) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="animate-pulse space-y-4 max-w-lg mx-auto">
                    <div className="h-24 bg-white rounded-2xl" />
                    <div className="h-40 bg-white rounded-2xl" />
                    <div className="h-32 bg-white rounded-2xl" />
                </div>
            </div>
        );
    }

    const { tour, segments } = data;
    const isAssigned = tour.status === 'ASSIGNED';
    const isInProgress = tour.status === 'IN_PROGRESS';
    const isCompleted = tour.status === 'COMPLETED';
    const isClosed = tour.status === 'CLOSED';
    const isDisputed = tour.status === 'DISPUTED';

    const completedCount = segments.filter(s => s.checkIn?.status === 'COMPLETED').length;
    const progress = segments.length > 0 ? (completedCount / segments.length) * 100 : 0;
    const allSegmentsDone = segments.length > 0 && segments.every(s => s.checkIn && ['COMPLETED', 'SKIPPED'].includes(s.checkIn.status));
    const isFreeFormMode = !hadPredefinedSegments;
    // In free-form mode, guide can return anytime (they logged at least 1 activity or choose to return empty)
    const canReturn = isFreeFormMode ? true : allSegmentsDone;

    // Find current segment (first non-completed)
    const currentIdx = segments.findIndex(s => !s.checkIn || !['COMPLETED', 'SKIPPED'].includes(s.checkIn.status));

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* ── Tour Header ────────────────────────────── */}
            <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-20">
                <div className="max-w-lg mx-auto">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg font-bold text-gray-900 truncate">{tour.title}</h1>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <span>{new Date(tour.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                {tour.endTime && <span>– {new Date(tour.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>}
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isInProgress ? 'bg-green-100 text-green-700' :
                                        isCompleted ? 'bg-amber-100 text-amber-700' :
                                        isClosed ? 'bg-green-100 text-green-700' :
                                        isDisputed ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                    }`}>{tour.status === 'COMPLETED' ? 'PENDING CONFIRMATION' : tour.status}</span>
                                {isTracking && (
                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 ml-1 shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
                                        LIVE
                                    </span>
                                )}
                            </div>
                        </div>
                        <TourHealthBadge tourId={tourId} compact autoRefresh />
                    </div>
                    {/* Progress bar */}
                    {segments.length > 0 && (
                        <div className="mt-3">
                            <div className="bg-gray-100 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">{completedCount}/{segments.length} segments</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                        {error}
                        <button onClick={() => setError('')} className="ml-2 text-red-400">✕</button>
                    </div>
                )}

                {/* ── Tour Closed Banner ──────────────────── */}
                {isClosed && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                        <div className="text-4xl mb-2">✅</div>
                        <h2 className="font-bold text-green-800 text-lg">Tour Confirmed & Closed</h2>
                        <p className="text-sm text-green-600 mt-1">The operator has confirmed your tour completion. Your payout will be processed.</p>
                    </div>
                )}

                {/* ── Tour Disputed Banner ────────────────── */}
                {isDisputed && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
                        <div className="text-4xl mb-2">⚠️</div>
                        <h2 className="font-bold text-red-800 text-lg">Tour Under Dispute</h2>
                        <p className="text-sm text-red-600 mt-1">The operator has raised a dispute. Our operations team will review and resolve this. Your payout is on hold until resolved.</p>
                    </div>
                )}

                {/* ── Waiting for Confirmation Banner ─────── */}
                {isCompleted && !returnSuccess && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                        <div className="text-4xl mb-2">⏳</div>
                        <h2 className="font-bold text-amber-800 text-lg">Waiting for Operator Confirmation</h2>
                        <p className="text-sm text-amber-600 mt-1">You&apos;ve returned this tour. The operator will confirm or review your report before the tour is closed and payout is released.</p>
                    </div>
                )}

                {/* ── Return Success Banner ───────────────── */}
                {returnSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                        <div className="text-4xl mb-2">📤</div>
                        <h2 className="font-bold text-green-800 text-lg">Tour Returned Successfully</h2>
                        <p className="text-sm text-green-600 mt-1">Your tour report has been submitted. The operator will review and confirm.</p>
                    </div>
                )}

                {/* ── Pickup / Start Phase ────────────────── */}
                {isAssigned && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <h2 className="font-semibold text-gray-900 mb-1">Start Tour</h2>
                        <p className="text-xs text-gray-500 mb-4">Confirm you&apos;re ready to begin this tour.</p>
                        <button
                            onClick={startTour}
                            disabled={acting === 'start'}
                            className="w-full py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-wait"
                        >
                            {acting === 'start' ? '⏳ Starting...' : '🚀 Start Tour'}
                        </button>
                    </div>
                )}

                {/* ── Segments (Predefined Itinerary Mode) ── */}
                {(isInProgress || isCompleted) && !isFreeFormMode && (
                    <div className="space-y-3">
                        <h2 className="font-semibold text-gray-900 px-1">Segments</h2>
                        {segments.map((seg, idx) => {
                            const state = seg.checkIn ? SEGMENT_STATES[seg.checkIn.status] : null;
                            const action = !isCompleted ? nextAction(seg.checkIn) : null;
                            const isCurrent = idx === currentIdx;
                            const isDone = seg.checkIn?.status === 'COMPLETED' || seg.checkIn?.status === 'SKIPPED';
                            const canSkip = !isDone && seg.checkIn?.status !== 'STARTED' && !isCompleted;

                            return (
                                <div key={seg.id} className={`bg-white rounded-2xl border p-4 transition ${isCurrent ? 'border-indigo-300 ring-2 ring-indigo-100' :
                                        isDone ? 'border-gray-200 opacity-60' :
                                            'border-gray-200'
                                    }`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-mono text-gray-400">{idx + 1}</span>
                                                <h3 className="font-medium text-gray-900 text-sm truncate">{seg.title}</h3>
                                                {state && (
                                                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${state.bg} ${state.text}`}>
                                                        {state.label}
                                                    </span>
                                                )}
                                            </div>
                                            {seg.plannedStartTime && (
                                                <p className="text-[10px] text-gray-400 mt-0.5 ml-6">
                                                    ⏰ {new Date(seg.plannedStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    {(action || canSkip) && (
                                        <div className="flex gap-2 mt-3">
                                            {action && (
                                                <button
                                                    onClick={() => checkInSegment(seg.id, action.status)}
                                                    disabled={acting === seg.id}
                                                    className={`flex-1 py-3 text-white font-bold rounded-xl transition active:scale-95 disabled:opacity-50 ${action.color}`}
                                                >
                                                    {acting === seg.id ? '⏳' : action.label}
                                                </button>
                                            )}
                                            {canSkip && (
                                                <button
                                                    onClick={() => skipSegment(seg.id)}
                                                    disabled={acting === `skip-${seg.id}`}
                                                    className="px-4 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition active:scale-95 disabled:opacity-50 text-sm"
                                                >
                                                    {acting === `skip-${seg.id}` ? '⏳' : '⏭ Skip'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Activity Log (Free-form Mode) ────────── */}
                {(isInProgress || isCompleted) && isFreeFormMode && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <h2 className="font-semibold text-gray-900">Activity Log</h2>
                                <p className="text-[10px] text-gray-400 mt-0.5">Log your stops and activities as you go</p>
                            </div>
                            {isInProgress && (
                                <button onClick={() => setShowActivityForm(true)} className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">+ Add Activity</button>
                            )}
                        </div>

                        {/* Add Activity Form */}
                        {showActivityForm && isInProgress && (
                            <div className="bg-white rounded-2xl border-2 border-indigo-200 p-4 space-y-3">
                                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><span>📍</span> Log Activity</h3>
                                <input
                                    type="text"
                                    value={activityTitle}
                                    onChange={e => setActivityTitle(e.target.value)}
                                    placeholder="What did you do? (e.g., Visited Grand Palace)"
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none"
                                />
                                <input
                                    type="text"
                                    value={activityLocation}
                                    onChange={e => setActivityLocation(e.target.value)}
                                    placeholder="Location name (optional)"
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none"
                                />
                                <textarea
                                    value={activityNotes}
                                    onChange={e => setActivityNotes(e.target.value)}
                                    placeholder="Notes (optional)"
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none"
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => { setShowActivityForm(false); setActivityTitle(''); setActivityLocation(''); setActivityNotes(''); }}
                                        className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium">Cancel</button>
                                    <button
                                        onClick={submitActivityLog}
                                        disabled={!activityTitle.trim() || acting === 'activity'}
                                        className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 active:scale-95 transition"
                                    >
                                        {acting === 'activity' ? '⏳ Saving...' : '📍 Log Activity'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Activity entries */}
                        {segments.length > 0 ? (
                            segments.map((seg, idx) => (
                                <div key={seg.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-mono text-gray-400">{idx + 1}</span>
                                        <h3 className="font-medium text-gray-900 text-sm">{seg.title}</h3>
                                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-green-100 text-green-700">✓ Logged</span>
                                    </div>
                                    {seg.checkIn?.note && (
                                        <p className="text-xs text-gray-500 mt-1 ml-6">{seg.checkIn.note}</p>
                                    )}
                                    {seg.checkIn?.checkInTime && (
                                        <p className="text-[10px] text-gray-400 mt-0.5 ml-6">
                                            ⏰ {new Date(seg.checkIn.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                                <div className="text-3xl mb-2">📝</div>
                                <p className="text-sm text-gray-500">No activities logged yet</p>
                                <p className="text-xs text-gray-400 mt-1">Tap &quot;+ Add Activity&quot; to start logging your tour stops</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Guest List ───────────────────────────── */}
                {(isInProgress || isAssigned) && (
                    <GuestListPanel tourId={tourId} tourStatus={tour.status} isGuide />
                )}

                {/* ── Return Tour Form ────────────────────── */}
                {isInProgress && canReturn && showReturnForm && (
                    <div className="bg-white rounded-2xl border-2 border-indigo-200 p-5 space-y-4">
                        <div className="text-center mb-2">
                            <div className="text-3xl mb-1">📋</div>
                            <h2 className="font-bold text-gray-900 text-lg">Return Tour & Submit Report</h2>
                            <p className="text-xs text-gray-500 mt-1">Complete your tour report. The operator will review and confirm.</p>
                        </div>

                        {/* Completion Status */}
                        <div>
                            <label className="text-xs font-semibold text-gray-700 block mb-2">Tour Completion Status *</label>
                            <div className="space-y-2">
                                {COMPLETION_STATUSES.map(cs => (
                                    <button
                                        key={cs.value}
                                        onClick={() => setReturnStatus(cs.value)}
                                        className={`w-full text-left p-3 rounded-xl border-2 transition ${returnStatus === cs.value
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="font-semibold text-sm text-gray-900">{cs.label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{cs.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tour Report */}
                        <div>
                            <label className="text-xs font-semibold text-gray-700 block mb-1">
                                Tour Report <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <p className="text-[10px] text-gray-400 mb-2">Group condition, highlights, suggestions, and any notes for the operator.</p>
                            <textarea
                                value={returnNotes}
                                onChange={e => setReturnNotes(e.target.value)}
                                placeholder="e.g. All 15 guests accounted for. Weather was great. Suggest adding 10 min buffer at stop #3..."
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-28 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none"
                            />
                        </div>

                        {/* Incident Summary */}
                        {returnStatus !== 'COMPLETED_OK' && (
                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">
                                    Incident Summary <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <p className="text-[10px] text-gray-400 mb-2">Describe any incidents or problems that occurred during the tour.</p>
                                <textarea
                                    value={returnIncident}
                                    onChange={e => setReturnIncident(e.target.value)}
                                    placeholder="e.g. One guest had a minor injury at location #2. First aid was provided..."
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-24 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 outline-none"
                                />
                            </div>
                        )}

                        {/* Submit */}
                        <div className="space-y-2 pt-2">
                            <button
                                onClick={submitReturnTour}
                                disabled={acting === 'return'}
                                className="w-full py-4 bg-indigo-600 text-white text-base font-bold rounded-xl hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50"
                            >
                                {acting === 'return' ? '⏳ Submitting...' : '📤 Submit & Return Tour'}
                            </button>
                            <button
                                onClick={() => setShowReturnForm(false)}
                                className="w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-xl text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Quick Note ──────────────────────────── */}
                {isInProgress && (
                    <>
                        {showNote ? (
                            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                                <h3 className="font-semibold text-gray-900 text-sm mb-2">Quick Note</h3>
                                <textarea
                                    value={noteText}
                                    onChange={e => setNoteText(e.target.value)}
                                    placeholder="e.g. traffic delay, weather change..."
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none"
                                />
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => { setShowNote(false); setNoteText(''); }}
                                        className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium">Cancel</button>
                                    <button
                                        disabled={!noteText.trim()}
                                        className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold disabled:opacity-40">
                                        Save Note
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setShowNote(true)}
                                className="w-full py-3 bg-white border border-gray-200 rounded-2xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
                                📝 Add Quick Note
                            </button>
                        )}
                    </>
                )}

                {/* ── Timeline Toggle ─────────────────────── */}
                <button onClick={() => setShowTimeline(v => !v)}
                    className="w-full py-3 bg-white border border-gray-200 rounded-2xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                    <span>📋</span>
                    <span>{showTimeline ? 'Hide Timeline' : 'Show Timeline'}</span>
                </button>

                {showTimeline && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-4">
                        <TourExecutionTimeline tourId={tourId} />
                    </div>
                )}
            </div>

            {/* ── Floating Action Bar ─────────────────────── */}
            {isInProgress && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 z-30">
                    <div className="max-w-lg mx-auto flex gap-2">
                        {/* Report Issue / Emergency */}
                        <button onClick={() => setShowIncident(true)}
                            className="px-3 py-3 bg-red-50 border border-red-200 text-red-700 font-bold rounded-xl text-sm active:scale-95 transition"
                        >
                            ⚠️ Emergency
                        </button>

                        {/* Log Activity (free-form only) */}
                        {isFreeFormMode && !showActivityForm && (
                            <button
                                onClick={() => setShowActivityForm(true)}
                                className="flex-1 py-3.5 bg-white border border-indigo-200 text-indigo-700 font-bold rounded-xl text-sm active:scale-95 transition"
                            >
                                📍 Log
                            </button>
                        )}

                        {/* Return Tour */}
                        {canReturn && !showReturnForm && (
                            <button
                                onClick={async () => {
                                    // Check guest headcount before showing return form
                                    setGuestWarning('');
                                    try {
                                        const res = await fetch(`/api/tours/${tourId}/guests`);
                                        const json = await res.json();
                                        if (json.success && json.headcount && json.headcount.total > 0 && !json.headcount.allAccountedFor) {
                                            setGuestWarning(`⚠️ ${json.headcount.pending} guest(s) still pending. Check in, mark as no-show, or note early leave before returning.`);
                                            return;
                                        }
                                    } catch { /* allow return if API fails */ }
                                    setShowReturnForm(true);
                                }}
                                className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-xl text-sm active:scale-95 transition"
                            >
                                📤 Return Tour
                            </button>
                        )}

                        {/* Refresh */}
                        <button onClick={fetchData}
                            className="px-4 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl text-sm active:scale-95 transition"
                        >
                            🔄
                        </button>
                    </div>
                </div>
            )}

            {/* ── Guest Headcount Warning ──────────────────── */}
            {guestWarning && (
                <div className="fixed bottom-16 left-0 right-0 z-30 px-4">
                    <div className="max-w-lg mx-auto bg-amber-50 border border-amber-300 rounded-xl p-3 text-sm text-amber-800 flex items-center justify-between shadow-lg">
                        <span>{guestWarning}</span>
                        <button onClick={() => setGuestWarning('')} className="ml-2 text-amber-500 font-bold">✕</button>
                    </div>
                </div>
            )}

            {/* ── Incident Modal ──────────────────────────── */}
            {showIncident && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white w-full max-w-lg rounded-t-3xl p-5 pb-8 animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900">Report Issue</h2>
                            <button onClick={() => setShowIncident(false)} className="text-gray-400 p-1">✕</button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1">Severity</label>
                                <div className="flex gap-2">
                                    {['LOW', 'MEDIUM', 'HIGH'].map(s => (
                                        <button key={s} onClick={() => setIncidentSev(s)}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${incidentSev === s
                                                    ? s === 'HIGH' ? 'bg-red-100 border-red-300 text-red-700'
                                                        : s === 'MEDIUM' ? 'bg-amber-100 border-amber-300 text-amber-700'
                                                            : 'bg-blue-100 border-blue-300 text-blue-700'
                                                    : 'bg-gray-50 border-gray-200 text-gray-500'
                                                }`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
                                <textarea
                                    value={incidentDesc}
                                    onChange={e => setIncidentDesc(e.target.value)}
                                    placeholder="What happened?"
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-24 focus:border-red-300 focus:ring-2 focus:ring-red-100 outline-none"
                                />
                            </div>

                            <button
                                onClick={submitIncident}
                                disabled={!incidentDesc.trim() || acting === 'incident'}
                                className="w-full py-4 bg-red-600 text-white font-bold rounded-xl text-base hover:bg-red-700 active:scale-95 transition disabled:opacity-50"
                            >
                                {acting === 'incident' ? '⏳ Submitting...' : '⚠️ Submit Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
