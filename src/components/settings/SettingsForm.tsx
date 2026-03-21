'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/navigation';

interface Props {
    user: any;
    trustScore: number;
    kybStatus: string;
    kycStatus: string;
    paymentInfo: any;
}

export default function SettingsForm({ user, trustScore, kybStatus, kycStatus }: Props) {
    // Notification mute
    const [muted, setMuted] = useState(false);
    const [muteLoading, setMuteLoading] = useState(false);

    const isOperator = user.role === 'TOUR_OPERATOR';
    const isGuide = user.role === 'TOUR_GUIDE';

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

            {/* Payment Methods Link */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💳</span>
                    <h3 className="font-semibold text-gray-900">Payment Methods</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    Manage your bank accounts, MoMo, ZaloPay, and other payout methods.
                </p>
                <Link
                    href="/dashboard/payment-methods"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition border border-indigo-200"
                >
                    Manage Payment Methods →
                </Link>
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
