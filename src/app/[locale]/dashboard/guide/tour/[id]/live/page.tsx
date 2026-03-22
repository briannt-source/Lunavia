'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SegmentStatusBadge } from '@/components/execution/SegmentStatusBadge';
import { IncidentReportModal } from '@/components/execution/IncidentReportModal';

interface CheckIn {
    id: string;
    status: string;
    checkInTime: string;
    note: string | null;
    photoUrl: string | null;
    edited: boolean;
    editReason: string | null;
}

interface Segment {
    id: string;
    title: string;
    type: string;
    locationName?: string | null;
    plannedStartTime: string | null;
    orderIndex: number;
    checkIn: CheckIn | null;
}

interface TourInfo {
    id: string;
    title: string;
    status: string;
    startTime: string;
    endTime: string;
}

const SEGMENT_ICONS: Record<string, string> = {
    ATTRACTION: '🏛️',
    ACTIVITY: '🎯',
    MEAL: '🍽️',
    TRANSFER: '🚗',
    HOTEL: '🏨',
    SIGHTSEEING: '📸',
    OTHER: '📌',
};

// Status flow: ARRIVED → STARTED → COMPLETED (or SKIPPED at any point)
const NEXT_STATUS: Record<string, { status: string; label: string; color: string }> = {
    '': { status: 'ARRIVED', label: '📍 Arrived', color: 'bg-lunavia-primary hover:bg-lunavia-primary-hover active:bg-blue-800' },
    ARRIVED: { status: 'STARTED', label: '▶️ Start Activity', color: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800' },
    STARTED: { status: 'COMPLETED', label: '✓ Complete', color: 'bg-green-600 hover:bg-green-700 active:bg-green-800' },
};

export default function GuideLiveTourPage() {
    const params = useParams();
    const router = useRouter();
    const tourId = params.id as string;

    const [tour, setTour] = useState<TourInfo | null>(null);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingSegment, setProcessingSegment] = useState<string | null>(null);
    const [noteInput, setNoteInput] = useState<Record<string, string>>({});
    const [photoInput, setPhotoInput] = useState<Record<string, string>>({});
    const [showNoteFor, setShowNoteFor] = useState<string | null>(null);
    const [incidentModal, setIncidentModal] = useState<{ segmentId: string; segmentTitle: string } | null>(null);

    // Edit state
    const [editingCheckIn, setEditingCheckIn] = useState<CheckIn | null>(null);
    const [editTime, setEditTime] = useState('');
    const [editReason, setEditReason] = useState('');
    const [editSubmitting, setEditSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`/api/tours/${tourId}/execution`);
            const json = await res.json();
            if (json.success) {
                setTour(json.data.tour);
                setSegments(json.data.segments);
            } else {
                setError(json.error || 'Failed to load');
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }, [tourId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCheckIn = async (segmentId: string, status: string) => {
        setProcessingSegment(segmentId);
        try {
            const res = await fetch(`/api/segments/${segmentId}/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    notes: noteInput[segmentId] || undefined,
                    photoUrl: photoInput[segmentId] || undefined,
                }),
            });
            const json = await res.json();
            if (json.success) {
                setNoteInput(p => ({ ...p, [segmentId]: '' }));
                setPhotoInput(p => ({ ...p, [segmentId]: '' }));
                setShowNoteFor(null);
                await fetchData();
            } else {
                alert(json.error || 'Check-in failed');
            }
        } catch {
            alert('Network error');
        } finally {
            setProcessingSegment(null);
        }
    };

    const handleEditSubmit = async () => {
        if (!editingCheckIn || !editReason.trim() || editReason.trim().length < 3) {
            alert('Reason is required (min 3 characters)');
            return;
        }
        setEditSubmitting(true);
        try {
            const res = await fetch(`/api/checkins/${editingCheckIn.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newCheckInTime: new Date(editTime).toISOString(),
                    reason: editReason.trim(),
                }),
            });
            const json = await res.json();
            if (json.success) {
                setEditingCheckIn(null);
                setEditTime('');
                setEditReason('');
                await fetchData();
            } else {
                alert(json.error || 'Edit failed');
            }
        } catch {
            alert('Network error');
        } finally {
            setEditSubmitting(false);
        }
    };

    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse text-gray-500 text-lg">Loading tour...</div>
            </div>
        );
    }

    if (error || !tour) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-3">
                    <div className="text-red-500 text-lg font-medium">{error || 'Tour not found'}</div>
                    <button onClick={() => router.push('/dashboard/guide/assigned')} className="text-[#5BA4CF] underline text-sm">
                        Back to Assigned Tours
                    </button>
                </div>
            </div>
        );
    }

    const completedCount = segments.filter(s => s.checkIn && s.checkIn.status === 'COMPLETED').length;
    const totalCount = segments.length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-lg mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg font-bold text-gray-900 truncate">{tour.title}</h1>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{formatDate(tour.startTime)}</span>
                                <span>•</span>
                                <span className={`font-medium ${tour.status === 'IN_PROGRESS' ? 'text-green-600' : 'text-gray-500'}`}>
                                    {tour.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                        <div className="ml-3 flex-shrink-0">
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">{completedCount}/{totalCount}</div>
                                <div className="text-xs text-gray-500">completed</div>
                            </div>
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
                        />
                    </div>
                </div>
            </div>

            {/* Segments Timeline */}
            <div className="max-w-lg mx-auto px-4 py-6">
                {segments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="font-medium">No segments yet</p>
                        <p className="text-sm">The operator will add tour segments.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {segments.map((segment, idx) => {
                            const currentStatus = segment.checkIn?.status || '';
                            const isCompleted = currentStatus === 'COMPLETED';
                            const isSkipped = currentStatus === 'SKIPPED';
                            const isDone = isCompleted || isSkipped;
                            const isNext = !isDone && (idx === 0 || (segments[idx - 1]?.checkIn?.status === 'COMPLETED' || segments[idx - 1]?.checkIn?.status === 'SKIPPED'));
                            const isActive = currentStatus === 'ARRIVED' || currentStatus === 'STARTED';
                            const icon = SEGMENT_ICONS[segment.type] || '📌';
                            const nextAction = NEXT_STATUS[currentStatus];

                            return (
                                <div key={segment.id} className="relative">
                                    {/* Timeline connector */}
                                    {idx < segments.length - 1 && (
                                        <div className={`absolute left-5 top-12 w-0.5 h-[calc(100%-12px)] ${isCompleted ? 'bg-green-300' : isSkipped ? 'bg-gray-300' : 'bg-gray-200'}`} />
                                    )}

                                    <div className="relative flex gap-3">
                                        {/* Timeline dot */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg
                                            ${isCompleted ? 'bg-green-100 text-green-700' :
                                                isActive ? 'bg-lunavia-muted/50 text-lunavia-primary-hover ring-2 ring-blue-400 ring-offset-2' :
                                                    isSkipped ? 'bg-gray-200 text-gray-500' :
                                                        isNext ? 'bg-lunavia-muted/50 text-lunavia-primary-hover ring-2 ring-blue-400 ring-offset-2' :
                                                            'bg-gray-100 text-gray-400'}`}
                                        >
                                            {isCompleted ? '✓' : isSkipped ? '–' : icon}
                                        </div>

                                        {/* Content */}
                                        <div className={`flex-1 min-w-0 rounded-xl p-4 ${isCompleted ? 'bg-green-50 border border-green-200' :
                                                isActive ? 'bg-lunavia-light border-2 border-lunavia-primary/40 shadow-sm' :
                                                    isSkipped ? 'bg-gray-50 border border-gray-200' :
                                                        isNext ? 'bg-white border-2 border-lunavia-primary/40 shadow-sm' :
                                                            'bg-white border border-gray-200'
                                            }`}>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <h3 className={`font-semibold ${isCompleted ? 'text-green-800' :
                                                            isActive || isNext ? 'text-blue-800' :
                                                                'text-gray-700'
                                                        }`}>
                                                        {segment.title}
                                                    </h3>
                                                    {segment.locationName && (
                                                        <p className="text-xs text-gray-500 mt-0.5">📍 {segment.locationName}</p>
                                                    )}
                                                    {segment.plannedStartTime && (
                                                        <div className="text-sm text-gray-500 mt-0.5">
                                                            Planned: {formatTime(segment.plannedStartTime)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs text-gray-400 uppercase font-medium">{segment.type}</span>
                                                    {currentStatus && <SegmentStatusBadge status={currentStatus} />}
                                                </div>
                                            </div>

                                            {/* Checked-in state */}
                                            {segment.checkIn && (
                                                <div className="mt-3 space-y-2 border-t border-gray-200/50 pt-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-green-600 font-medium">
                                                            ✓ {formatTime(segment.checkIn.checkInTime)}
                                                        </span>
                                                        {segment.checkIn.edited && (
                                                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">Edited</span>
                                                        )}
                                                    </div>
                                                    {segment.checkIn.note && (
                                                        <div className="text-sm text-gray-600 italic">&quot;{segment.checkIn.note}&quot;</div>
                                                    )}
                                                    {segment.checkIn.photoUrl && (
                                                        <img src={segment.checkIn.photoUrl} alt="Check-in" className="rounded-lg w-full max-w-xs h-32 object-cover border" />
                                                    )}
                                                    {segment.checkIn.edited && segment.checkIn.editReason && (
                                                        <div className="text-xs text-amber-600">Edit: {segment.checkIn.editReason}</div>
                                                    )}
                                                    {!isDone && (
                                                        <button
                                                            onClick={() => {
                                                                setEditingCheckIn(segment.checkIn);
                                                                setEditTime(new Date(segment.checkIn!.checkInTime).toISOString().slice(0, 16));
                                                                setEditReason('');
                                                            }}
                                                            className="text-sm text-[#5BA4CF] font-medium hover:underline"
                                                        >
                                                            Edit time
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Action buttons */}
                                            {!isDone && tour.status === 'IN_PROGRESS' && (
                                                <div className="mt-3 space-y-2">
                                                    {/* Note/photo toggle */}
                                                    {!currentStatus && (
                                                        <button
                                                            onClick={() => setShowNoteFor(showNoteFor === segment.id ? null : segment.id)}
                                                            className="text-xs text-gray-500 hover:text-[#5BA4CF]"
                                                        >
                                                            {showNoteFor === segment.id ? '▾ Hide options' : '▸ Add note / photo'}
                                                        </button>
                                                    )}

                                                    {showNoteFor === segment.id && (
                                                        <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                                                            <input
                                                                type="text"
                                                                placeholder="Add a note..."
                                                                value={noteInput[segment.id] || ''}
                                                                onChange={e => setNoteInput(p => ({ ...p, [segment.id]: e.target.value }))}
                                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-lunavia-primary"
                                                            />
                                                            <input
                                                                type="url"
                                                                placeholder="Photo URL (optional)"
                                                                value={photoInput[segment.id] || ''}
                                                                onChange={e => setPhotoInput(p => ({ ...p, [segment.id]: e.target.value }))}
                                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-lunavia-primary"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Main action */}
                                                    {nextAction && (
                                                        <button
                                                            onClick={() => handleCheckIn(segment.id, nextAction.status)}
                                                            disabled={processingSegment === segment.id}
                                                            className={`w-full py-3 rounded-lg font-semibold text-base text-white transition shadow-sm ${nextAction.color}
                                                                ${processingSegment === segment.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                            style={{ minHeight: '48px' }}
                                                        >
                                                            {processingSegment === segment.id ? '⏳ Processing...' : nextAction.label}
                                                        </button>
                                                    )}

                                                    {/* Skip + Report row */}
                                                    <div className="flex gap-2">
                                                        {!isCompleted && (
                                                            <button
                                                                onClick={() => handleCheckIn(segment.id, 'SKIPPED')}
                                                                disabled={processingSegment === segment.id}
                                                                className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                                            >
                                                                Skip Segment
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setIncidentModal({ segmentId: segment.id, segmentTitle: segment.title })}
                                                            className="flex-1 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50"
                                                        >
                                                            ⚠ Report Issue
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* All done */}
                {totalCount > 0 && completedCount === totalCount && (
                    <div className="mt-8 text-center py-6 bg-green-50 rounded-xl border border-green-200">
                        <div className="text-4xl mb-2">🎉</div>
                        <div className="text-lg font-bold text-green-800">All segments completed!</div>
                        <div className="text-sm text-green-600 mt-1">Great work. The operator has been notified.</div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingCheckIn && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
                    <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Edit Check-In</h2>
                            <button onClick={() => setEditingCheckIn(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
                                <input
                                    type="datetime-local"
                                    value={editTime}
                                    onChange={e => setEditTime(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:ring-2 focus:ring-lunavia-primary focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for edit <span className="text-red-500">*</span></label>
                                <textarea
                                    value={editReason}
                                    onChange={e => setEditReason(e.target.value)}
                                    placeholder="e.g., Traffic delay, time zone error..."
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:ring-2 focus:ring-lunavia-primary focus:border-blue-500 resize-none"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleEditSubmit}
                            disabled={editSubmitting || !editReason.trim()}
                            className="w-full py-3 bg-lunavia-primary text-white rounded-lg font-semibold text-base hover:bg-lunavia-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
                            style={{ minHeight: '48px' }}
                        >
                            {editSubmitting ? 'Saving...' : 'Save Edit'}
                        </button>
                    </div>
                </div>
            )}

            {/* Incident Report Modal */}
            {incidentModal && (
                <IncidentReportModal
                    tourId={tourId}
                    segmentId={incidentModal.segmentId}
                    segmentTitle={incidentModal.segmentTitle}
                    onClose={() => setIncidentModal(null)}
                    onSubmitted={fetchData}
                />
            )}
        </div>
    );
}
