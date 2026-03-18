'use client';

import { useEffect, useState, useCallback } from 'react';

// ── Operational Alerts Panel ──────────────────────────────────────────
// Shows active alerts for OPS and operators

interface Alert {
    id: string;
    tourId: string;
    alertType: string;
    severity: string;
    message: string;
    status: string;
    createdAt: string;
    resolvedAt: string | null;
    tour: { id: string; title: string };
}

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    MEDIUM: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    LOW: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
};

const ALERT_ICONS: Record<string, string> = {
    TOUR_DELAYED: '⏰',
    PICKUP_DELAY: '🚗',
    SEGMENT_DELAY: '📍',
    SEGMENT_SKIPPED: '⏭️',
    NO_CHECKIN: '❓',
    INCIDENT_REPORTED: '⚠️',
};

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.round(diff / 60000);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.round(min / 60);
    return `${hrs}h ago`;
}

export function OperationalAlertPanel({ showActions = true }: { showActions?: boolean }) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'OPEN' | 'ACKNOWLEDGED' | 'all'>('OPEN');

    const fetchAlerts = useCallback(async () => {
        try {
            const params = filter !== 'all' ? `?status=${filter}` : '';
            const res = await fetch(`/api/alerts${params}`);
            const json = await res.json();
            if (json.success) setAlerts(json.data.alerts);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [filter]);

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, [fetchAlerts]);

    const handleAction = async (id: string, action: 'acknowledge' | 'resolve') => {
        try {
            await fetch(`/api/alerts/${id}/${action}`, { method: 'PATCH' });
            fetchAlerts();
        } catch { /* silent */ }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Operational Alerts</h3>
                <div className="animate-pulse space-y-3">
                    <div className="h-16 bg-gray-100 rounded-lg" />
                    <div className="h-16 bg-gray-100 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                    <span>🔔</span>
                    <h3 className="font-semibold text-sm text-gray-900">Operational Alerts</h3>
                    {alerts.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {alerts.length}
                        </span>
                    )}
                </div>
                <div className="flex gap-1">
                    {(['OPEN', 'ACKNOWLEDGED', 'all'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-2 py-1 text-[10px] font-medium rounded transition ${filter === f ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
                                }`}>
                            {f === 'all' ? 'All' : f}
                        </button>
                    ))}
                </div>
            </div>

            {alerts.length === 0 ? (
                <p className="p-6 text-center text-gray-500 text-sm">No alerts</p>
            ) : (
                <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                    {alerts.map(alert => {
                        const colors = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.LOW;
                        return (
                            <div key={alert.id} className={`p-3 hover:bg-gray-50 transition ${alert.severity === 'CRITICAL' ? 'bg-red-50/30' : ''
                                }`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span>{ALERT_ICONS[alert.alertType] || '⚠️'}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}>
                                                {alert.severity}
                                            </span>
                                            <span className="font-medium text-sm text-gray-900 truncate">
                                                {alert.alertType.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{alert.message}</p>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                                            <span>{alert.tour.title}</span>
                                            <span>•</span>
                                            <span>{timeAgo(alert.createdAt)}</span>
                                        </div>
                                    </div>
                                    {showActions && alert.status === 'OPEN' && (
                                        <div className="flex gap-1 flex-shrink-0">
                                            <button onClick={() => handleAction(alert.id, 'acknowledge')}
                                                className="px-2 py-1 text-[10px] bg-amber-100 text-amber-700 rounded font-medium hover:bg-amber-200 transition">
                                                ACK
                                            </button>
                                            <button onClick={() => handleAction(alert.id, 'resolve')}
                                                className="px-2 py-1 text-[10px] bg-green-100 text-green-700 rounded font-medium hover:bg-green-200 transition">
                                                Resolve
                                            </button>
                                        </div>
                                    )}
                                    {alert.status === 'ACKNOWLEDGED' && showActions && (
                                        <button onClick={() => handleAction(alert.id, 'resolve')}
                                            className="px-2 py-1 text-[10px] bg-green-100 text-green-700 rounded font-medium hover:bg-green-200 transition flex-shrink-0">
                                            Resolve
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
