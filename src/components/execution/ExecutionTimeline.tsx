'use client';

import { SegmentStatusBadge } from './SegmentStatusBadge';

// ── Execution Timeline ────────────────────────────────────────────────
// Vertical timeline displaying segment progress for operator view

interface CheckInData {
    id: string;
    status: string;
    checkInTime: string;
    note: string | null;
    photoUrl: string | null;
    edited: boolean;
    editReason: string | null;
}

interface SegmentData {
    id: string;
    title: string;
    type: string;
    locationName?: string | null;
    plannedStartTime: string | null;
    plannedEndTime?: string | null;
    orderIndex: number;
    checkIn: CheckInData | null;
}

interface ExecutionTimelineProps {
    segments: SegmentData[];
    tourStatus: string;
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

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function ExecutionTimeline({ segments, tourStatus }: ExecutionTimelineProps) {
    const completedCount = segments.filter(s => s.checkIn && s.checkIn.status === 'COMPLETED').length;
    const totalCount = segments.length;

    return (
        <div className="space-y-1">
            {/* Progress summary */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">
                    {completedCount}/{totalCount} segments completed
                </div>
                <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
                    />
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                {segments.map((segment, idx) => {
                    const hasCheckIn = !!segment.checkIn;
                    const status = segment.checkIn?.status || 'PENDING';
                    const isCompleted = status === 'COMPLETED';
                    const isActive = status === 'ARRIVED' || status === 'STARTED';
                    const isSkipped = status === 'SKIPPED';
                    const icon = SEGMENT_ICONS[segment.type] || '📌';

                    return (
                        <div key={segment.id} className="relative flex gap-4 pb-6 last:pb-0">
                            {/* Vertical line connector */}
                            {idx < segments.length - 1 && (
                                <div className={`absolute left-[19px] top-10 bottom-0 w-0.5 ${isCompleted ? 'bg-green-300' : isSkipped ? 'bg-gray-300' : 'bg-gray-200'
                                    }`} />
                            )}

                            {/* Timeline dot */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 ${isCompleted ? 'bg-green-100 text-green-700' :
                                    isActive ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400' :
                                        isSkipped ? 'bg-gray-200 text-gray-500' :
                                            'bg-gray-100 text-gray-400'
                                }`}>
                                {isCompleted ? '✓' : icon}
                            </div>

                            {/* Content */}
                            <div className={`flex-1 min-w-0 rounded-xl p-4 ${isCompleted ? 'bg-green-50 border border-green-200' :
                                    isActive ? 'bg-blue-50 border border-blue-200' :
                                        isSkipped ? 'bg-gray-50 border border-gray-200' :
                                            'bg-white border border-gray-200'
                                }`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-sm text-gray-900">{segment.title}</h4>
                                        {segment.locationName && (
                                            <p className="text-xs text-gray-500 mt-0.5">📍 {segment.locationName}</p>
                                        )}
                                        {segment.plannedStartTime && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Planned: {formatTime(segment.plannedStartTime)}
                                                {segment.plannedEndTime && ` – ${formatTime(segment.plannedEndTime)}`}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] text-gray-400 uppercase font-medium">{segment.type}</span>
                                        <SegmentStatusBadge status={status} />
                                    </div>
                                </div>

                                {/* Check-in details */}
                                {hasCheckIn && segment.checkIn && (
                                    <div className="mt-3 space-y-1.5 border-t border-gray-200/50 pt-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <span>Checked in at <strong>{formatTime(segment.checkIn.checkInTime)}</strong></span>
                                            {segment.checkIn.edited && (
                                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">Edited</span>
                                            )}
                                        </div>
                                        {segment.checkIn.note && (
                                            <p className="text-xs text-gray-600 italic">&quot;{segment.checkIn.note}&quot;</p>
                                        )}
                                        {segment.checkIn.photoUrl && (
                                            <div className="mt-1">
                                                <img
                                                    src={segment.checkIn.photoUrl}
                                                    alt="Check-in photo"
                                                    className="rounded-lg w-full max-w-xs h-32 object-cover border border-gray-200"
                                                />
                                            </div>
                                        )}
                                        {segment.checkIn.edited && segment.checkIn.editReason && (
                                            <p className="text-[10px] text-amber-600">Edit: {segment.checkIn.editReason}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export type { SegmentData, CheckInData };
