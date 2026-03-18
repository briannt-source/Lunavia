'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface Dispute {
    id: string;
    tourId: string;
    reason: string;
    status: string;
    resolution: string | null;
    createdAt: string;
    tour: { id: string; title: string };
    openedBy: { id: string; name: string | null; email: string };
    _count: { evidence: number };
}

export default function GuideDisputesPage() {
    const t = useTranslations('Guide.Disputes');
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [tourId, setTourId] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchDisputes = useCallback(async () => {
        setLoading(true);
        const res = await fetch('/api/disputes');
        if (res.ok) {
            const data = await res.json();
            setDisputes(data.disputes || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const res = await fetch('/api/disputes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tourId, reason }),
        });
        if (res.ok) {
            setShowForm(false);
            setTourId('');
            setReason('');
            fetchDisputes();
        }
        setSubmitting(false);
    };

    const statusBadge = (s: string) => {
        const map: Record<string, string> = {
            OPEN: 'bg-red-50 text-red-700 border-red-200',
            UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
            RESOLVED: 'bg-green-50 text-green-700 border-green-200',
            REJECTED: 'bg-gray-50 text-gray-500 border-gray-200',
        };
        return map[s] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
                </div>
                <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition shadow-sm">
                    {t('openBtn')}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">{t('form.title')}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.tourId')}</label>
                            <input type="text" value={tourId} onChange={e => setTourId(e.target.value)} placeholder={t('form.tourIdPlaceholder')} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.reason')}</label>
                            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder={t('form.reasonPlaceholder')} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none" required />
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={submitting} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition">{submitting ? t('form.submittingBtn') : t('form.submitBtn')}</button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition">{t('form.cancelBtn')}</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-gray-200 border-t-indigo-600 rounded-full animate-spin" /></div>
            ) : disputes.length === 0 ? (
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-12 text-center">
                    <div className="text-3xl mb-3">⚖️</div>
                    <p className="text-gray-500 text-sm">{t('emptyState.title')}</p>
                    <p className="text-gray-400 text-xs mt-1">{t('emptyState.desc')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {disputes.map(d => (
                        <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusBadge(d.status)}`}>
                                    {d.status.replace(/_/g, ' ')}
                                </span>
                                <span className="text-xs text-gray-400">{t('list.evidenceCount', { count: d._count.evidence })}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900">{d.tour.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{d.reason}</p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                <span>{t('list.openedBy', { name: d.openedBy.name || d.openedBy.email })}</span>
                                <span>{new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                            {d.resolution && (
                                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200 text-sm text-green-700">
                                    <strong>{t('list.resolution')}</strong> {d.resolution}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
