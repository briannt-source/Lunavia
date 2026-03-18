'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

interface Invite {
    id: string;
    status: string;
    message: string | null;
    expiresAt: string;
    createdAt: string;
    tour: {
        id: string;
        title: string;
        location: string;
        province: string | null;
        startTime: string;
        endTime: string;
        language: string | null;
        totalPayout: number | null;
        currency: string;
        status: string;
    };
    operator: {
        id: string;
        name: string | null;
        avatarUrl: string | null;
        trustScore: number;
        roleMetadata: string | null;
        verificationStatus: string;
    };
}

export function GuideInviteList() {
    const t = useTranslations('Guide.Invites');
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('ALL');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
        PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', label: t('status.PENDING') },
        ACCEPTED: { bg: 'bg-green-50', text: 'text-green-700', label: t('status.ACCEPTED') },
        DECLINED: { bg: 'bg-gray-100', text: 'text-gray-600', label: t('status.DECLINED') },
        EXPIRED: { bg: 'bg-red-50', text: 'text-red-600', label: t('status.EXPIRED') },
    };

    function getOperatorName(meta: string | null, fallbackName: string | null): string {
        if (meta) {
            try {
                const parsed = JSON.parse(meta);
                return parsed.companyName || fallbackName || t('list.unknownOperator');
            } catch { /* ignore */ }
        }
        return fallbackName || t('list.unknownOperator');
    }

    useEffect(() => {
        fetchInvites();
    }, []);

    async function fetchInvites() {
        try {
            const res = await fetch('/api/guides/invites');
            const data = await res.json();
            if (data.success) setInvites(data.invites || []);
        } catch (error) {
            console.error(t('alerts.loadFail'), error);
        } finally {
            setLoading(false);
        }
    }

    async function handleAction(inviteId: string, action: 'accept' | 'decline') {
        setProcessingId(inviteId);
        try {
            const res = await fetch(`/api/invites/${inviteId}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (res.ok) {
                fetchInvites();
            } else {
                alert(data.error || t('alerts.actionFail', { action }));
            }
        } catch {
            alert(t('alerts.networkError'));
        } finally {
            setProcessingId(null);
        }
    }

    const filtered = invites.filter(inv => {
        if (filter === 'ALL') return true;
        return inv.status === filter;
    });

    const pendingCount = invites.filter(i => i.status === 'PENDING').length;

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-gray-100 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
                    <p className="text-sm text-gray-500">
                        {pendingCount > 0 ? t('list.pendingCount', { count: pendingCount }) : t('list.noPending')}
                    </p>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {['ALL', 'PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === tab
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {tab === 'ALL' ? t('list.all') : STATUS_CONFIG[tab]?.label || tab}
                        {tab === 'PENDING' && pendingCount > 0 && (
                            <span className="ml-1.5 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Invite list */}
            {filtered.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">{t('list.empty')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(invite => {
                        const config = STATUS_CONFIG[invite.status] || STATUS_CONFIG.PENDING;
                        const isExpired = new Date(invite.expiresAt) < new Date();
                        const operatorName = getOperatorName(invite.operator.roleMetadata, invite.operator.name);

                        return (
                            <div key={invite.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                                                {config.label}
                                            </span>
                                            {isExpired && invite.status === 'PENDING' && (
                                                <span className="text-xs text-red-500 font-medium">{t('list.expired')}</span>
                                            )}
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900 truncate">{invite.tour.title}</h3>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {t('list.from')} <strong>{operatorName}</strong>
                                            {invite.operator.verificationStatus === 'APPROVED' && (
                                                <span className="ml-1 text-green-600" title="Verified">✓</span>
                                            )}
                                        </p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                                            <span>📍 {invite.tour.location}</span>
                                            <span>📅 {format(new Date(invite.tour.startTime), 'MMM d, yyyy')}</span>
                                            {invite.tour.totalPayout && (
                                                <span>💰 {invite.tour.totalPayout.toLocaleString()} {invite.tour.currency}</span>
                                            )}
                                            {invite.tour.language && <span>🌐 {invite.tour.language}</span>}
                                        </div>
                                        {invite.message && (
                                            <p className="mt-2 text-sm text-gray-600 italic">"{invite.message}"</p>
                                        )}
                                        <p className="mt-2 text-xs text-gray-400">
                                            {t('list.received')} {format(new Date(invite.createdAt), 'MMM d, yyyy h:mm a')}
                                            {invite.status === 'PENDING' && !isExpired && (
                                                <> · {t('list.expires')} {format(new Date(invite.expiresAt), 'MMM d, yyyy h:mm a')}</>
                                            )}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    {invite.status === 'PENDING' && !isExpired && (
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => handleAction(invite.id, 'accept')}
                                                disabled={processingId === invite.id}
                                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition shadow-sm"
                                            >
                                                {processingId === invite.id ? t('list.acceptingBtn') : t('list.acceptBtn')}
                                            </button>
                                            <button
                                                onClick={() => handleAction(invite.id, 'decline')}
                                                disabled={processingId === invite.id}
                                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                                            >
                                                {processingId === invite.id ? t('list.decliningBtn') : t('list.declineBtn')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
