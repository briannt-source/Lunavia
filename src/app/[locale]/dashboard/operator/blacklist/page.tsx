'use client';

import { useEffect, useState, useCallback } from 'react';

interface BlacklistEntry {
    id: string;
    reason: string;
    createdAt: string;
    guide: {
        id: string;
        name: string | null;
        email: string;
        avatarUrl: string | null;
        trustScore: number;
        reliabilityScore: number;
    };
}

export default function BlacklistPage() {
    const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [guideId, setGuideId] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [removing, setRemoving] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchBlacklist = useCallback(async () => {
        setLoading(true);
        const res = await fetch('/api/operator/blacklist');
        if (res.ok) {
            const data = await res.json();
            setBlacklist(data.blacklist || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchBlacklist(); }, [fetchBlacklist]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);
        const res = await fetch('/api/operator/blacklist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guideId, reason }),
        });
        const data = await res.json();
        if (res.ok) {
            setShowForm(false);
            setGuideId('');
            setReason('');
            setMessage({ type: 'success', text: 'Guide blacklisted successfully' });
            fetchBlacklist();
        } else {
            setMessage({ type: 'error', text: data.error || 'Failed to blacklist' });
        }
        setSubmitting(false);
    };

    const handleRemove = async (id: string) => {
        if (!confirm('Remove this guide from your blacklist?')) return;
        setRemoving(id);
        const res = await fetch(`/api/operator/blacklist/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setMessage({ type: 'success', text: 'Guide removed from blacklist' });
            fetchBlacklist();
        }
        setRemoving(null);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Guide Blacklist</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage guides blocked from applying to your tours.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition shadow-sm"
                >
                    + Blacklist Guide
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm font-medium border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* Add Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Blacklist a Guide</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Guide ID or Email</label>
                            <input
                                type="text"
                                value={guideId}
                                onChange={e => setGuideId(e.target.value)}
                                placeholder="Guide user ID"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Why are you blacklisting this guide?"
                                rows={2}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={submitting} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black disabled:opacity-50 transition">
                                {submitting ? 'Adding...' : 'Add to Blacklist'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Blacklist Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-3 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : blacklist.length === 0 ? (
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-12 text-center">
                    <div className="text-3xl mb-3">🛡️</div>
                    <p className="text-gray-500 text-sm">No guides blacklisted.</p>
                    <p className="text-gray-400 text-xs mt-1">Blacklisted guides cannot apply to your tours.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Guide</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Trust</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Reason</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blacklist.map(entry => (
                                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                {(entry.guide.name || entry.guide.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{entry.guide.name || 'Unnamed'}</div>
                                                <div className="text-xs text-gray-400">{entry.guide.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="font-semibold text-indigo-600">{entry.guide.trustScore}</span>
                                        <span className="text-gray-400 text-xs ml-1">/ {entry.guide.reliabilityScore}%</span>
                                    </td>
                                    <td className="px-5 py-4 text-gray-600 max-w-xs truncate">{entry.reason}</td>
                                    <td className="px-5 py-4 text-gray-400 text-xs">{new Date(entry.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            onClick={() => handleRemove(entry.id)}
                                            disabled={removing === entry.id}
                                            className="text-xs text-red-600 font-medium hover:text-red-700 disabled:opacity-50 transition"
                                        >
                                            {removing === entry.id ? 'Removing...' : 'Remove'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
