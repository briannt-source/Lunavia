'use client';

import { useEffect, useState, useCallback } from 'react';

// ── Operator Live Monitor ─────────────────────────────────────────────
// Real-time command center with auto-refresh

interface TourCard {
    id: string;
    title: string;
    status: string;
    startDate: string;
    guide: { name: string; id: string } | null;
    currentSegment: string | null;
    lastEventTime: string | null;
    incidentCount: number;
    hasHighSeverity: boolean;
    segmentCount: number;
    completedSegments: number;
    tourHealth: string;
    healthColor: string;
}

interface CommandData {
    pickupPhase: TourCard[];
    inProgress: TourCard[];
    completedToday: TourCard[];
    incidents: TourCard[];
    healthCounts: Record<string, number>;
    totalToday: number;
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function TourCardRow({ tour, showProgress }: { tour: TourCard; showProgress?: boolean }) {
    const isIncident = tour.incidentCount > 0;

    return (
        <a href={`/dashboard/operator/tours/${tour.id}/live`}
            className={`block p-3 rounded-lg border transition hover:shadow-sm ${isIncident ? 'border-red-200 bg-red-50/50 hover:border-red-300' :
                    'border-gray-200 hover:border-indigo-200'
                }`}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm text-gray-900 truncate">{tour.title}</h4>
                        {isIncident && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${tour.hasHighSeverity ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                ⚠️ {tour.incidentCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        {tour.guide && <span>👤 {tour.guide.name}</span>}
                        <span>⏰ {formatTime(tour.startDate)}</span>
                        {tour.currentSegment && <span>📍 {tour.currentSegment}</span>}
                        <HealthBadge health={tour.tourHealth} color={tour.healthColor} />
                    </div>
                    {showProgress && tour.segmentCount > 0 && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[120px]">
                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(tour.completedSegments / tour.segmentCount) * 100}%` }} />
                            </div>
                            <span>{tour.completedSegments}/{tour.segmentCount}</span>
                        </div>
                    )}
                </div>
                {tour.lastEventTime && (
                    <span className="text-[10px] text-gray-400 whitespace-nowrap font-mono">
                        {formatTime(tour.lastEventTime)}
                    </span>
                )}
            </div>
        </a>
    );
}

const HEALTH_LABELS: Record<string, string> = {
    HEALTHY: 'Healthy', AT_RISK: 'At Risk', DELAYED: 'Delayed', INCIDENT: 'Incident', SOS_ACTIVE: 'SOS Active',
};

function HealthBadge({ health, color }: { health: string; color: string }) {
    return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase" style={{ background: `${color}20`, color }}>
            {HEALTH_LABELS[health] || health}
        </span>
    );
}

function Section({ title, icon, count, children, emptyText, color }: {
    title: string; icon: string; count: number; children: React.ReactNode; emptyText: string; color: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className={`px-4 py-3 border-b border-gray-100 flex items-center justify-between ${color}`}>
                <div className="flex items-center gap-2">
                    <span>{icon}</span>
                    <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
                </div>
                <span className="text-xs bg-white/80 text-gray-700 px-2 py-0.5 rounded-full font-medium">{count}</span>
            </div>
            <div className="p-3 space-y-2">
                {count === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-3">{emptyText}</p>
                ) : children}
            </div>
        </div>
    );
}

export function OperatorLiveMonitor() {
    const [data, setData] = useState<CommandData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/operator/command-center');
            const json = await res.json();
            if (json.success) {
                setData(json.data);
                setLastRefresh(new Date());
            }
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // 10s auto-refresh
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading || !data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                        <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
                        <div className="space-y-2">
                            <div className="h-12 bg-gray-100 rounded" />
                            <div className="h-12 bg-gray-100 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Live — auto-refreshes every 10s · {data.totalToday || 0} tours today
                </div>
                <span className="text-xs text-gray-400">
                    Last: {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
            </div>

            {/* Health Summary Bar */}
            <div className="grid grid-cols-5 gap-2 mb-4">
                {(['HEALTHY', 'AT_RISK', 'DELAYED', 'INCIDENT', 'SOS_ACTIVE'] as const).map(h => {
                    const colors: Record<string, string> = { HEALTHY: '#22c55e', AT_RISK: '#eab308', DELAYED: '#f97316', INCIDENT: '#ef4444', SOS_ACTIVE: '#a855f7' };
                    return (
                        <div key={h} className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                            <div className="text-xl font-bold" style={{ color: colors[h] }}>{data.healthCounts?.[h] || 0}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-medium mt-0.5">{HEALTH_LABELS[h]}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Section title="Pickup Phase" icon="🚗" count={data.pickupPhase.length} emptyText="No tours in pickup" color="bg-blue-50/50">
                    {data.pickupPhase.map(t => <TourCardRow key={t.id} tour={t} />)}
                </Section>

                <Section title="In Progress" icon="▶️" count={data.inProgress.length} emptyText="No tours in progress" color="bg-green-50/50">
                    {data.inProgress.map(t => <TourCardRow key={t.id} tour={t} showProgress />)}
                </Section>

                <Section title="Completed Today" icon="✅" count={data.completedToday.length} emptyText="No completed tours today" color="bg-gray-50">
                    {data.completedToday.map(t => <TourCardRow key={t.id} tour={t} />)}
                </Section>

                <Section title="Incidents" icon="⚠️" count={data.incidents.length} emptyText="No active incidents" color="bg-red-50/50">
                    {data.incidents.map(t => <TourCardRow key={t.id} tour={t} />)}
                </Section>
            </div>
        </div>
    );
}
