"use client";

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface TopUpRequest {
    id: string;
    operatorId: string;
    operatorEmail: string;
    operatorName: string | null;
    amount: number;
    currency: string;
    proofUrl: string | null;
    paymentReference: string | null;
    notes: string | null;
    status: string;
    reviewedBy: string | null;
    reviewedByEmail: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
    internalNotes: string | null;
    createdAt: string;
}

interface Stats {
    pending: number;
    approved: number;
    rejected: number;
    totalAmount: number;
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

const STATUS_BADGE: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
};

export default function EscrowTopUpsPage() {
    const t = useTranslations('Admin.FinanceTopups');
    const [requests, setRequests] = useState<TopUpRequest[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('');
    const [processing, setProcessing] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [selectedReq, setSelectedReq] = useState<TopUpRequest | null>(null);
    const [internalNote, setInternalNote] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const url = filter
                ? `/api/admin/escrow/topups?status=${filter}`
                : '/api/admin/escrow/topups';
            const res = await fetch(url);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setRequests(data.items);
            setStats(data.stats);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    async function handleApprove(id: string) {
        setProcessing(id);
        try {
            const res = await fetch(`/api/finance/topups/${id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ internalNotes: internalNote || undefined }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(t('messages.approveSuccess'));
            setSelectedReq(null);
            setInternalNote('');
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setProcessing(null);
        }
    }

    async function handleReject(id: string) {
        if (!rejectReason.trim()) { toast.error(t('messages.reasonRequired')); return; }
        setProcessing(id);
        try {
            const res = await fetch(`/api/finance/topups/${id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectReason, internalNotes: internalNote || undefined })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(t('messages.rejectSuccess'));
            setRejectId(null);
            setRejectReason('');
            setSelectedReq(null);
            setInternalNote('');
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setProcessing(null);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
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
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="text-xl font-bold text-green-700">{formatVND(stats.totalAmount)}</div>
                        <div className="text-sm text-green-600">{t('stats.totalApproved')}</div>
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
                {['', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                        {s ? (s === 'PENDING' ? t('stats.pending') : s === 'APPROVED' ? t('stats.approved') : t('stats.rejected')) : t('filter.all')}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">{t('messages.loading')}</div>
            ) : requests.length === 0 ? (
                <div className="text-center py-12 text-gray-400">{t('messages.empty')}</div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.operator')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.amount')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.reference')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.proof')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.status')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.date')}</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedReq(req); setInternalNote(''); }}>
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-gray-900">{req.operatorEmail}</div>
                                        <div className="text-xs text-gray-400">ID: {req.operatorId.slice(0, 8)}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatVND(req.amount)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{req.paymentReference || '—'}</td>
                                    <td className="px-4 py-3">
                                        {req.proofUrl ? (
                                            <a href={req.proofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm" onClick={e => e.stopPropagation()}>{t('table.viewProof')}</a>
                                        ) : <span className="text-gray-400 text-sm">{t('table.noProof')}</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_BADGE[req.status] || ''}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(req.createdAt)}</td>
                                    <td className="px-4 py-3 text-right">
                                        {req.status === 'PENDING' ? (
                                            <span className="text-xs text-lunavia-primary font-medium">{t('table.clickToReview')}</span>
                                        ) : req.internalNotes ? (
                                            <span className="text-xs text-gray-500" title={req.internalNotes}>{t('table.hasNotes')}</span>
                                        ) : req.rejectionReason ? (
                                            <span className="text-xs text-red-500">{req.rejectionReason}</span>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Review Modal */}
            {selectedReq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto m-4">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold">{t('modal.title')}</h2>
                            <button onClick={() => setSelectedReq(null)} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between"><span className="text-xs text-gray-500">{t('modal.operator')}</span><span className="text-sm font-medium">{selectedReq.operatorEmail}</span></div>
                                <div className="flex justify-between"><span className="text-xs text-gray-500">{t('modal.amount')}</span><span className="text-sm font-bold text-gray-900">{formatVND(selectedReq.amount)}</span></div>
                                <div className="flex justify-between"><span className="text-xs text-gray-500">{t('modal.reference')}</span><span className="text-sm">{selectedReq.paymentReference || '—'}</span></div>
                                <div className="flex justify-between"><span className="text-xs text-gray-500">{t('modal.submitted')}</span><span className="text-sm">{formatDate(selectedReq.createdAt)}</span></div>
                                {selectedReq.proofUrl && (
                                    <div className="flex justify-between"><span className="text-xs text-gray-500">{t('modal.proof')}</span><a href={selectedReq.proofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{t('modal.viewProof')}</a></div>
                                )}
                                {selectedReq.notes && (
                                    <div><span className="text-xs text-gray-500">{t('modal.operatorNotes')}</span><p className="text-sm text-gray-700 mt-0.5">{selectedReq.notes}</p></div>
                                )}
                            </div>

                            {/* Existing Internal Notes (for already-reviewed items) */}
                            {selectedReq.internalNotes && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-amber-600 text-xs font-semibold uppercase">{t('modal.internalNotesTitle')}</span>
                                        {selectedReq.reviewedByEmail && (
                                            <span className="text-xs text-gray-500">{t('modal.by', { email: selectedReq.reviewedByEmail })}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-amber-900 whitespace-pre-wrap">{selectedReq.internalNotes}</p>
                                    {selectedReq.reviewedAt && (
                                        <p className="text-xs text-amber-600 mt-2">{formatDate(selectedReq.reviewedAt)}</p>
                                    )}
                                </div>
                            )}

                            {/* Internal Notes Input (for pending items) */}
                            {selectedReq.status === 'PENDING' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.internalNotesLabel')}</label>
                                        <textarea value={internalNote} onChange={e => setInternalNote(e.target.value)} rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lunavia-primary focus:border-lunavia-primary"
                                            placeholder={t('modal.internalNotesPlaceholder')} />
                                    </div>
                                    <div className="flex gap-3 pt-2 border-t border-gray-200">
                                        <button onClick={() => { setRejectId(selectedReq.id); }} disabled={processing === selectedReq.id}
                                            className="flex-1 border border-red-300 text-red-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-red-50 disabled:opacity-50">{t('modal.rejectBtn')}</button>
                                        <button onClick={() => handleApprove(selectedReq.id)} disabled={processing === selectedReq.id}
                                            className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                                            {processing === selectedReq.id ? t('modal.processing') : t('modal.approveBtn')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Already processed status */}
                            {selectedReq.status !== 'PENDING' && !selectedReq.internalNotes && (
                                <div className={`p-4 rounded-lg ${selectedReq.status === 'APPROVED' ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <p className={`text-sm font-medium ${selectedReq.status === 'APPROVED' ? 'text-green-700' : 'text-red-700'}`}>
                                        {selectedReq.status === 'APPROVED' ? t('modal.statusApproved') : t('modal.statusRejected')}
                                    </p>
                                    {selectedReq.rejectionReason && <p className="mt-1 text-sm text-red-600">{t('modal.reason', { reason: selectedReq.rejectionReason })}</p>}
                                    {selectedReq.reviewedAt && <p className="mt-1 text-xs text-gray-500">{t('modal.reviewedAt', { date: formatDate(selectedReq.reviewedAt) })}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('rejectModal.title')}</h2>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                            placeholder={t('rejectModal.placeholder')} rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4" />
                        <div className="flex gap-3">
                            <button onClick={() => handleReject(rejectId)} disabled={processing === rejectId}
                                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50">
                                {t('rejectModal.confirmBtn')}
                            </button>
                            <button onClick={() => { setRejectId(null); setRejectReason(''); }}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                {t('rejectModal.cancelBtn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
