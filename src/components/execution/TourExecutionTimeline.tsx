'use client';

import { useEffect, useState, useCallback } from 'react';

// ── Tour Execution Timeline (Read-Only) ───────────────────────────────
// Displays chronological events aggregated from real DB data

interface TimelineEvent {
    eventType: string;
    timestamp: string;
    title: string;
    description: string | null;
    icon: string;
    segmentId?: string | null;
    metadata?: { photoUrl?: string; severity?: string;[key: string]: any } | null;
}

interface TourExecutionTimelineProps {
    tourId: string;
    autoRefresh?: boolean;
    refreshIntervalMs?: number;
}

const EVENT_COLORS: Record<string, { bg: string; border: string }> = {
    GUIDE_CHECKED_IN: { bg: 'bg-indigo-100', border: 'border-indigo-300' },
    TOUR_STARTED: { bg: 'bg-green-100', border: 'border-green-300' },
    SEGMENT_ARRIVED: { bg: 'bg-sky-100', border: 'border-sky-300' },
    SEGMENT_STARTED: { bg: 'bg-amber-100', border: 'border-amber-300' },
    SEGMENT_COMPLETED: { bg: 'bg-green-100', border: 'border-green-300' },
    SEGMENT_SKIPPED: { bg: 'bg-gray-100', border: 'border-gray-300' },
    INCIDENT_REPORTED: { bg: 'bg-red-100', border: 'border-red-300' },
    TOUR_COMPLETED: { bg: 'bg-emerald-100', border: 'border-emerald-300' },
    TOUR_CLOSED: { bg: 'bg-slate-100', border: 'border-slate-300' },
};

const DEFAULT_COLOR = { bg: 'bg-gray-100', border: 'border-gray-300' };

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function TourExecutionTimeline({ tourId, autoRefresh = false, refreshIntervalMs = 15000 }: TourExecutionTimelineProps) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTimeline = useCallback(async () => {
        try {
            const res = await fetch(`/api/tours/${tourId}/timeline`);
            const json = await res.json();
            if (json.success) {
                setEvents(json.data.timeline);
                setError('');
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
        fetchTimeline();
        if (autoRefresh) {
            const interval = setInterval(fetchTimeline, refreshIntervalMs);
            return () => clearInterval(interval);
        }
    }, [fetchTimeline, autoRefresh, refreshIntervalMs]);

    if (loading) {
        return (
            <div className="py-8 text-center">
                <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                    <div className="w-4 h-4 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
                    Loading timeline...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-6 text-center">
                <div className="text-red-500 text-sm">{error}</div>
                <button onClick={fetchTimeline} className="text-indigo-600 text-sm mt-2 underline">Retry</button>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="py-8 text-center text-gray-500">
                <div className="text-3xl mb-2">📋</div>
                <p className="font-medium">No events yet</p>
                <p className="text-sm">Timeline will populate as the tour progresses.</p>
            </div>
        );
    }

    // Group events by date
    const groupedByDate: Record<string, TimelineEvent[]> = {};
    for (const event of events) {
        const dateKey = formatDate(event.timestamp);
        if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
        groupedByDate[dateKey].push(event);
    }

    return (
        <div className="space-y-5">
            {Object.entries(groupedByDate).map(([date, dateEvents]) => (
                <div key={date}>
                    {/* Date header */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{date}</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Events */}
                    <div className="relative pl-1">
                        {dateEvents.map((event, idx) => {
                            const colors = EVENT_COLORS[event.eventType] || DEFAULT_COLOR;
                            const isIncident = event.eventType === 'INCIDENT_REPORTED';
                            const isCompletion = event.eventType === 'TOUR_COMPLETED';

                            return (
                                <div key={`${event.eventType}-${event.timestamp}-${idx}`} className="relative flex gap-3 pb-4 last:pb-0">
                                    {/* Connector line */}
                                    {idx < dateEvents.length - 1 && (
                                        <div className="absolute left-[15px] top-9 bottom-0 w-0.5 bg-gray-200" />
                                    )}

                                    {/* Icon node */}
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 border ${colors.bg} ${colors.border} ${isIncident ? 'ring-2 ring-red-200' : isCompletion ? 'ring-2 ring-emerald-200' : ''
                                        }`}>
                                        {event.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <span className={`font-semibold text-sm ${isIncident ? 'text-red-700' : 'text-gray-900'}`}>
                                                {event.title}
                                            </span>
                                            <span className="text-xs text-gray-400 whitespace-nowrap font-mono">
                                                {formatTime(event.timestamp)}
                                            </span>
                                        </div>

                                        {event.description && (
                                            <p className={`text-sm mt-0.5 ${isIncident ? 'text-red-600' : 'text-gray-600'}`}>
                                                {event.description}
                                            </p>
                                        )}

                                        {/* Severity badge for incidents */}
                                        {isIncident && event.metadata?.severity && (
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${event.metadata.severity === 'HIGH' ? 'bg-red-100 text-red-700' :
                                                    event.metadata.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {event.metadata.severity}
                                            </span>
                                        )}

                                        {/* Photo thumbnail */}
                                        {event.metadata?.photoUrl && (
                                            <a href={event.metadata.photoUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-1.5">
                                                <img
                                                    src={event.metadata.photoUrl}
                                                    alt="Check-in photo"
                                                    className="w-20 h-14 object-cover rounded-lg border border-gray-200 hover:border-indigo-400 transition"
                                                />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
