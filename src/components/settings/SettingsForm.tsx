'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
    user: any;
    trustScore: number;
    kybStatus: string;
    kycStatus: string;
    paymentInfo: any;
}

export default function SettingsForm({ user, trustScore, kybStatus, kycStatus, paymentInfo }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Notification mute
    const [muted, setMuted] = useState(false);
    const [muteLoading, setMuteLoading] = useState(false);

    useEffect(() => {
        fetch('/api/notifications/mute').then(r => r.json()).then(d => setMuted(d.muted)).catch(() => {});
    }, []);

    const toggleMute = async () => {
        setMuteLoading(true);
        try {
            const res = await fetch('/api/notifications/mute', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ muted: !muted }),
            });
            const data = await res.json();
            if (res.ok) setMuted(data.muted);
        } catch { /* ignore */ }
        setMuteLoading(false);
    };

    const [bankDetails, setBankDetails] = useState(paymentInfo || {
        bankName: '',
        accountNumber: '',
        accountName: '',
        notes: ''
    });

    // Keep a snapshot so we can cancel edits
    const [bankSnapshot, setBankSnapshot] = useState(bankDetails);

    const isOperator = user.role === 'TOUR_OPERATOR';
    const isGuide = user.role === 'TOUR_GUIDE';

    const handleEdit = () => {
        setBankSnapshot({ ...bankDetails });
        setEditing(true);
        setMessage(null);
    };

    const handleCancel = () => {
        setBankDetails({ ...bankSnapshot });
        setEditing(false);
        setMessage(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/settings/payment-info', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bankDetails),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Payment details updated successfully' });
                setBankSnapshot({ ...bankDetails });
                setEditing(false);
                router.refresh();
            } else {
                setMessage({ type: 'error', text: 'Failed to update settings' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const hasBankData = bankDetails.bankName || bankDetails.accountNumber || bankDetails.accountName;

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-sm text-gray-500">Manage your account preferences and payment details.</p>
            </div>

            {/* Identity & Trust */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Identity Verification</h3>
                    <div className="space-y-3">
                        {/* Operators: show KYB only. Guides: show KYC only. Others: show both. */}
                        {!isOperator && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">KYC Status</span>
                                <span className={`font-medium ${kycStatus === 'APPROVED' ? 'text-green-600' : 'text-amber-600'}`}>{kycStatus}</span>
                            </div>
                        )}
                        {!isGuide && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">KYB Status</span>
                                <span className={`font-medium ${kybStatus === 'APPROVED' ? 'text-green-600' : 'text-amber-600'}`}>{kybStatus}</span>
                            </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Trust Score</span>
                                <span className="text-2xl font-bold text-indigo-600">{trustScore}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Based on successful tour completions and verification.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Account Info</h3>
                    <div className="space-y-3 text-sm">
                        <div>
                            <label className="block text-gray-500">Email</label>
                            <div className="font-medium text-gray-900">{user.email}</div>
                        </div>
                        <div>
                            <label className="block text-gray-500">User ID</label>
                            <div className="font-mono text-xs text-gray-600 bg-gray-50 p-1 rounded inline-block">{user.id}</div>
                        </div>
                        <div>
                            <label className="block text-gray-500">Role</label>
                            <div className="font-medium text-gray-900">{user.role}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Payout Details</h3>
                    {!editing && (
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition border border-indigo-200"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                        </button>
                    )}
                </div>
                <p className="text-sm text-gray-500 mb-6">
                    Bank account where you wish to receive payouts (withdrawals, earnings).
                </p>

                {message && (
                    <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                {editing ? (
                    /* ── Edit Mode ── */
                    <form onSubmit={handleSave} className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                            <input
                                type="text"
                                value={bankDetails.bankName}
                                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                                placeholder="e.g. Kasikorn Bank"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                            <input
                                type="text"
                                value={bankDetails.accountNumber}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                                placeholder="000-0-00000-0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                            <input
                                type="text"
                                value={bankDetails.accountName}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value.toUpperCase() })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                                placeholder="ACCOUNT HOLDER NAME"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                            <textarea
                                value={bankDetails.notes || ''}
                                onChange={(e) => setBankDetails({ ...bankDetails, notes: e.target.value })}
                                rows={2}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                                placeholder="Branch info, etc."
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={loading}
                                className="px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    /* ── Read-Only Mode ── */
                    <div className="max-w-lg">
                        {hasBankData ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Bank Name</span>
                                    <span className="text-sm font-medium text-gray-900">{bankDetails.bankName || '—'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Account Number</span>
                                    <span className="text-sm font-medium text-gray-900 font-mono">{bankDetails.accountNumber || '—'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Account Name</span>
                                    <span className="text-sm font-medium text-gray-900">{bankDetails.accountName || '—'}</span>
                                </div>
                                {bankDetails.notes && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Notes</span>
                                        <span className="text-sm text-gray-600">{bankDetails.notes}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-xl bg-gray-50 border border-gray-100 p-6 text-center">
                                <div className="text-2xl mb-2">🏦</div>
                                <p className="text-sm text-gray-500 mb-3">No bank details configured yet.</p>
                                <button
                                    type="button"
                                    onClick={handleEdit}
                                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
                                >
                                    Add payout details →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* ── Notification Preferences ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Mute All Notifications</p>
                        <p className="text-xs text-gray-500 mt-0.5">When enabled, no new notifications will be created for your account.</p>
                    </div>
                    <button
                        onClick={toggleMute}
                        disabled={muteLoading}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${muted ? 'bg-red-500' : 'bg-gray-200'} ${muteLoading ? 'opacity-50' : ''}`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${muted ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                {muted && (
                    <div className="mt-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
                        ⚠️ All notifications are muted. You will not receive any alerts.
                    </div>
                )}
            </div>
        </div>
    );
}
