"use client";

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/navigation';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface PaymentRequest {
    id: string;
    userId: string;
    userEmail: string;
    userRole: string;
    currentPlan: string;
    requestedPlan: string;
    durationDays: number;
    amount: number | null;
    status: string;
    proofImageUrl: string | null;
    rejectionReason: string | null;
    approvedBy: string | null;
    approvedAt: string | null;
    createdAt: string;
}

interface Stats {
    pending: number;
    approved: number;
    rejected: number;
    totalRevenue: number | null;
}

interface PlanDistribution {
    plan: string;
    count: number;
    percentage: number;
}

interface SubscriptionStats {
    totalUsers: number;
    activePaid: number;
    expiredPaid: number;
    planDistribution: PlanDistribution[];
    roleCounts: { role: string; count: number }[];
    totalApprovedPayments: number;
    totalApprovedRevenue: number;
}

const PLAN_COLORS: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-700',
    PRO: 'bg-indigo-100 text-indigo-700',
    ELITE: 'bg-amber-100 text-amber-700',
    OPS_STARTER: 'bg-cyan-100 text-cyan-700',
    OPS_BUSINESS: 'bg-teal-100 text-teal-700',
    GUIDE_FREE: 'bg-emerald-100 text-emerald-700',
    GUIDE_PRO: 'bg-violet-100 text-violet-700',
    ENTERPRISE: 'bg-rose-100 text-rose-700',
};

const ROLE_LABELS: Record<string, string> = {
    operator: 'Tour Operators',
    guide: 'Tour Guides',
    admin: 'Admin',
    super_admin: 'Super Admin',
    observer: 'Observers',
};

function formatVND(amount: number | null): string {
    if (amount === null) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

export default function RevenueSubscriptionsPage() {
    const t = useTranslations('Admin.FinanceSubscriptions');
    const [requests, setRequests] = useState<PaymentRequest[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [canSeeRevenue, setCanSeeRevenue] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('PENDING');
    const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [subStats, setSubStats] = useState<SubscriptionStats | null>(null);
    const [subStatsLoading, setSubStatsLoading] = useState(true);

    const fetchPayments = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/payments?status=${filter}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load');
            setRequests(data.items);
            setStats(data.stats);
            setCanSeeRevenue(data.canSeeRevenue);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    useEffect(() => {
        fetch('/api/admin/subscription-stats')
            .then(res => res.json())
            .then(data => { if (data.success) setSubStats(data.data); })
            .catch(console.error)
            .finally(() => setSubStatsLoading(false));
    }, []);

    async function handleApprove(id: string) {
        if (!confirm(t('requests.confirmApprove'))) return;
        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/payments/${id}/approve`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(t('requests.approveSuccess'));
            fetchPayments();
            setSelectedRequest(null);
        } catch (err: any) { toast.error(err.message); }
        finally { setProcessing(false); }
    }

    async function handleReject(id: string) {
        if (!rejectReason.trim()) { toast.error(t('requests.rejectRequired')); return; }
        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/payments/${id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectReason })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(t('requests.rejectSuccess'));
            fetchPayments();
            setSelectedRequest(null);
            setRejectReason('');
        } catch (err: any) { toast.error(err.message); }
        finally { setProcessing(false); }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
            </div>

            {/* ── Plan Distribution Stats ── */}
            {subStatsLoading ? (
                <div className="text-center py-8 text-gray-400">{t('stats.loading')}</div>
            ) : subStats && (
                <div className="space-y-5">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <div className="text-3xl font-black text-gray-900">{subStats.totalUsers}</div>
                            <div className="text-sm text-gray-500 mt-1">{t('stats.totalAccounts')}</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <div className="text-3xl font-black text-indigo-600">{subStats.activePaid}</div>
                            <div className="text-sm text-gray-500 mt-1">{t('stats.activePaid')}</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <div className="text-3xl font-black text-red-500">{subStats.expiredPaid}</div>
                            <div className="text-sm text-gray-500 mt-1">{t('stats.expiredPaid')}</div>
                        </div>
                        {canSeeRevenue && (
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <div className="text-2xl font-black text-emerald-600">{formatVND(subStats.totalApprovedRevenue)}</div>
                                <div className="text-sm text-gray-500 mt-1">{t('stats.totalRevenue')}</div>
                            </div>
                        )}
                    </div>

                    {/* Plan Distribution + Role Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Plan Table */}
                        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-sm font-bold text-gray-900">{t('distribution.title')}</h3>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-5 py-2 text-xs font-medium text-gray-500 uppercase">{t('distribution.plan')}</th>
                                        <th className="text-right px-5 py-2 text-xs font-medium text-gray-500 uppercase">{t('distribution.users')}</th>
                                        <th className="text-right px-5 py-2 text-xs font-medium text-gray-500 uppercase">{t('distribution.percentage')}</th>
                                        <th className="px-5 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {subStats.planDistribution.map(p => (
                                        <tr key={p.plan} className="hover:bg-gray-50">
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${PLAN_COLORS[p.plan] || 'bg-gray-100 text-gray-700'}`}>
                                                    {p.plan}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold text-gray-900">{p.count}</td>
                                            <td className="px-5 py-3 text-right text-gray-500">{p.percentage}%</td>
                                            <td className="px-5 py-3">
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(p.percentage, 100)}%` }} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Role Breakdown */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-sm font-bold text-gray-900">{t('distribution.byRole')}</h3>
                            </div>
                            <div className="p-5 space-y-3">
                                {subStats.roleCounts.map(r => (
                                    <div key={r.role} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">{t(`roles.${r.role}`) || r.role}</span>
                                        <span className="text-sm font-bold text-gray-900">{r.count}</span>
                                    </div>
                                ))}
                                {canSeeRevenue && (
                                    <div className="pt-3 mt-3 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">{t('distribution.approvedPayments')}</span>
                                            <span className="text-sm font-bold text-gray-900">{subStats.totalApprovedPayments}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200" />

            <div>
                <h2 className="text-lg font-bold text-gray-900">{t('requests.title')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('requests.subtitle')}</p>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
                        <div className="text-sm text-yellow-600">{t('stats.pending')}</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
                        <div className="text-sm text-green-600">{t('stats.approved')}</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
                        <div className="text-sm text-red-600">{t('stats.rejected')}</div>
                    </div>
                    {canSeeRevenue && stats.totalRevenue !== null && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                            <div className="text-xl font-bold text-indigo-700">{formatVND(stats.totalRevenue)}</div>
                            <div className="text-sm text-indigo-600">{t('stats.totalRevenue')}</div>
                        </div>
                    )}
                </div>
            )}

            {/* Filter */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
                {['PENDING', 'APPROVED', 'REJECTED'].map(status => (
                    <button key={status} onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                        {t(`stats.${status.toLowerCase()}`)}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">{t('requests.loading')}</div>
            ) : requests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">{t('requests.empty', { filter: t(`stats.${filter.toLowerCase()}`) })}</div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.user')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.plan')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.duration')}</th>
                                {canSeeRevenue && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.amount')}</th>}
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.proof')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.date')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-gray-900">{req.userEmail}</div>
                                        <div className="text-xs text-gray-500">{req.currentPlan} → {req.requestedPlan}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${req.requestedPlan === 'ELITE' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                            {req.requestedPlan}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{t('table.days', { days: req.durationDays })}</td>
                                    {canSeeRevenue && <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatVND(req.amount)}</td>}
                                    <td className="px-4 py-3">
                                        {req.proofImageUrl ? (
                                            <a href={req.proofImageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm">{t('table.view')}</a>
                                        ) : <span className="text-gray-400 text-sm">{t('table.none')}</span>}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(req.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        {req.status === 'PENDING' ? (
                                            <button onClick={() => setSelectedRequest(req)} className="text-indigo-600 hover:underline text-sm font-medium">{t('table.review')}</button>
                                        ) : req.status === 'REJECTED' && req.rejectionReason ? (
                                            <span className="text-xs text-red-600">{req.rejectionReason}</span>
                                        ) : <span className="text-xs text-green-600">{t('table.approved')}</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Review Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white rounded-xl p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('modal.title')}</h2>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between"><span className="text-gray-500">{t('modal.user')}</span><span className="font-medium">{selectedRequest.userEmail}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">{t('modal.planChange')}</span><span className="font-medium">{selectedRequest.currentPlan} → {selectedRequest.requestedPlan}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">{t('modal.duration')}</span><span className="font-medium">{t('table.days', { days: selectedRequest.durationDays })}</span></div>
                            {canSeeRevenue && <div className="flex justify-between"><span className="text-gray-500">{t('modal.amount')}</span><span className="font-medium">{formatVND(selectedRequest.amount)}</span></div>}
                            <div className="flex justify-between">
                                <span className="text-gray-500">{t('modal.proof')}</span>
                                {selectedRequest.proofImageUrl ? (
                                    <a href={selectedRequest.proofImageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{t('modal.viewReceipt')}</a>
                                ) : <span className="text-gray-400">{t('modal.noProof')}</span>}
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('modal.rejectionReasonLabel')}</label>
                            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                                placeholder={t('modal.rejectionReasonPlaceholder')} rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => handleApprove(selectedRequest.id)} disabled={processing}
                                className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">{t('modal.approveBtn')}</button>
                            <button onClick={() => handleReject(selectedRequest.id)} disabled={processing || !rejectReason.trim()}
                                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50">{t('modal.rejectBtn')}</button>
                            <button onClick={() => { setSelectedRequest(null); setRejectReason(''); }}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">{t('modal.cancelBtn')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
