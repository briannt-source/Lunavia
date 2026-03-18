'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface GodModeData {
    live: {
        activeTours: number;
        inProgressTours: { id: string; title: string; province: string; startTime: string }[];
        todayTours: number;
    };
    safety: { openIncidents: number; openSOS: number; disputedTours: number };
    atRiskUsers: { id: string; name: string; email: string; role: string; trustScore: number; reliabilityScore: number }[];
    recentEvents: { id: string; type: string; tourId: string; tourTitle: string; createdAt: string }[];
    financial: { totalWallets: number; totalEscrowHeld: number; pendingWithdrawals: number; pendingTopups: number };
    platform: { totalOperators: number; totalGuides: number; totalTours: number; completedTours: number; completionRate: number };
}

const EVENT_ICONS: Record<string, string> = {
    TOUR_CLOSED: '✅', TOUR_REOPENED: '🔄', GUIDE_NO_SHOW: '❌', PAYMENT_DISPUTED: '⚖️',
    INCIDENT_REPORTED: '🚨', SYSTEM_ALERT: '⚠️', TOUR_STARTED: '▶️', TOUR_COMPLETED: '🏁',
    CHECK_IN_SUCCESS: '📍', CHECK_IN_FAILED: '📍❌', SOS_BROADCAST: '🆘',
};

const EVENT_SEVERITY: Record<string, string> = {
    INCIDENT_REPORTED: 'bg-red-100 text-red-800 border-red-200',
    GUIDE_NO_SHOW: 'bg-red-100 text-red-800 border-red-200',
    SYSTEM_ALERT: 'bg-amber-100 text-amber-800 border-amber-200',
    PAYMENT_DISPUTED: 'bg-amber-100 text-amber-800 border-amber-200',
    TOUR_REOPENED: 'bg-amber-100 text-amber-800 border-amber-200',
    SOS_BROADCAST: 'bg-red-100 text-red-800 border-red-200',
};

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

export default function GodModeConsolePage() {
    const [data, setData] = useState<GodModeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/god-mode');
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
        const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleForceAction = async (tourId: string, action: 'COMPLETE' | 'CANCEL') => {
        if (!confirm(`Force ${action} this tour? This is irreversible.`)) return;
        try {
            const res = await fetch(`/api/admin/disputes/${tourId}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, justification: `God Mode force ${action.toLowerCase()} by admin` }),
            });
            if (res.ok) {
                toast.success(`Tour force ${action.toLowerCase()}d`);
                fetchData();
            } else toast.error('Failed to execute action');
        } catch { toast.error('Network error'); }
    };

    if (loading) return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
                <div className="h-10 bg-gray-100 rounded-lg w-64" />
                <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}</div>
                <div className="h-64 bg-gray-100 rounded-xl" />
            </div>
        </div>
    );

    if (!data) return <div className="p-8 text-center text-red-600">Failed to load God Mode data</div>;

    const { live, safety, atRiskUsers, recentEvents, financial, platform } = data;
    const hasCritical = safety.openIncidents > 0 || safety.openSOS > 0;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-gray-900">⚡ God Mode</h1>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm">
                            Live
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Full platform visibility — real-time operations control</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400">Last refresh: {lastRefresh.toLocaleTimeString()}</span>
                    <button onClick={fetchData} className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition">
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* ── CRITICAL ALERTS ── */}
            {hasCritical && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🚨</span>
                        <div>
                            <p className="font-bold text-red-900">Critical Actions Required</p>
                            <p className="text-sm text-red-700">
                                {safety.openIncidents > 0 && `${safety.openIncidents} open incident${safety.openIncidents > 1 ? 's' : ''}`}
                                {safety.openIncidents > 0 && safety.openSOS > 0 && ' · '}
                                {safety.openSOS > 0 && `${safety.openSOS} SOS request${safety.openSOS > 1 ? 's' : ''}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/dashboard/admin/incidents" className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                            View Incidents
                        </Link>
                        <Link href="/dashboard/admin/disputes" className="px-4 py-2 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
                            Disputes
                        </Link>
                    </div>
                </div>
            )}

            {/* ── STAT ROW ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <GodStatCard label="Active Tours" value={live.activeTours} icon="🗺️" color="blue" pulse={live.activeTours > 0} />
                <GodStatCard label="In Progress" value={live.inProgressTours.length} icon="▶️" color="emerald" pulse={live.inProgressTours.length > 0} />
                <GodStatCard label="Today's Tours" value={live.todayTours} icon="📅" color="indigo" />
                <GodStatCard label="Open Incidents" value={safety.openIncidents} icon="🚨" color={safety.openIncidents > 0 ? 'red' : 'gray'} />
                <GodStatCard label="SOS Open" value={safety.openSOS} icon="🆘" color={safety.openSOS > 0 ? 'red' : 'gray'} />
                <GodStatCard label="Disputed" value={safety.disputedTours} icon="⚖️" color={safety.disputedTours > 0 ? 'amber' : 'gray'} />
            </div>

            {/* ── MAIN GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: In-Progress Tours + Force Actions */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Live Tours */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Live Tours ({live.inProgressTours.length})
                            </h3>
                            <Link href="/dashboard/admin/tours" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View All →</Link>
                        </div>
                        {live.inProgressTours.length === 0 ? (
                            <div className="p-8 text-center">
                                <span className="text-3xl">🌙</span>
                                <p className="text-sm text-gray-400 mt-2">No tours in progress right now</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {live.inProgressTours.map(tour => (
                                    <div key={tour.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                                        <div className="min-w-0 flex-1">
                                            <Link href={`/dashboard/admin/tours/${tour.id}`} className="text-sm font-semibold text-gray-900 hover:text-indigo-600 truncate block">
                                                {tour.title}
                                            </Link>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                📍 {tour.province || 'Unknown'} · Started {new Date(tour.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-3">
                                            <button onClick={() => handleForceAction(tour.id, 'COMPLETE')}
                                                className="px-2.5 py-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition uppercase tracking-wider"
                                            >Force ✓</button>
                                            <button onClick={() => handleForceAction(tour.id, 'CANCEL')}
                                                className="px-2.5 py-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition uppercase tracking-wider"
                                            >Force ✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Event Feed */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">📡 Event Feed (24h)</h3>
                            <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full tracking-wider">Real-time</span>
                        </div>
                        {recentEvents.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-400">No events in the last 24 hours</div>
                        ) : (
                            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                                {recentEvents.map(ev => (
                                    <div key={ev.id} className={`flex items-start gap-3 px-5 py-3 ${EVENT_SEVERITY[ev.type] ? 'border-l-4 ' + EVENT_SEVERITY[ev.type] : ''}`}>
                                        <span className="text-base mt-0.5 shrink-0">{EVENT_ICONS[ev.type] || '📋'}</span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold text-gray-900">{ev.type.replace(/_/g, ' ')}</p>
                                            {ev.tourTitle && (
                                                <Link href={`/dashboard/admin/tours/${ev.tourId}`} className="text-xs text-indigo-600 hover:underline truncate block">
                                                    {ev.tourTitle}
                                                </Link>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-400 shrink-0">
                                            {new Date(ev.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="space-y-6">
                    {/* At-Risk Users */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">🛡️ At-Risk Users</h3>
                            <p className="text-[10px] text-gray-400 mt-0.5">Trust &lt; 40 or reliability &lt; 60%</p>
                        </div>
                        {atRiskUsers.length === 0 ? (
                            <div className="p-6 text-center">
                                <span className="text-2xl">✅</span>
                                <p className="text-sm text-gray-400 mt-1">All users in good standing</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {atRiskUsers.map(u => (
                                    <Link key={u.id} href={`/dashboard/admin/users/${u.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-red-50/50 transition">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                                            <p className="text-[10px] text-gray-400">{u.role === 'TOUR_OPERATOR' ? '🏢 Operator' : '🎯 Guide'}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className={`text-xs font-black ${(u.trustScore || 0) < 30 ? 'text-red-600' : 'text-amber-600'}`}>{u.trustScore}</span>
                                            <p className="text-[10px] text-gray-400">R: {u.reliabilityScore ?? '—'}%</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Financial Snapshot */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">💰 Financial Snapshot</h3>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Wallets</span>
                                <span className="font-semibold text-gray-900">{financial.totalWallets}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Escrow Held</span>
                                <span className="font-bold text-amber-600">₫{fmt(financial.totalEscrowHeld)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Pending Withdrawals</span>
                                <span className={`font-semibold ${financial.pendingWithdrawals > 0 ? 'text-orange-600' : 'text-gray-400'}`}>{financial.pendingWithdrawals}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Pending Top-ups</span>
                                <span className={`font-semibold ${financial.pendingTopups > 0 ? 'text-blue-600' : 'text-gray-400'}`}>{financial.pendingTopups}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-100 flex gap-2">
                                <Link href="/dashboard/admin/finance/escrow/withdrawals" className="flex-1 text-center px-2 py-1.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition">
                                    Withdrawals
                                </Link>
                                <Link href="/dashboard/admin/finance/escrow/topups" className="flex-1 text-center px-2 py-1.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
                                    Top-ups
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Platform Overview */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">📊 Platform Overview</h3>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Active Operators</span>
                                <span className="font-semibold text-indigo-600">{platform.totalOperators}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Active Guides</span>
                                <span className="font-semibold text-emerald-600">{platform.totalGuides}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Tours</span>
                                <span className="font-semibold text-gray-900">{platform.totalTours}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Completed</span>
                                <span className="font-semibold text-green-600">{platform.completedTours}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Completion Rate</span>
                                <span className="font-black text-gray-900">{platform.completionRate}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 gap-2">
                        <Link href="/dashboard/admin/users" className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                            👥 Users
                        </Link>
                        <Link href="/dashboard/admin/disputes" className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                            ⚖️ Disputes
                        </Link>
                        <Link href="/dashboard/admin/incidents" className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                            🚨 Incidents
                        </Link>
                        <Link href="/dashboard/admin/risk" className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                            🛡️ Risk
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GodStatCard({ label, value, icon, color, pulse }: {
    label: string; value: number; icon: string; color: string; pulse?: boolean;
}) {
    const colors: Record<string, string> = {
        blue: 'bg-blue-50 border-blue-200 text-blue-900',
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
        red: 'bg-red-50 border-red-200 text-red-900',
        amber: 'bg-amber-50 border-amber-200 text-amber-900',
        gray: 'bg-gray-50 border-gray-200 text-gray-500',
    };
    return (
        <div className={`rounded-xl border p-4 ${colors[color] || colors.gray} ${pulse ? 'ring-2 ring-offset-1 ring-' + color + '-300' : ''}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{icon}</span>
                {pulse && value > 0 && <span className="h-2 w-2 rounded-full bg-current animate-pulse" />}
            </div>
            <p className="text-2xl font-black">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-70">{label}</p>
        </div>
    );
}
