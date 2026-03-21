'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

interface FinanceData {
    system: { walletCount: number; totalAvailableEstimated: number; totalPendingEstimated: number };
    pending: { withdrawalsCount: number; withdrawalsAmount: number; topupsCount: number; topupsAmount: number };
    monthlyFlow: { withdrawals: number; topups: number; subscriptions: number };
    revenue: { totalSubscriptions: number };
    topWallets: { id: string; operatorName: string; available: number; pending: number }[];
    activeEscrowHolds: { id: string; amount: number; title: string; operatorName: string; heldAt: string }[];
    timestamp: string;
}

const fmtCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function FinancialOmnisciencePage() {
    const t = useTranslations('Admin.FinanceOmniscience');
    const [data, setData] = useState<FinanceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/finance/omniscience')
            .then(res => res.json())
            .then(json => { if (json.success) setData(json.data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
                <div className="h-10 bg-gray-100 rounded w-64" />
                <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl" />)}</div>
                <div className="grid grid-cols-2 gap-6"><div className="h-96 bg-gray-100 rounded-xl" /><div className="h-96 bg-gray-100 rounded-xl" /></div>
            </div>
        </div>
    );

    if (!data) return <div className="p-8 text-center text-red-500">{t('error')}</div>;

    const { system, pending, monthlyFlow, revenue, topWallets, activeEscrowHolds } = data;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        {t('title')}
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-800 rounded-full">{t('levelGod')}</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t('lastUpdated')}</p>
                    <p className="text-xs text-gray-600 font-medium">{fmtDate(data.timestamp)}</p>
                </div>
            </div>

            {/* ── MACRO METRICS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label={t('metrics.escrowHeld')} value={fmtCurrency(system.totalPendingEstimated)} icon="🏦" color="amber" subline={t('metrics.escrowSubline')} />
                <MetricCard label={t('metrics.subRevenue')} value={fmtCurrency(revenue.totalSubscriptions)} icon="💎" color="accent" subline={t('metrics.subRevenueSubline', { amount: fmtCurrency(monthlyFlow.subscriptions) })} />
                <MetricCard label={t('metrics.pendingWithdrawals')} value={fmtCurrency(pending.withdrawalsAmount)} icon="📤" color="orange" subline={t('metrics.requests', { count: pending.withdrawalsCount })} alert={pending.withdrawalsCount > 0} />
                <MetricCard label={t('metrics.pendingTopups')} value={fmtCurrency(pending.topupsAmount)} icon="📥" color="blue" subline={t('metrics.requests', { count: pending.topupsCount })} alert={pending.topupsCount > 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── TOP WALLET BALANCES ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">{t('wallets.title')}</h2>
                        <span className="text-xs font-medium text-gray-500">{t('wallets.totalWallets', { count: system.walletCount })}</span>
                    </div>
                    {topWallets.length === 0 ? (
                        <p className="p-6 text-center text-sm text-gray-400">{t('wallets.empty')}</p>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {topWallets.map((w, idx) => (
                                <div key={w.id} className="flex justify-between items-center p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{w.operatorName}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">{w.id.split('-')[0]}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-green-700">{fmtCurrency(w.available)}</p>
                                        {w.pending > 0 && <p className="text-[10px] font-bold text-amber-600 mt-0.5">{t('wallets.inEscrow', { amount: fmtCurrency(w.pending) })}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── ACTIVE ESCROW HOLDS ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">{t('escrow.title')}</h2>
                        <Link href="/dashboard/admin/tours" className="text-xs font-medium text-lunavia-primary hover:text-lunavia-primary-hover">{t('escrow.viewAll')}</Link>
                    </div>
                    {activeEscrowHolds.length === 0 ? (
                        <p className="p-6 text-center text-sm text-gray-400">{t('escrow.empty')}</p>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {activeEscrowHolds.map(h => (
                                <div key={h.id} className="flex flex-col p-4 hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-start mb-1">
                                        <Link href={`/dashboard/admin/tours/${h.id}`} className="text-sm font-semibold text-gray-900 hover:text-lunavia-primary hover:underline line-clamp-1">
                                            {h.title}
                                        </Link>
                                        <span className="text-sm font-black text-amber-600 shrink-0 ml-3">{fmtCurrency(h.amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                                        <span>🏢 {h.operatorName}</span>
                                        <span>{t('escrow.held', { date: fmtDate(h.heldAt) })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── LIQUIDITY FLOW (MONTH) ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">{t('flow.title')}</h2>
                <div className="grid grid-cols-3 gap-8">
                    <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">{t('flow.moneyIn')}</p>
                        <p className="text-2xl font-black text-blue-900">{fmtCurrency(monthlyFlow.topups)}</p>
                    </div>
                    <div className="text-center p-4 bg-lunavia-accent-light rounded-xl border border-lunavia-accent/20 flex flex-col justify-center relative">
                        <div className="absolute top-1/2 -left-4 w-8 border-t-2 border-dashed border-gray-300 transform -translate-y-1/2"></div>
                        <div className="absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-gray-300 transform -translate-y-1/2"></div>
                        <p className="text-xs font-bold text-lunavia-accent uppercase tracking-wider mb-2">{t('flow.platformSubs')}</p>
                        <p className="text-2xl font-black text-lunavia-accent">{fmtCurrency(monthlyFlow.subscriptions)}</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">{t('flow.moneyOut')}</p>
                        <p className="text-2xl font-black text-orange-900">{fmtCurrency(monthlyFlow.withdrawals)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, icon, color, subline, alert }: { label: string; value: string; icon: string; color: string; subline?: string; alert?: boolean }) {
    const bg: Record<string, string> = { amber: 'bg-amber-50 border-amber-200', accent: 'bg-lunavia-accent-light border-lunavia-accent/20', orange: 'bg-orange-50 border-orange-200', blue: 'bg-blue-50 border-blue-200' };
    const txt: Record<string, string> = { amber: 'text-amber-900', accent: 'text-lunavia-accent', orange: 'text-orange-900', blue: 'text-blue-900' };
    return (
        <div className={`rounded-2xl border p-5 ${bg[color]} shadow-sm relative overflow-hidden`}>
            {alert && <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
            <span className="text-2xl">{icon}</span>
            <p className={`text-2xl font-black mt-2 ${txt[color]}`}>{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{label}</p>
            {subline && <p className="text-[10px] text-gray-400 mt-2 font-medium">{subline}</p>}
        </div>
    );
}
