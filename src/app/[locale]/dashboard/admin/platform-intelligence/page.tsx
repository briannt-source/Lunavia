"use client";

import { useState, useEffect, useCallback } from "react";
import { BaseDashboardLayout } from "@/components/layout/BaseDashboardLayout";
import toast from 'react-hot-toast';

const fmtVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

interface IntelligenceData {
    regionalDemand: { location: string; tourCount: number; totalRevenue: number }[];
    supplyDemand: {
        totalGuides: number; availableGuides: number; busyGuides: number; unavailableGuides: number;
        activeTours: number; upcomingTours: number; supplyRatio: number | null; alert: string;
    };
    collaborationGraph: { operator: string; guide: string; completedTours: number }[];
    growthTimeline: { month: string; operators: number; tours: number }[];
    priceBenchmarks: { category: string; avgPrice: number; minPrice: number; maxPrice: number; tourCount: number }[];
    demandForecast: { next7Days: number; next14Days: number; next30Days: number; avgDaily7d: number; avgDaily30d: number };
    platformHealth: {
        totalOperators: number; totalGuides: number; totalTours: number;
        completedTours: number; cancelledTours: number;
        completionRate: number; cancellationRate: number; activeDisputes: number;
    };
}

export default function PlatformIntelligencePage() {
    const [data, setData] = useState<IntelligenceData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/platform-intelligence');
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            setData(json.data);
        } catch (err: any) { toast.error(err.message); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return (
        <BaseDashboardLayout header={<h1 className="text-2xl font-bold text-gray-900">Platform Intelligence</h1>}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
        </BaseDashboardLayout>
    );

    if (!data) return (
        <BaseDashboardLayout header={<h1 className="text-2xl font-bold text-gray-900">Platform Intelligence</h1>}>
            <div className="p-12 text-center text-gray-500">Failed to load intelligence data.</div>
        </BaseDashboardLayout>
    );

    const alertColors: Record<string, string> = {
        UNDERSUPPLY: 'bg-red-50 text-red-700 border-red-200',
        OVERSUPPLY: 'bg-amber-50 text-amber-700 border-amber-200',
        BALANCED: 'bg-green-50 text-green-700 border-green-200',
    };

    return (
        <BaseDashboardLayout header={
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">🧠 Platform Intelligence</h1>
                    <p className="mt-1 text-sm text-gray-500">Network analysis, demand patterns, and marketplace optimization insights</p>
                </div>
                <button onClick={fetchData} className="px-4 py-2 bg-lunavia-primary text-white text-sm font-medium rounded-lg hover:bg-lunavia-primary/90 transition">
                    ↻ Refresh
                </button>
            </div>
        }>
            <div className="space-y-6">

                {/* ── Platform Health Overview ──────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    {[
                        { label: 'Operators', value: data.platformHealth.totalOperators, icon: '🏢' },
                        { label: 'Guides', value: data.platformHealth.totalGuides, icon: '🎯' },
                        { label: 'Total Tours', value: data.platformHealth.totalTours, icon: '🗺️' },
                        { label: 'Completed', value: data.platformHealth.completedTours, icon: '✅' },
                        { label: 'Cancelled', value: data.platformHealth.cancelledTours, icon: '❌' },
                        { label: 'Completion %', value: `${data.platformHealth.completionRate}%`, icon: '📊' },
                        { label: 'Cancel %', value: `${data.platformHealth.cancellationRate}%`, icon: '⚠️' },
                        { label: 'Open Disputes', value: data.platformHealth.activeDisputes, icon: '🚨' },
                    ].map((m, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm">
                            <div className="text-lg">{m.icon}</div>
                            <div className="text-lg font-bold text-gray-900 mt-1">{m.value}</div>
                            <div className="text-[10px] text-gray-500 font-medium uppercase mt-0.5">{m.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ── Supply / Demand Balance ──────────────────── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-4">⚖️ Supply / Demand Balance</h2>
                        <div className={`rounded-lg border px-4 py-3 mb-4 text-sm font-semibold ${alertColors[data.supplyDemand.alert] || alertColors.BALANCED}`}>
                            {data.supplyDemand.alert === 'UNDERSUPPLY' ? '⚠️ Undersupply — More tours than available guides' :
                             data.supplyDemand.alert === 'OVERSUPPLY' ? '💤 Oversupply — Many idle guides' :
                             '✅ Balanced — Healthy guide-to-tour ratio'}
                            {data.supplyDemand.supplyRatio !== null && (
                                <span className="ml-2 text-xs font-normal opacity-75">({data.supplyDemand.supplyRatio} guides per tour)</span>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-xl font-bold text-green-700">{data.supplyDemand.availableGuides}</div>
                                <div className="text-[10px] text-green-600 font-medium mt-1">Available</div>
                            </div>
                            <div className="text-center p-3 bg-amber-50 rounded-lg">
                                <div className="text-xl font-bold text-amber-700">{data.supplyDemand.busyGuides}</div>
                                <div className="text-[10px] text-amber-600 font-medium mt-1">Busy</div>
                            </div>
                            <div className="text-center p-3 bg-lunavia-light rounded-lg">
                                <div className="text-xl font-bold text-lunavia-primary-hover">{data.supplyDemand.upcomingTours}</div>
                                <div className="text-[10px] text-lunavia-primary font-medium mt-1">Upcoming Tours</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Demand Forecast ──────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-4">📈 Demand Forecast</h2>
                        <div className="space-y-3">
                            {[
                                { label: 'Next 7 Days', value: data.demandForecast.next7Days, avg: data.demandForecast.avgDaily7d, color: 'lunavia-primary' },
                                { label: 'Next 14 Days', value: data.demandForecast.next14Days, avg: null, color: 'lunavia-accent' },
                                { label: 'Next 30 Days', value: data.demandForecast.next30Days, avg: data.demandForecast.avgDaily30d, color: 'lunavia-primary' },
                            ].map(f => (
                                <div key={f.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <span className="text-sm font-medium text-gray-900">{f.label}</span>
                                        {f.avg !== null && <span className="text-xs text-gray-500 ml-2">({f.avg}/day avg)</span>}
                                    </div>
                                    <span className={`text-lg font-bold text-${f.color}-700`}>{f.value} tours</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Regional Demand Heatmap ─────────────────── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-4">🌍 Regional Tour Demand</h2>
                        {data.regionalDemand.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-6">No regional data yet.</p>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {data.regionalDemand.map((r, i) => {
                                    const maxCount = data.regionalDemand[0]?.tourCount || 1;
                                    const pct = Math.round((r.tourCount / maxCount) * 100);
                                    return (
                                        <div key={i} className="relative">
                                            <div className="flex items-center justify-between relative z-10 px-3 py-2">
                                                <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{r.location}</span>
                                                <div className="flex items-center gap-3 text-xs">
                                                    <span className="font-semibold text-gray-700">{r.tourCount} tours</span>
                                                    <span className="text-gray-500">{fmtVND(r.totalRevenue)}</span>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 bg-lunavia-primary-light rounded-lg" style={{ width: `${pct}%` }} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ── Price Benchmarks ─────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-4">💰 Tour Price Benchmarking</h2>
                        {data.priceBenchmarks.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-6">No pricing data yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                                            <th className="py-2 pr-4 text-xs font-semibold text-gray-500 uppercase text-right">Avg</th>
                                            <th className="py-2 pr-4 text-xs font-semibold text-gray-500 uppercase text-right">Min</th>
                                            <th className="py-2 pr-4 text-xs font-semibold text-gray-500 uppercase text-right">Max</th>
                                            <th className="py-2 text-xs font-semibold text-gray-500 uppercase text-right">Tours</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {data.priceBenchmarks.map(p => (
                                            <tr key={p.category}>
                                                <td className="py-2 pr-4 font-medium text-gray-900">{p.category}</td>
                                                <td className="py-2 pr-4 text-right text-lunavia-primary font-semibold">{fmtVND(p.avgPrice)}</td>
                                                <td className="py-2 pr-4 text-right text-gray-500">{fmtVND(p.minPrice)}</td>
                                                <td className="py-2 pr-4 text-right text-gray-500">{fmtVND(p.maxPrice)}</td>
                                                <td className="py-2 text-right text-gray-400">{p.tourCount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* ── Collaboration Graph ─────────────────────── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-4">🤝 Top Guide ↔ Operator Collaborations</h2>
                        {data.collaborationGraph.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-6">No collaboration data yet.</p>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {data.collaborationGraph.map((c, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">{c.operator}</div>
                                            <div className="text-xs text-gray-500">Operator</div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <span>↔</span>
                                        </div>
                                        <div className="flex-1 min-w-0 text-right">
                                            <div className="text-sm font-medium text-gray-900 truncate">{c.guide}</div>
                                            <div className="text-xs text-gray-500">Guide</div>
                                        </div>
                                        <div className="shrink-0 px-2 py-1 bg-lunavia-primary-light text-lunavia-primary rounded-md text-xs font-bold">
                                            {c.completedTours} tours
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Operator Growth Timeline ────────────────── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-4">📊 Operator Growth (6 Months)</h2>
                        <div className="space-y-2">
                            {data.growthTimeline.map(g => {
                                const maxTours = Math.max(...data.growthTimeline.map(t => t.tours), 1);
                                const pct = Math.round((g.tours / maxTours) * 100);
                                return (
                                    <div key={g.month} className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 w-16 shrink-0 font-mono">{g.month}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                                            <div className="bg-gradient-to-r from-lunavia-primary/60 to-lunavia-primary h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                                                {g.tours} tours
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500 w-16 shrink-0 text-right">+{g.operators} ops</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </BaseDashboardLayout>
    );
}
