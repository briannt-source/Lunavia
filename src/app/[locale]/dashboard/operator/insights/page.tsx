'use client';

import React from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MiniAreaChart, MiniBarChart, DonutChart, TrendBadge, HorizontalBarList } from '@/components/analytics/Charts';
import {
    TrendingUp,
    BarChart3,
    MapPin,
    DollarSign,
    Calendar,
    CheckCircle2,
    XCircle,
    Users,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function formatVND(n: number) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return String(n);
}

export default function OperatorInsightsPage() {
    const t = useTranslations('Operator.Insights');
    const { data, isLoading, error } = useSWR('/api/analytics/time-series?scope=operator', fetcher);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-56 bg-gray-50 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !data || data.error) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <div className="text-center py-12 text-gray-500">
                    {data?.error || t('loadError')}
                </div>
            </div>
        );
    }

    const { summary, trends, timeline, marketBreakdown, topCities } = data;

    const monthLabels = timeline.map((t: any) => {
        const [, m] = t.month.split('-');
        return `T${m}`;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('subtitlePeriod', { months: data.period.months })}</p>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KPICard
                    icon={<Calendar className="h-4 w-4" />}
                    label={t('kpi.totalTours')}
                    value={summary.totalTours}
                    trend={trends.tours}
                    color="indigo"
                />
                <KPICard
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label={t('kpi.completed')}
                    value={`${summary.completionRate}%`}
                    color="emerald"
                />
                <KPICard
                    icon={<DollarSign className="h-4 w-4" />}
                    label={t('kpi.totalSpent')}
                    value={formatVND(summary.totalRevenue)}
                    trend={trends.revenue}
                    color="amber"
                    suffix="₫"
                />
                <KPICard
                    icon={<Users className="h-4 w-4" />}
                    label={t('kpi.applications')}
                    value={summary.totalApplications}
                    trend={trends.applications}
                    color="blue"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Tours Over Time */}
                <Card className="card-elevated border-0">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-[#5BA4CF]" />
                            {t('charts.toursMonthly')}
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

                {/* Revenue Over Time */}
                <Card className="card-elevated border-0">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-amber-500" />
                            {t('charts.revenueMonthly')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MiniAreaChart
                            data={timeline.map((t: any) => t.revenue)}
                            labels={monthLabels}
                            height={140}
                            color="#f59e0b"
                            showLabels
                            formatValue={formatVND}
                        />
                    </CardContent>
                </Card>

                {/* Completion Breakdown */}
                <Card className="card-elevated border-0">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-emerald-500" />
                            {t('charts.completionRate')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center py-4">
                        <DonutChart
                            segments={[
                                { label: t('donut.completed'), value: summary.completedTours, color: '#10b981' },
                                { label: t('donut.cancelled'), value: summary.cancelledTours, color: '#ef4444' },
                                { label: t('donut.other'), value: summary.totalTours - summary.completedTours - summary.cancelledTours, color: '#e5e7eb' },
                            ]}
                            size={110}
                            thickness={14}
                            centerValue={`${summary.completionRate}%`}
                            centerLabel={t('kpi.completed')}
                        />
                    </CardContent>
                </Card>

                {/* Market Breakdown */}
                <Card className="card-elevated border-0">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-violet-500" />
                            {t('charts.marketBreakdown')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-4">
                        {Object.keys(marketBreakdown).length > 0 ? (
                            <div className="space-y-4">
                                <DonutChart
                                    segments={Object.entries(marketBreakdown).map(([key, val]: [string, any]) => ({
                                        label: key === 'INBOUND' ? 'Inbound' : 'Outbound',
                                        value: val,
                                        color: key === 'INBOUND' ? '#6366f1' : '#8b5cf6',
                                    }))}
                                    size={90}
                                    thickness={12}
                                    centerValue={summary.totalTours}
                                    centerLabel="tours"
                                />
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-4">{t('charts.noMarketData')}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Top Cities */}
                <Card className="card-elevated border-0 lg:col-span-2">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-rose-500" />
                            {t('charts.topCities')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topCities.length > 0 ? (
                            <HorizontalBarList
                                items={topCities.map((c: any) => ({ label: c.city, value: c.count }))}
                                color="#6366f1"
                                maxItems={8}
                            />
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-4">{t('charts.noData')}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Monthly Detail Table */}
                <Card className="card-elevated border-0 lg:col-span-2">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-gray-500" />
                            {t('charts.monthlyDetail')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-gray-400 border-b border-gray-100">
                                        <th className="text-left py-2 font-medium">{t('table.month')}</th>
                                        <th className="text-right py-2 font-medium">{t('table.tours')}</th>
                                        <th className="text-right py-2 font-medium">{t('table.completed')}</th>
                                        <th className="text-right py-2 font-medium">{t('table.cancelled')}</th>
                                        <th className="text-right py-2 font-medium">{t('table.applications')}</th>
                                        <th className="text-right py-2 font-medium">{t('table.cost')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeline.slice().reverse().map((t: any) => (
                                        <tr key={t.month} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="py-2 font-medium text-gray-700">{t.month}</td>
                                            <td className="text-right py-2 text-gray-600">{t.tours}</td>
                                            <td className="text-right py-2 text-emerald-600 font-medium">{t.completed}</td>
                                            <td className="text-right py-2 text-red-500">{t.cancelled}</td>
                                            <td className="text-right py-2 text-gray-600">{t.applications}</td>
                                            <td className="text-right py-2 text-gray-900 font-medium">{formatVND(t.revenue)}₫</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ── KPI Card ─────────────────────────────────────────────────

function KPICard({ icon, label, value, trend, color, suffix }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    trend?: number;
    color: string;
    suffix?: string;
}) {
    const colorMap: Record<string, string> = {
        indigo: 'text-[#5BA4CF]',
        emerald: 'text-emerald-600',
        amber: 'text-amber-600',
        blue: 'text-lunavia-primary',
    };

    return (
        <div className="p-4 rounded-xl bg-white border border-gray-100" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <div className="flex items-center gap-1.5 mb-2">
                <span className={`${colorMap[color]} opacity-60`}>{icon}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
                {trend !== undefined && <TrendBadge value={trend} />}
            </div>
            <p className={`text-xl font-bold ${colorMap[color]}`}>{value}{suffix}</p>
        </div>
    );
}
