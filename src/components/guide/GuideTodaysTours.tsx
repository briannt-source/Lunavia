'use client';

import { useEffect, useState, useCallback } from 'react';

// ── Guide Today's Tours ───────────────────────────────────────────────
// Shows tours assigned to guide for today with action buttons

interface TodayTour {
    id: string;
    title: string;
    status: string;
    startDate: string;
    endDate: string | null;
    pickupLocation: string | null;
    guideCheckedInAt: string | null;
    operatorStartedAt: string | null;
    segmentCount: number;
    completedSegments: number;
}

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string }> = {
    ASSIGNED: { label: 'Assigned', bg: 'bg-blue-100', text: 'text-blue-700' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-green-100', text: 'text-green-700' },
    COMPLETED: { label: 'Completed', bg: 'bg-gray-100', text: 'text-gray-600' },
    OFFERED: { label: 'Offered', bg: 'bg-amber-100', text: 'text-amber-700' },
};

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function GuideTodaysTours({ userId }: { userId: string }) {
    const [tours, setTours] = useState<TodayTour[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTours = useCallback(async () => {
        try {
            const res = await fetch(`/api/guide/today-tours`);
            const json = await res.json();
            if (json.success) setTours(json.data.tours);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchTours(); }, [fetchTours]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Today&apos;s Tours</h3>
                <div className="animate-pulse space-y-3">
                    <div className="h-16 bg-gray-100 rounded-lg" />
                    <div className="h-16 bg-gray-100 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Today&apos;s Tours</h3>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                    {tours.length} tour{tours.length !== 1 ? 's' : ''}
                </span>
            </div>

            {tours.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                    <div className="text-2xl mb-1">🌴</div>
                    <p className="text-sm">No tours scheduled for today.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tours.map(tour => {
                        const badge = STATUS_BADGES[tour.status] || STATUS_BADGES.ASSIGNED;
                        const isInProgress = tour.status === 'IN_PROGRESS';
                        const isAssigned = tour.status === 'ASSIGNED';
                        const isCompleted = tour.status === 'COMPLETED';

                        return (
                            <div key={tour.id} className={`rounded-lg border p-4 transition ${isInProgress ? 'border-green-200 bg-green-50/50' :
                                    isCompleted ? 'border-gray-200 bg-gray-50/50 opacity-70' :
                                        'border-gray-200 hover:border-indigo-200'
                                }`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium text-sm text-gray-900 truncate">{tour.title}</h4>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${badge.bg} ${badge.text}`}>
                                                {badge.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span>⏰ {formatTime(tour.startDate)}{tour.endDate ? ` – ${formatTime(tour.endDate)}` : ''}</span>
                                            {tour.pickupLocation && <span>📍 {tour.pickupLocation}</span>}
                                        </div>
                                        {isInProgress && tour.segmentCount > 0 && (
                                            <div className="mt-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                                        <div
                                                            className="bg-green-500 h-1.5 rounded-full transition-all"
                                                            style={{ width: `${(tour.completedSegments / tour.segmentCount) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span>{tour.completedSegments}/{tour.segmentCount}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-1.5 flex-shrink-0">
                                        {isAssigned && (
                                            <a href={`/dashboard/guide/tour/${tour.id}/live`}
                                                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition">
                                                Start Tour
                                            </a>
                                        )}
                                        {isInProgress && (
                                            <a href={`/dashboard/guide/tour/${tour.id}/live`}
                                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition">
                                                Continue
                                            </a>
                                        )}
                                        <a href={`/dashboard/guide/tour/${tour.id}/live`}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition">
                                            Timeline
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
