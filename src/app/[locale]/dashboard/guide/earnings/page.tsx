"use client";

import { useState, useEffect } from 'react';
import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface EarringSummary {
    totalExpected: number;
    totalReleased: number;
    pendingRelease: number;
}

interface TourEarning {
    id: string;
    title: string;
    status: string;
    endTime: string;
    amount: number;
    released: boolean;
    cancellationType: string | null;
    operatorName: string;
}

export default function GuideEarningsPage() {
    const t = useTranslations('Guide.Earnings');
    const [summary, setSummary] = useState<EarringSummary | null>(null);
    const [history, setHistory] = useState<TourEarning[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const res = await fetch('/api/export/earnings?format=csv');
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lunavia-earnings-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success(t('export.success'));
        } catch {
            toast.error(t('export.failed'));
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        fetch('/api/guide/earnings')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSummary(data.data.summary);
                    setHistory(data.data.history);
                } else {
                    toast.error(data.error);
                }
            })
            .catch(() => toast.error(t('alerts.networkError')))
            .finally(() => setLoading(false));
    }, [t]);

    const fmtVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('vi-VN', { 
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <BaseDashboardLayout header={
            <div className="flex items-center justify-between w-full">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    disabled={exporting || history.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition shadow-sm"
                >
                    📥 {exporting ? t('export.exporting') : t('export.btn')}
                </button>
            </div>
        }>
            <div className="space-y-6">
                
                {/* Summary Cards */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
                    </div>
                ) : summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                            <p className="text-sm font-semibold text-emerald-800">{t('summary.totalReleased')}</p>
                            <p className="text-3xl font-black text-emerald-600 mt-2">{fmtVND(summary.totalReleased)}</p>
                            <p className="text-xs text-emerald-600/70 mt-1">{t('summary.totalReleasedDesc')}</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm">
                            <p className="text-sm font-semibold text-amber-800">{t('summary.pendingRelease')}</p>
                            <p className="text-3xl font-black text-amber-600 mt-2">{fmtVND(summary.pendingRelease)}</p>
                            <p className="text-xs text-amber-600/70 mt-1">{t('summary.pendingReleaseDesc')}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                            <p className="text-sm font-semibold text-gray-800">{t('summary.totalExpected')}</p>
                            <p className="text-3xl font-black text-gray-900 mt-2">{fmtVND(summary.totalExpected)}</p>
                            <p className="text-xs text-gray-500 mt-1">{t('summary.totalExpectedDesc')}</p>
                        </div>
                    </div>
                )}

                {/* History Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h2 className="text-base font-bold text-gray-900">{t('history.title')}</h2>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-200/50 px-2.5 py-1 rounded-full">{t('history.records', { count: history.length })}</span>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">{t('history.loading')}</div>
                    ) : history.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                                <span className="text-2xl">💰</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">{t('history.noEarnings')}</h3>
                            <p className="text-sm text-gray-500 mt-1">{t('history.noEarningsDesc')}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50/50">
                                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{t('history.cols.tour')}</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{t('history.cols.operator')}</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{t('history.cols.endDate')}</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{t('history.cols.status')}</th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('history.cols.amount')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {history.map((tour) => (
                                        <tr key={tour.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <Link href={`/dashboard/guide/tours/${tour.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1">
                                                    {tour.title}
                                                </Link>
                                                {tour.status === 'CANCELLED' && (
                                                    <span className="text-xs text-red-500 mt-1 block">{t('history.statusLabels.cancelled', { type: tour.cancellationType || 'N/A' })}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600 line-clamp-1">
                                                {tour.operatorName}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-500">
                                                {tour.endTime ? fmtDate(tour.endTime) : '—'}
                                            </td>
                                            <td className="px-5 py-4">
                                                {tour.status === 'COMPLETED' ? (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                                                        tour.released 
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${tour.released ? 'bg-emerald-500' : 'bg-amber-500/80 animate-pulse'}`} />
                                                        {tour.released ? t('history.statusLabels.released') : t('history.statusLabels.pendingEscrow')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                                        {t('history.statusLabels.notApplicable')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <span className={`font-semibold ${tour.status === 'CANCELLED' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                    {fmtVND(tour.amount)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </BaseDashboardLayout>
    );
}
