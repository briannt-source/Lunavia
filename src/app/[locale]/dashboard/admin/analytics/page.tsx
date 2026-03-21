"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MiniAreaChart, MiniBarChart, DonutChart, TrendBadge, HorizontalBarList } from '@/components/analytics/Charts';
import {
    TrendingUp,
    BarChart3,
    MapPin,
    DollarSign,
    Users,
    CheckCircle2,
    AlertTriangle,
    Star,
    Download,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function formatVND(n: number) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return String(n);
}

export default function AnalyticsDashboard() {
    const [months, setMonths] = useState(12);

    // Time-series data
    const { data: tsData, isLoading: tsLoading } = useSWR(
        `/api/analytics/time-series?scope=platform&months=${months}`,
        fetcher
    );

    // Legacy admin analytics
    const { data: adminData } = useSWR(`/api/admin/analytics?range=30d`, fetcher);

    if (tsLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Decision data for Go / No-Go</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-56 bg-gray-50 rounded-xl animate-pulse" />)}
                </div>
            </div>
        );
    }

    const summary = tsData?.summary || {};
    const trends = tsData?.trends || {};
    const timeline = tsData?.timeline || [];
    const marketBreakdown = tsData?.marketBreakdown || {};
    const topCities = tsData?.topCities || [];

    const monthLabels = timeline.map((t: any) => {
        const [, m] = t.month.split('-');
        return `T${m}`;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Decision data for Go / No-Go (Read-only)</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (!tsData) return;
                            const blob = new Blob([JSON.stringify(tsData, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `lunavia-analytics-${new Date().toISOString().split('T')[0]}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                        <Download className="w-3 h-3" />
                        Export
                    </button>
                    <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
                        {[{ label: '6M', value: 6 }, { label: '12M', value: 12 }, { label: '24M', value: 24 }].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setMonths(opt.value)}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                    months === opt.value
                                        ? 'bg-white text-lunavia-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KPI icon={<BarChart3 className="h-4 w-4" />} label="Total Tours" value={summary.totalTours || 0} trend={trends.tours} color="indigo" />
                <KPI icon={<CheckCircle2 className="h-4 w-4" />} label="Completion" value={`${summary.completionRate || 0}%`} color="emerald" />
                <KPI icon={<DollarSign className="h-4 w-4" />} label="Revenue" value={formatVND(summary.totalRevenue || 0)} trend={trends.revenue} color="amber" suffix="₫" />
                <KPI icon={<Users className="h-4 w-4" />} label="Applications" value={summary.totalApplications || 0} trend={trends.applications} color="blue" />
            </div>

            {/* Adoption from legacy data */}
            {adminData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <KPI icon={<Users className="h-4 w-4" />} label="Operators" value={adminData.adoption?.totalOperators || 0} color="indigo" />
                    <KPI icon={<Users className="h-4 w-4" />} label="Active Ops" value={adminData.adoption?.activeOperators || 0} color="emerald" />
                    <KPI icon={<Users className="h-4 w-4" />} label="Guides" value={adminData.guides?.totalGuides || 0} color="violet" />
                    <KPI icon={<Star className="h-4 w-4" />} label="Avg Rating" value={adminData.feedback?.averageRating || '—'} color="amber" />
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Tours over time */}
                <Card className="card-elevated border-0">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-lunavia-primary" />
                            Tour Volume
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MiniAreaChart
                            data={timeline.map((t: any) => t.tours)}
                            labels={monthLabels}
                            height={140}
                            color="#4f46e5"
                            showLabels
                            showValues
                        />
                    </CardContent>
                </Card>

                {/* Revenue over time */}
                <Card className="card-elevated border-0">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            Revenue Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MiniAreaChart
                            data={timeline.map((t: any) => t.revenue)}
                            labels={monthLabels}
                            height={140}
                            color="#10b981"
                            showLabels
                            formatValue={formatVND}
                        />
                    </CardContent>
                </Card>

                {/* Completion Donut */}
                <Card className="card-elevated border-0">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Service Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center py-4">
                        <DonutChart
                            segments={[
                                { label: 'Completed', value: summary.completedTours || 0, color: '#10b981' },
                                { label: 'Cancelled', value: summary.cancelledTours || 0, color: '#ef4444' },
                                { label: 'Other', value: Math.max((summary.totalTours || 0) - (summary.completedTours || 0) - (summary.cancelledTours || 0), 0), color: '#e5e7eb' },
                            ]}
                            size={110}
                            thickness={14}
                            centerValue={`${summary.completionRate || 0}%`}
                            centerLabel="completed"
                        />
                    </CardContent>
                </Card>

                {/* Market Breakdown */}
                <Card className="card-elevated border-0">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-lunavia-accent" />
                            Market Split
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center py-4">
                        {Object.keys(marketBreakdown).length > 0 ? (
                            <DonutChart
                                segments={Object.entries(marketBreakdown).map(([key, val]: [string, any]) => ({
                                    label: key === 'INBOUND' ? 'Inbound' : 'Outbound',
                                    value: val,
                                    color: key === 'INBOUND' ? '#6366f1' : '#8b5cf6',
                                }))}
                                size={90}
                                thickness={12}
                                centerValue={summary.totalTours || 0}
                                centerLabel="tours"
                            />
                        ) : (
                            <p className="text-sm text-gray-400">No market data yet</p>
                        )}
                    </CardContent>
                </Card>

                {/* Top Cities — full width */}
                <Card className="card-elevated border-0 lg:col-span-2">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-rose-500" />
                            Top Destinations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topCities.length > 0 ? (
                            <HorizontalBarList
                                items={topCities.map((c: any) => ({ label: c.city, value: c.count }))}
                                color="#6366f1"
                                maxItems={10}
                            />
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-4">No data</p>
                        )}
                    </CardContent>
                </Card>

                {/* Incidents (from legacy) */}
                {adminData?.incidents && (
                    <Card className="card-elevated border-0">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                Incidents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center py-4">
                            <DonutChart
                                segments={[
                                    { label: 'Open', value: adminData.incidents.open, color: '#ef4444' },
                                    { label: 'Resolved', value: adminData.incidents.resolved, color: '#10b981' },
                                ]}
                                size={90}
                                thickness={12}
                                centerValue={adminData.incidents.open + adminData.incidents.resolved}
                                centerLabel="total"
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Monetization (from legacy) */}
                {adminData?.monetization && (
                    <Card className="card-elevated border-0">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                Monetization
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2.5 py-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Paid Plans</span>
                                <span className="text-sm font-bold text-gray-900">{adminData.monetization.activePaidUsers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Upgrade Requests</span>
                                <span className="text-sm font-bold text-gray-900">{adminData.monetization.approvedRequests}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <span className="text-xs font-medium text-gray-700">Revenue Est.</span>
                                <span className="text-sm font-bold text-green-600">
                                    {formatVND(adminData.monetization.totalRevenue)}₫
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="text-center text-[10px] text-gray-300 pt-4">
                Last updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
}

function KPI({ icon, label, value, trend, color, suffix }: {
    icon: React.ReactNode; label: string; value: string | number;
    trend?: number; color: string; suffix?: string;
}) {
    const c: Record<string, string> = {
        indigo: 'text-lunavia-primary', emerald: 'text-green-600', amber: 'text-amber-600',
        blue: 'text-lunavia-primary', violet: 'text-lunavia-accent',
    };
    return (
        <div className="p-3.5 rounded-xl bg-white border border-gray-100" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`${c[color]} opacity-60`}>{icon}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
                {trend !== undefined && <TrendBadge value={trend} />}
            </div>
            <p className={`text-lg font-bold ${c[color]}`}>{value}{suffix}</p>
        </div>
    );
}
