"use client";

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface LedgerEntry {
    id: string;
    walletId: string;
    operatorId: string;
    operatorEmail: string;
    operatorName: string | null;
    direction: 'CREDIT' | 'DEBIT';
    type: string;
    amount: number;
    referenceId: string | null;
    metadata: any;
    createdAt: string;
}

function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

const ESCROW_TYPE_LABELS: Record<string, string> = {
    ESCROW_TOPUP: 'Top-Up',
    ESCROW_WITHDRAW: 'Withdrawal',
    ESCROW_HOLD: 'Escrow Hold',
    ESCROW_RELEASE: 'Escrow Release',
    ESCROW_REFUND: 'Refund',
    SYSTEM_ADJUSTMENT: 'Adjustment',
    BOOST_PURCHASE: 'Boost Purchase',
};

const REVENUE_TYPE_LABELS: Record<string, string> = {
    SUBSCRIPTION_FEE: 'Subscription Fee',
    COMMISSION_FEE: 'Commission Fee',
    BOOST_FEE: 'Boost Fee',
    PENALTY_FEE: 'Penalty Fee',
    ADJUSTMENT: 'Adjustment',
};

const ESCROW_FILTER_OPTIONS = [
    '', 'ESCROW_TOPUP', 'ESCROW_WITHDRAW', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'ESCROW_REFUND', 'SYSTEM_ADJUSTMENT', 'BOOST_PURCHASE'
];

const REVENUE_FILTER_OPTIONS = [
    '', 'SUBSCRIPTION_FEE', 'COMMISSION_FEE', 'BOOST_FEE', 'PENALTY_FEE', 'ADJUSTMENT'
];

export default function EscrowLedgerPage() {
    const t = useTranslations('Admin.FinanceLedger');
    const [activeTab, setActiveTab] = useState<'ESCROW' | 'REVENUE'>('ESCROW');
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '50' });
            if (typeFilter) params.set('type', typeFilter);
            
            const endpoint = activeTab === 'ESCROW' 
                ? `/api/admin/escrow/ledger?${params}` 
                : `/api/admin/finance/revenue?${params}`;
                
            const res = await fetch(endpoint);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setEntries(data.items);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [activeTab, typeFilter, page]);

    useEffect(() => { 
        setPage(1);
        setTypeFilter('');
    }, [activeTab]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const FILTER_OPTIONS = activeTab === 'ESCROW' ? ESCROW_FILTER_OPTIONS : REVENUE_FILTER_OPTIONS;
    const TYPE_LABELS = activeTab === 'ESCROW' ? ESCROW_TYPE_LABELS : REVENUE_TYPE_LABELS;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg font-medium">
                    {t('entriesCount', { count: total })}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('ESCROW')}
                    className={`pb-3 px-4 transition-colors font-medium text-sm border-b-2 ${activeTab === 'ESCROW' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}
                >
                    {t('tabs.escrow')}
                </button>
                <button
                    onClick={() => setActiveTab('REVENUE')}
                    className={`pb-3 px-4 transition-colors font-medium text-sm border-b-2 ${activeTab === 'REVENUE' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}
                >
                    {t('tabs.revenue')}
                </button>
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
                {FILTER_OPTIONS.map(typeVal => (
                    <button key={typeVal} onClick={() => { setTypeFilter(typeVal); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === typeVal ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100 bg-gray-50'}`}>
                        {typeVal ? (activeTab === 'ESCROW' ? t(`escrowTypes.${typeVal}`) : t(`revenueTypes.${typeVal}`)) : t('filter.all')}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">{t('messages.loading')}</div>
            ) : entries.length === 0 ? (
                <div className="text-center py-12 text-gray-400">{t('messages.empty')}</div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.date')}</th>
                                {activeTab === 'ESCROW' && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.operator')}</th>
                                )}
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.type')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.direction')}</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('table.amount')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.reference')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {entries.map(entry => (
                                <tr key={entry.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(entry.createdAt)}</td>
                                    {activeTab === 'ESCROW' && (
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-gray-900">{entry.operatorEmail || '—'}</div>
                                        </td>
                                    )}
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                            {activeTab === 'ESCROW' ? t(`escrowTypes.${entry.type}`) : t(`revenueTypes.${entry.type}`)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.direction === 'CREDIT'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {entry.direction}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-3 text-sm font-semibold text-right ${entry.direction === 'CREDIT' ? 'text-green-700' : 'text-red-700'}`}>
                                        {entry.direction === 'CREDIT' ? '+' : '−'}{formatVND(entry.amount)}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                                        {entry.referenceId ? entry.referenceId.slice(0, 12) + '…' : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                        {t('pagination.previous')}
                    </button>
                    <span className="text-sm text-gray-500">{t('pagination.pageStatus', { page, total: totalPages })}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                        {t('pagination.next')}
                    </button>
                </div>
            )}
        </div>
    );
}
