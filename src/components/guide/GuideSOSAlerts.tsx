'use client';

import { useEffect, useState } from 'react';

interface SOSBroadcast {
    id: string;
    tourId: string;
    tourTitle: string;
    location: string;
    startTime: string;
    payout: number;
    urgency: string;
    expiresAt: string;
    operatorName?: string;
}

export function GuideSOSAlerts() {
    const [broadcasts, setBroadcasts] = useState<SOSBroadcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState<string | null>(null);

    useEffect(() => {
        fetchBroadcasts();
        // Poll every 30 seconds for new SOS broadcasts
        const interval = setInterval(fetchBroadcasts, 30000);
        return () => clearInterval(interval);
    }, []);

    async function fetchBroadcasts() {
        try {
            const res = await fetch('/api/guide/sos-broadcasts');
            const data = await res.json();
            if (data.success) {
                setBroadcasts(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch SOS broadcasts:', err);
        } finally {
            setLoading(false);
        }
    }

    async function acceptBroadcast(broadcastId: string) {
        setAccepting(broadcastId);
        try {
            const res = await fetch(`/api/guide/sos-broadcasts/${broadcastId}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                // Remove from list after accepting
                setBroadcasts(prev => prev.filter(b => b.id !== broadcastId));
                alert('✅ You have accepted this SOS broadcast! The operator will review your application.');
            } else {
                alert(data.error || 'Failed to accept broadcast');
            }
        } catch (err) {
            alert('Failed to accept broadcast');
        } finally {
            setAccepting(null);
        }
    }

    if (loading || broadcasts.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border-2 border-red-200 p-5 shadow-sm animate-pulse-slow">
            <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <h3 className="font-bold text-red-800 text-sm uppercase tracking-wider">
                    🚨 Emergency SOS Broadcasts ({broadcasts.length})
                </h3>
            </div>
            <p className="text-xs text-red-600 mb-4">
                Operators need emergency guide replacements. Accept to apply immediately.
            </p>
            <div className="space-y-3">
                {broadcasts.map(broadcast => {
                    const expiresAt = new Date(broadcast.expiresAt);
                    const now = new Date();
                    const minutesLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 60000));
                    const startDate = new Date(broadcast.startTime);

                    return (
                        <div key={broadcast.id} className="bg-white rounded-xl p-4 border border-red-100 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-gray-900 text-sm truncate">
                                        {broadcast.tourTitle || 'Emergency Tour'}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-gray-500">
                                        {broadcast.location && (
                                            <span className="flex items-center gap-1">📍 {broadcast.location}</span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            📅 {startDate.toLocaleDateString('vi-VN')} {startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {broadcast.payout > 0 && (
                                            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                                                💰 {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(broadcast.payout)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                            minutesLeft <= 15 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            ⏱ {minutesLeft}m left
                                        </span>
                                        {broadcast.operatorName && (
                                            <span className="text-xs text-gray-400">by {broadcast.operatorName}</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => acceptBroadcast(broadcast.id)}
                                    disabled={accepting === broadcast.id}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shadow-sm disabled:opacity-50 disabled:cursor-wait flex-shrink-0"
                                >
                                    {accepting === broadcast.id ? 'Accepting...' : 'Accept SOS'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
