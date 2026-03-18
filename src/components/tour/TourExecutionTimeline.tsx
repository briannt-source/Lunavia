'use client';

import { useEffect, useState, useCallback } from 'react';

interface CheckIn {
    id: string;
    checkInTime: string;
    note: string | null;
    edited: boolean;
    editReason: string | null;
}

interface Segment {
    id: string;
    title: string;
    type: string;
    plannedStartTime: string | null;
    orderIndex: number;
    checkIn: CheckIn | null;
}

const TYPE_LABELS: Record<string, string> = {
    ACTIVITY: '🎯 Activity',
    MEAL: '🍽️ Meal',
    TRANSFER: '🚗 Transfer',
    HOTEL: '🏨 Hotel',
    SIGHTSEEING: '📸 Sightseeing',
    OTHER: '📌 Other',
};

export default function TourExecutionTimeline({ tourId }: { tourId: string }) {
    const [segments, setSegments] = useState<Segment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`/api/tours/${tourId}/execution`);
            const json = await res.json();
            if (json.success) {
                setSegments(json.data.segments);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [tourId]);

    useEffect(() => {
        fetchData();
        // Poll every 30s for live updates
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (loading) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Tour Execution</h2>
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (segments.length === 0) return null;

    const completedCount = segments.filter((s) => s.checkIn).length;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Tour Execution</h2>
                <span className="text-sm font-medium text-gray-500">
                    {completedCount}/{segments.length} checked in
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-5">
                <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${(completedCount / segments.length) * 100}%` }}
                />
            </div>

            {/* Timeline */}
            <div className="space-y-0">
                {segments.map((seg, idx) => {
                    const isCheckedIn = !!seg.checkIn;

                    return (
                        <div key={seg.id} className="flex gap-4">
                            {/* Left: timeline dot + line */}
                            <div className="flex flex-col items-center">
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${isCheckedIn ? 'bg-green-500' : 'bg-gray-300'
                                    }`} />
                                {idx < segments.length - 1 && (
                                    <div className={`w-0.5 flex-1 min-h-[24px] ${isCheckedIn ? 'bg-green-300' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>

                            {/* Right: content */}
                            <div className={`flex-1 pb-4 ${idx === segments.length - 1 ? 'pb-0' : ''}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-medium ${isCheckedIn ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {seg.title}
                                            </span>
                                            {seg.checkIn?.edited && (
                                                <span
                                                    className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium cursor-help"
                                                    title={`Edited: ${seg.checkIn.editReason || 'No reason'}`}
                                                >
                                                    Edited
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            {TYPE_LABELS[seg.type] || seg.type}
                                            {seg.plannedStartTime && ` • Planned ${formatTime(seg.plannedStartTime)}`}
                                        </div>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        {isCheckedIn ? (
                                            <span className="text-sm font-medium text-green-600">
                                                ✓ {formatTime(seg.checkIn!.checkInTime)}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium">
                                                ⏳ Upcoming
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {seg.checkIn?.note && (
                                    <div className="text-xs text-gray-500 mt-1 italic">
                                        &quot;{seg.checkIn.note}&quot;
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
