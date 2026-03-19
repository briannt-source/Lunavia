'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface SentInvite {
    id: string;
    status: string;
    message: string | null;
    expiresAt: string;
    createdAt: string;
    tour: {
        id: string;
        title: string;
        startDate: string;
        status: string;
    };
    guide: {
        id: string;
        name: string | null;
        avatarUrl: string | null;
        trustScore: number;
        roleMetadata: string | null;
    };
}

interface Tour {
    id: string;
    title: string;
    status: string;
    startDate: string;
}

const STATUS_STYLES: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700',
    ACCEPTED: 'bg-green-50 text-green-700',
    DECLINED: 'bg-gray-100 text-gray-600',
    EXPIRED: 'bg-red-50 text-red-600',
};

function getGuideName(meta: string | null, fallback: string | null): string {
    if (meta) {
        try { return JSON.parse(meta).fullName || fallback || 'Guide'; } catch { /* */ }
    }
    return fallback || 'Guide';
}

interface InviteModalProps {
    tours: Tour[];
    guideId: string;
    guideName: string;
    onClose: () => void;
    onSent: () => void;
}

function InviteModal({ tours, guideId, guideName, onClose, onSent }: InviteModalProps) {
    const [selectedTourId, setSelectedTourId] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const eligibleTours = tours.filter(t => ['DRAFT', 'PUBLISHED', 'OPEN'].includes(t.status));

    async function handleSend() {
        if (!selectedTourId) { setError('Please select a tour'); return; }
        setSending(true);
        setError('');
        try {
            const res = await fetch(`/api/tours/${selectedTourId}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guideId, message: message.trim() || undefined }),
            });
            const data = await res.json();
            if (res.ok) {
                onSent();
                onClose();
            } else {
                setError(data.error || 'Failed to send invite');
            }
        } catch {
            setError('Network error');
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Invite to Tour</h3>
                <p className="text-sm text-gray-500 mb-4">Invite <strong>{guideName}</strong> to one of your tours.</p>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-sm text-red-700">{error}</div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Tour</label>
                        {eligibleTours.length === 0 ? (
                            <p className="text-sm text-gray-500">No eligible tours. Create or publish a tour first.</p>
                        ) : (
                            <select
                                value={selectedTourId}
                                onChange={e => setSelectedTourId(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Choose a tour...</option>
                                {eligibleTours.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.title} — {format(new Date(t.startDate), 'MMM d, yyyy')}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Add a personal message to your invitation..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={sending || eligibleTours.length === 0}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                    >
                        {sending ? 'Sending...' : 'Send Invite'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function OperatorInvitePanel() {
    const [invites, setInvites] = useState<SentInvite[]>([]);
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState<{ guideId: string; guideName: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [invRes, tourRes] = await Promise.all([
                fetch('/api/operator/invites').then(r => r.json()),
                fetch('/api/requests?mine=true').then(r => r.json()),
            ]);
            if (invRes.success) setInvites(invRes.invites || []);
            const tourData = tourRes.data?.requests || tourRes.requests || [];
            setTours(tourData);
        } catch (error) {
            console.error('Failed to load:', error);
        } finally {
            setLoading(false);
        }
    }

    const pendingInvites = invites.filter(i => i.status === 'PENDING');
    const respondedInvites = invites.filter(i => i.status !== 'PENDING');

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Guide Invitations</h2>
                <p className="text-sm text-gray-500">Track the status of guides you&apos;ve invited.</p>
            </div>

            {invites.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No invitations sent yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Find guides in the marketplace and invite them to your tours.</p>
                </div>
            ) : (
                <>
                    {/* Pending */}
                    {pendingInvites.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                Awaiting Response ({pendingInvites.length})
                            </h3>
                            <div className="space-y-3">
                                {pendingInvites.map(inv => (
                                    <div key={inv.id} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-semibold text-sm">
                                                {getGuideName(inv.guide.roleMetadata, inv.guide.name).charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {getGuideName(inv.guide.roleMetadata, inv.guide.name)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {inv.tour.title} · Expires {format(new Date(inv.expiresAt), 'MMM d, h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                                            Pending
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Responded */}
                    {respondedInvites.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                History
                            </h3>
                            <div className="space-y-2">
                                {respondedInvites.map(inv => (
                                    <div key={inv.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-sm">
                                                {getGuideName(inv.guide.roleMetadata, inv.guide.name).charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {getGuideName(inv.guide.roleMetadata, inv.guide.name)}
                                                </p>
                                                <p className="text-xs text-gray-500">{inv.tour.title}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[inv.status] || ''}`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <InviteModal
                    tours={tours}
                    guideId={showInviteModal.guideId}
                    guideName={showInviteModal.guideName}
                    onClose={() => setShowInviteModal(null)}
                    onSent={fetchData}
                />
            )}
        </div>
    );
}

// Export the InviteModal for use in other components
export { InviteModal };
