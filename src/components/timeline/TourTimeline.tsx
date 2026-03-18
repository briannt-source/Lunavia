'use client';

import { useState, useEffect } from 'react';

interface TimelineEvent {
    id: string;
    eventType: string;
    eventLabel: string;
    actorId: string | null;
    actorRole: string;
    metadata: Record<string, any> | null;
    createdAt: string;
}

interface TimelineData {
    tourId: string;
    tourTitle: string;
    events: TimelineEvent[];
}

const ACTOR_ICONS: Record<string, string> = {
    GUIDE: '👤',
    OPERATOR: '🏢',
    SYSTEM: '⚙️',
    INTERNAL: '🛡️',
};

const EVENT_COLORS: Record<string, string> = {
    TOUR_PUBLISHED: 'bg-blue-500',
    GUIDE_ASSIGNED: 'bg-indigo-500',
    GUIDE_CHECKED_IN: 'bg-cyan-500',
    TOUR_STARTED_BY_OPERATOR: 'bg-green-500',
    TOUR_AUTO_STARTED: 'bg-green-400',
    TOUR_RETURNED: 'bg-yellow-500',
    TOUR_COMPLETED: 'bg-emerald-500',
    TOUR_CANCELLED: 'bg-red-500',
    TOUR_CLOSED: 'bg-purple-500',
    PAYMENT_REQUESTED: 'bg-orange-500',
    PAYMENT_ACCEPTED: 'bg-green-600',
    PAYMENT_REJECTED: 'bg-red-600',
    INCIDENT_REPORTED: 'bg-red-400',
    DISPUTE_OPENED: 'bg-yellow-600',
    DISPUTE_RESOLVED: 'bg-blue-600',
    LATE_RETURN_FLAGGED: 'bg-amber-500',
};

interface Props {
    tourId: string;
    showFilters?: boolean;
}

export default function TourTimeline({ tourId, showFilters = false }: Props) {
    const [timeline, setTimeline] = useState<TimelineData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterRole, setFilterRole] = useState<string>('ALL');

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/requests/${tourId}/timeline`);
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to fetch timeline');
                }
                const data = await res.json();
                setTimeline(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (tourId) {
            fetchTimeline();
        }
    }, [tourId]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredEvents = timeline?.events.filter(event => {
        if (filterRole === 'ALL') return true;
        return event.actorRole === filterRole;
    }) || [];

    if (loading) {
        return (
            <div className="bg-white rounded-lg border p-6">
                <div className="animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3">
                                <div className="w-3 h-3 bg-gray-200 rounded-full mt-1"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                                    <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg border p-6">
                <div className="text-red-500 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            </div>
        );
    }

    if (!timeline || timeline.events.length === 0) {
        return (
            <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Tour Timeline</h3>
                <div className="text-gray-500 text-sm text-center py-4">
                    No events recorded yet
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Tour Timeline</h3>
                {showFilters && (
                    <select
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                    >
                        <option value="ALL">All Actors</option>
                        <option value="GUIDE">Guide</option>
                        <option value="OPERATOR">Operator</option>
                        <option value="SYSTEM">System</option>
                        <option value="INTERNAL">Internal</option>
                    </select>
                )}
            </div>

            {/* Timeline */}
            <div className="p-4">
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-200"></div>

                    <div className="space-y-4">
                        {filteredEvents.map((event, index) => (
                            <div key={event.id} className="relative flex gap-4 pl-6">
                                {/* Dot */}
                                <div className={`
                                    absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white
                                    ${EVENT_COLORS[event.eventType] || 'bg-gray-400'}
                                `}></div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-gray-900">
                                            {event.eventLabel}
                                        </span>
                                        <span className="text-xs text-gray-400" title={event.actorRole}>
                                            {ACTOR_ICONS[event.actorRole] || '•'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {formatTime(event.createdAt)}
                                    </div>
                                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            {Object.entries(event.metadata).map(([key, value]) => (
                                                <span key={key} className="mr-2">
                                                    {key}: {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} • Read-only audit log
            </div>
        </div>
    );
}
