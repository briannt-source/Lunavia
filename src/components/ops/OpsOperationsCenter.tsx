'use client';

import { useEffect, useState, useCallback } from 'react';

// ── OPS Operations Center ──────────────────────────────────────────────
// All-platform tour monitoring for operations staff

interface ActiveTour {
    id: string;
    title: string;
    status: string;
    startTime: string;
    operator: string;
    guide: string;
    incidentCount: number;
    hasHighSeverity: boolean;
    isDelayed: boolean;
}

interface OpsIncident {
    id: string;
    description: string;
    severity: string;
    createdAt: string;
    reporter: string;
    tourId: string;
    tourTitle: string;
}

interface DelayedTour {
    id: string;
    title: string;
    startTime: string;
    delayMinutes: number;
    operator: string;
    guide: string;
}

interface OpsData {
    activeTours: ActiveTour[];
    openIncidents: OpsIncident[];
    delayedTours: DelayedTour[];
    stats: { activeCount: number; incidentCount: number; delayedCount: number };
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const SEVERITY_COLORS: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    LOW: 'bg-gray-100 text-gray-600',
};

export function OpsOperationsCenter() {
    const [data, setData] = useState<OpsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'tours' | 'incidents' | 'delayed'>('tours');

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/ops/dashboard');
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading || !data) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
                </div>
                <div className="h-64 bg-gray-100 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setTab('tours')}
                    className={`p-4 rounded-xl border text-left transition ${tab === 'tours' ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200' : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}>
                    <div className="text-2xl font-bold text-gray-900">{data.stats.activeCount}</div>
                    <div className="text-xs text-gray-500 mt-1">Active Tours</div>
                </button>
                <button onClick={() => setTab('incidents')}
                    className={`p-4 rounded-xl border text-left transition ${tab === 'incidents' ? 'border-red-300 bg-red-50 ring-2 ring-red-200' : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}>
                    <div className="text-2xl font-bold text-red-600">{data.stats.incidentCount}</div>
                    <div className="text-xs text-gray-500 mt-1">Open Incidents</div>
                </button>
                <button onClick={() => setTab('delayed')}
                    className={`p-4 rounded-xl border text-left transition ${tab === 'delayed' ? 'border-amber-300 bg-amber-50 ring-2 ring-amber-200' : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}>
                    <div className="text-2xl font-bold text-amber-600">{data.stats.delayedCount}</div>
                    <div className="text-xs text-gray-500 mt-1">Delayed Tours</div>
                </button>
            </div>

            {/* Tab content */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {tab === 'tours' && (
                    <>
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-semibold text-sm text-gray-900">Active Tours</h3>
                        </div>
                        {data.activeTours.length === 0 ? (
                            <p className="p-6 text-center text-gray-500 text-sm">No active tours</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50/50 text-xs text-gray-500 uppercase">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Tour</th>
                                            <th className="px-4 py-2 text-left">Operator</th>
                                            <th className="px-4 py-2 text-left">Guide</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Start</th>
                                            <th className="px-4 py-2 text-left">Flags</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.activeTours.map(t => (
                                            <tr key={t.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/dashboard/admin/tours/${t.id}`}>
                                                <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[200px]">{t.title}</td>
                                                <td className="px-4 py-3 text-gray-600">{t.operator}</td>
                                                <td className="px-4 py-3 text-gray-600">{t.guide}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${t.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>{t.status}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{formatTime(t.startTime)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        {t.isDelayed && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">DELAYED</span>}
                                                        {t.incidentCount > 0 && <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.hasHighSeverity ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>⚠️ {t.incidentCount}</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {tab === 'incidents' && (
                    <>
                        <div className="px-4 py-3 border-b border-gray-100 bg-red-50/50">
                            <h3 className="font-semibold text-sm text-gray-900">Open Incidents</h3>
                        </div>
                        {data.openIncidents.length === 0 ? (
                            <p className="p-6 text-center text-gray-500 text-sm">No open incidents</p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {data.openIncidents.map(inc => (
                                    <a key={inc.id} href={`/dashboard/admin/incidents/${inc.tourId}`}
                                        className="flex items-start justify-between p-4 hover:bg-gray-50 transition">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${SEVERITY_COLORS[inc.severity] || SEVERITY_COLORS.LOW}`}>
                                                    {inc.severity}
                                                </span>
                                                <span className="font-medium text-sm text-gray-900 truncate">{inc.tourTitle}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{inc.description}</p>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Reported by {inc.reporter} • {formatTime(inc.createdAt)}
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {tab === 'delayed' && (
                    <>
                        <div className="px-4 py-3 border-b border-gray-100 bg-amber-50/50">
                            <h3 className="font-semibold text-sm text-gray-900">Delayed Tours</h3>
                        </div>
                        {data.delayedTours.length === 0 ? (
                            <p className="p-6 text-center text-gray-500 text-sm">No delayed tours</p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {data.delayedTours.map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                                        <div>
                                            <h4 className="font-medium text-sm text-gray-900">{t.title}</h4>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {t.operator} → {t.guide}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded">
                                                +{t.delayMinutes}min late
                                            </span>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                Planned: {formatTime(t.startTime)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
