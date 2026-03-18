'use client';

import { useState } from 'react';

interface SecuritySectionProps {
    emailVerified: boolean | null;
}

export function SecuritySection({ emailVerified }: SecuritySectionProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const passwordsMatch = newPassword === confirmPassword;
    const passwordValid = newPassword.length >= 8;

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        if (!passwordValid || !passwordsMatch) return;

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/auth/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to change password' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Security</h2>

            {/* Email Verified Status */}
            <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-gray-700">Email Verification</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            {emailVerified ? 'Your email has been verified' : 'Email not yet verified'}
                        </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${emailVerified
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                        {emailVerified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                </div>
            </div>

            {/* Change Password */}
            <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Change Password</h3>

                {message && (
                    <div className={`mb-4 p-3 text-sm rounded-lg border ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 transition ${newPassword && !passwordValid
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                                }`}
                        />
                        {newPassword && !passwordValid && (
                            <p className="mt-1 text-xs text-red-600">Must be at least 8 characters</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 transition ${confirmPassword && !passwordsMatch
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                                }`}
                        />
                        {confirmPassword && !passwordsMatch && (
                            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !passwordValid || !passwordsMatch || !currentPassword}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                        {loading ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>

            {/* Placeholder sections */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-gray-700">Active Sessions</div>
                        <div className="text-xs text-gray-500 mt-0.5">Manage your active login sessions</div>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Coming Soon</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-gray-700">Two-Factor Authentication</div>
                        <div className="text-xs text-gray-500 mt-0.5">Add an extra layer of security to your account</div>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Coming Soon</span>
                </div>
            </div>
        </div>
    );
}
