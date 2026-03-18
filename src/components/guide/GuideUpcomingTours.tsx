'use client';

import { useEffect, useState, useCallback } from 'react';

// ── Guide Upcoming Tours ──────────────────────────────────────────────
// Shows tours for the next 7 days

interface UpcomingTour {
    id: string;
    title: string;
    status: string;
    startTime: string;
    operatorName: string | null;
}

function formatDateLabel(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const tourDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (tourDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function GuideUpcomingTours({ userId }: { userId: string }) {
    const [tours, setTours] = useState<UpcomingTour[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTours = useCallback(async () => {
        try {
            const res = await fetch(`/api/guide/upcoming-tours`);
            const json = await res.json();
            if (json.success) setTours(json.data.tours);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchTours(); }, [fetchTours]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Upcoming Tours</h3>
                <div className="animate-pulse space-y-2">
                    <div className="h-12 bg-gray-100 rounded-lg" />
                    <div className="h-12 bg-gray-100 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Upcoming Tours</h3>
                <span className="text-xs text-gray-500">Next 7 days</span>
            </div>

            {tours.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                    No upcoming tours this week.
                </div>
            ) : (
                <div className="space-y-2">
                    {tours.map(tour => (
                        <a key={tour.id}
                            href={`/service/${tour.id}`}
                            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition">
                            <div className="min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 truncate">{tour.title}</h4>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                    <span>📅 {formatDateLabel(tour.startTime)}</span>
                                    <span>⏰ {formatTime(tour.startTime)}</span>
                                    {tour.operatorName && <span>🏢 {tour.operatorName}</span>}
                                </div>
                            </div>
                            <span className="text-gray-400 text-xs">→</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
