'use client';

import { useState, useEffect } from 'react';

interface InvestorData {
    userGrowth: {
        totalSignups: number;
        signupsThisMonth: number;
        verified: { operators: number; guides: number };
        firstTour: { operators: number; guides: number };
        active30d: { operators: number; guides: number };
    };
    tourVolume: {
        total: number; thisMonth: number; thisWeek: number;
        completed: number; cancelled: number;
        completionRate: number; toursPerDay: string;
    };
    revenue: {
        totalGMV: number; gmvThisMonth: number;
        subscriptionRevenue: number; subscriptionRevenueMonth: number;
        avgRevenuePerTour: number;
    };
    provinceCoverage: { province: string; count: number }[];
    retention: { totalActiveOperators: number; active90d: number; retentionRate90d: number };
}

const fmtCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(n);
const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

export default function InvestorDashboardPage() {
    const [data, setData] = useState<InvestorData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/observer/investor/metrics')
            .then(r => r.json())
            .then(json => { if (json.success) setData(json.data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
                <div className="h-10 bg-gray-100 rounded w-64" />
                <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}</div>
                <div className="grid grid-cols-2 gap-6"><div className="h-80 bg-gray-100 rounded-xl" /><div className="h-80 bg-gray-100 rounded-xl" /></div>
            </div>
        </div>
    );

    if (!data) return <div className="p-8 text-center text-red-500">Failed to load investor metrics</div>;

    const { userGrowth, tourVolume, revenue, provinceCoverage, retention } = data;

    // Calculate funnel conversion rates
    const verifiedRate = userGrowth.totalSignups > 0 ? Math.round(((userGrowth.verified.operators + userGrowth.verified.guides) / userGrowth.totalSignups) * 100) : 0;
    const activationRate = (userGrowth.verified.operators + userGrowth.verified.guides) > 0
        ? Math.round(((userGrowth.firstTour.operators + userGrowth.firstTour.guides) / (userGrowth.verified.operators + userGrowth.verified.guides)) * 100) : 0;

    const maxProvinceCount = Math.max(...provinceCoverage.map(p => p.count), 1);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-gray-900">📊 Investor Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Platform performance metrics, growth indicators, and market insights</p>
            </div>

            {/* ── HERO METRICS ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <HeroCard label="GMV Total" value={fmtCurrency(revenue.totalGMV)} icon="💰" color="emerald" />
                <HeroCard label="GMV This Month" value={fmtCurrency(revenue.gmvThisMonth)} icon="📈" color="green" />
                <HeroCard label="Tours / Day" value={tourVolume.toursPerDay} icon="📅" color="blue" />
                <HeroCard label="Completion Rate" value={`${tourVolume.completionRate}%`} icon="🎯" color="indigo" />
                <HeroCard label="Retention (90d)" value={`${retention.retentionRate90d}%`} icon="🔄" color="violet" />
            </div>

            {/* ── USER GROWTH FUNNEL ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-6">👥 User Growth Funnel</h2>
                <div className="grid grid-cols-5 gap-4">
                    <FunnelStep label="Signups" value={userGrowth.totalSignups} sub={`+${userGrowth.signupsThisMonth} this month`} width={100} color="gray" />
                    <FunnelStep label="Verified" value={userGrowth.verified.operators + userGrowth.verified.guides} sub={`${verifiedRate}% conversion`} width={Math.max(20, verifiedRate)} color="blue" />
                    <FunnelStep label="First Tour" value={userGrowth.firstTour.operators + userGrowth.firstTour.guides} sub={`${activationRate}% activation`} width={Math.max(15, activationRate)} color="indigo" />
                    <FunnelStep label="Active (30d)" value={userGrowth.active30d.operators + userGrowth.active30d.guides} sub="Operators + Guides" width={Math.max(10, Math.round(((userGrowth.active30d.operators + userGrowth.active30d.guides) / Math.max(userGrowth.totalSignups, 1)) * 100))} color="violet" />
                    <FunnelStep label="Retained (90d)" value={retention.active90d} sub={`${retention.retentionRate90d}% retention`} width={Math.max(8, retention.retentionRate90d)} color="purple" />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-lunavia-primary-light rounded-xl p-4">
                        <p className="text-xs font-bold text-lunavia-primary uppercase tracking-wider">Operators</p>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                            <div><p className="text-lg font-black text-gray-900">{userGrowth.verified.operators}</p><p className="text-[10px] text-lunavia-primary">Verified</p></div>
                            <div><p className="text-lg font-black text-gray-900">{userGrowth.firstTour.operators}</p><p className="text-[10px] text-lunavia-primary">1st Tour</p></div>
                            <div><p className="text-lg font-black text-gray-900">{userGrowth.active30d.operators}</p><p className="text-[10px] text-lunavia-primary">Active 30d</p></div>
                        </div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-xs font-bold text-green-500 uppercase tracking-wider">Guides</p>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                            <div><p className="text-lg font-black text-green-900">{userGrowth.verified.guides}</p><p className="text-[10px] text-green-600">Verified</p></div>
                            <div><p className="text-lg font-black text-green-900">{userGrowth.firstTour.guides}</p><p className="text-[10px] text-green-600">1st Tour</p></div>
                            <div><p className="text-lg font-black text-green-900">{userGrowth.active30d.guides}</p><p className="text-[10px] text-green-600">Active 30d</p></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── TOUR VOLUME + REVENUE ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tour Volume */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-base font-bold text-gray-900 mb-4">🗺️ Tour Volume</h2>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <MetricBox label="Total Tours" value={fmt(tourVolume.total)} />
                        <MetricBox label="This Month" value={fmt(tourVolume.thisMonth)} />
                        <MetricBox label="This Week" value={fmt(tourVolume.thisWeek)} />
                        <MetricBox label="Completion" value={`${tourVolume.completionRate}%`} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                            <p className="text-xl font-black text-green-700">{fmt(tourVolume.completed)}</p>
                            <p className="text-[10px] font-bold text-green-600 uppercase">Completed</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 text-center">
                            <p className="text-xl font-black text-red-700">{fmt(tourVolume.cancelled)}</p>
                            <p className="text-[10px] font-bold text-red-600 uppercase">Cancelled</p>
                        </div>
                    </div>
                </div>

                {/* Revenue */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-base font-bold text-gray-900 mb-4">💰 Revenue & GMV</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline border-b border-gray-100 pb-3">
                            <span className="text-sm text-gray-500">Gross Merchandise Value</span>
                            <span className="text-xl font-black text-green-700">{fmtCurrency(revenue.totalGMV)}</span>
                        </div>
                        <div className="flex justify-between items-baseline border-b border-gray-100 pb-3">
                            <span className="text-sm text-gray-500">GMV This Month</span>
                            <span className="text-lg font-bold text-green-600">{fmtCurrency(revenue.gmvThisMonth)}</span>
                        </div>
                        <div className="flex justify-between items-baseline border-b border-gray-100 pb-3">
                            <span className="text-sm text-gray-500">Subscription Revenue</span>
                            <span className="text-lg font-bold text-lunavia-accent">{fmtCurrency(revenue.subscriptionRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-baseline border-b border-gray-100 pb-3">
                            <span className="text-sm text-gray-500">Sub Revenue (Month)</span>
                            <span className="text-base font-bold text-lunavia-accent">{fmtCurrency(revenue.subscriptionRevenueMonth)}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-gray-500">Avg Revenue / Tour</span>
                            <span className="text-base font-bold text-gray-900">{fmtCurrency(revenue.avgRevenuePerTour)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── PROVINCE COVERAGE ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-4">📍 Province Coverage ({provinceCoverage.length} provinces)</h2>
                {provinceCoverage.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No provincial data available yet</p>
                ) : (
                    <div className="space-y-2">
                        {provinceCoverage.map(p => (
                            <div key={p.province} className="flex items-center gap-3">
                                <span className="text-xs font-medium text-gray-700 w-32 truncate shrink-0">{p.province}</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-lunavia-primary to-lunavia-accent rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                        style={{ width: `${Math.max(8, (p.count / maxProvinceCount) * 100)}%` }}
                                    >
                                        <span className="text-[10px] font-bold text-white">{p.count}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── PLATFORM SAFEGUARDS ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-4">🛡️ Platform Safeguards</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <SafeguardBadge icon="✅" title="KYC/KYB" desc="Identity verification" />
                    <SafeguardBadge icon="🛡️" title="Trust Score" desc="Dynamic behavioral scoring" />
                    <SafeguardBadge icon="📍" title="GPS Check-in" desc="Live location tracking" />
                    <SafeguardBadge icon="⚖️" title="Dispute Flow" desc="Structured resolution" />
                    <SafeguardBadge icon="💰" title="Escrow" desc="Secure payments" />
                </div>
            </div>
        </div>
    );
}

// ── Reusable Components ──
function HeroCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
    const bg: Record<string, string> = {
        emerald: 'bg-green-50 border-green-200', green: 'bg-green-50 border-green-200',
        blue: 'bg-blue-50 border-blue-200', indigo: 'bg-lunavia-primary-light border-blue-200', violet: 'bg-lunavia-accent-light border-blue-200',
    };
    const txt: Record<string, string> = {
        emerald: 'text-green-800', green: 'text-green-800', blue: 'text-blue-800', indigo: 'text-lunavia-primary', violet: 'text-lunavia-accent',
    };
    return (
        <div className={`rounded-2xl border p-4 ${bg[color]} shadow-sm`}>
            <span className="text-xl">{icon}</span>
            <p className={`text-xl font-black mt-1 ${txt[color]}`}>{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">{label}</p>
        </div>
    );
}

function FunnelStep({ label, value, sub, width, color }: { label: string; value: number; sub: string; width: number; color: string }) {
    const bg: Record<string, string> = {
        gray: 'bg-gray-200', blue: 'bg-blue-400', indigo: 'bg-lunavia-primary', violet: 'bg-lunavia-accent', purple: 'bg-lunavia-accent',
    };
    return (
        <div className="text-center">
            <p className="text-xl font-black text-gray-900">{value}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mx-auto">
                <div className={`h-2.5 rounded-full ${bg[color]} transition-all`} style={{ width: `${width}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{sub}</p>
        </div>
    );
}

function MetricBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{value}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
        </div>
    );
}

function SafeguardBadge({ icon, title, desc }: { icon: string; title: string; desc: string }) {
    return (
        <div className="flex flex-col items-center text-center p-3 bg-green-50 rounded-xl border border-green-100">
            <span className="text-lg mb-1">{icon}</span>
            <p className="text-xs font-bold text-green-800">{title}</p>
            <p className="text-[10px] text-green-600">{desc}</p>
        </div>
    );
}
