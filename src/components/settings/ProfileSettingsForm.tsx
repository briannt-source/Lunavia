'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ProfileSettingsForm() {
    const { data: session, update } = useSession();
    const user = session?.user as any;

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Profile fields
    const [displayName, setDisplayName] = useState('');
    const [phone, setPhone] = useState('');

    // Password fields
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await fetch('/api/settings/profile');
                if (res.ok) {
                    const data = await res.json();
                    setDisplayName(data?.profile?.name || data?.name || user?.name || '');
                    setPhone(data?.profile?.phone || '');
                }
            } catch { /* silent */ }
        }
        loadProfile();
    }, [user?.name]);

    const handleSaveProfile = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/settings/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: displayName, phone }),
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully.' });
                setEditing(false);
                await update();
            } else {
                const data = await res.json().catch(() => ({}));
                setMessage({ type: 'error', text: data.error || 'Failed to update.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'An error occurred.' });
        } finally { setSaving(false); }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
            return;
        }
        setSavingPassword(true);
        setMessage(null);
        try {
            const res = await fetch('/api/settings/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully.' });
                setShowPasswordForm(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const data = await res.json().catch(() => ({}));
                setMessage({ type: 'error', text: data.error || 'Failed to change password.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'An error occurred.' });
        } finally { setSavingPassword(false); }
    };

    return (
        <div className="space-y-5">
            {/* Status message */}
            {message && (
                <div className={`p-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* ── Edit Profile */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-lg">✏️</span> Edit Profile
                    </h3>
                    {!editing ? (
                        <button
                            onClick={() => { setEditing(true); setMessage(null); }}
                            className="px-3 py-1.5 text-xs font-semibold text-lunavia-primary border border-lunavia-primary/20 rounded-lg hover:bg-lunavia-light transition"
                        >
                            Edit
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setEditing(false); setMessage(null); }}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-black disabled:opacity-50 transition flex items-center gap-1"
                            >
                                {saving && <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-500 text-xs mb-1">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            readOnly={!editing}
                            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition ${
                                editing
                                    ? 'border-gray-200 bg-white focus:border-lunavia-primary focus:ring-2 focus:ring-lunavia-primary/20'
                                    : 'border-gray-100 bg-gray-50 cursor-default'
                            }`}
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-500 text-xs mb-1">Phone</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            readOnly={!editing}
                            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition ${
                                editing
                                    ? 'border-gray-200 bg-white focus:border-lunavia-primary focus:ring-2 focus:ring-lunavia-primary/20'
                                    : 'border-gray-100 bg-gray-50 cursor-default'
                            }`}
                            placeholder="Phone number"
                        />
                    </div>
                </div>
            </div>

            {/* ── Change Password */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-lg">🔒</span> Password
                    </h3>
                    {!showPasswordForm && (
                        <button
                            onClick={() => { setShowPasswordForm(true); setMessage(null); }}
                            className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                            Change Password
                        </button>
                    )}
                </div>

                {!showPasswordForm ? (
                    <p className="text-sm text-gray-500">Last changed: Unknown</p>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-gray-500 text-xs mb-1">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-lunavia-primary focus:ring-2 focus:ring-lunavia-primary/20"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-500 text-xs mb-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-lunavia-primary focus:ring-2 focus:ring-lunavia-primary/20"
                                placeholder="Min. 8 characters"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-500 text-xs mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-lunavia-primary focus:ring-2 focus:ring-lunavia-primary/20"
                                placeholder="Re-enter new password"
                            />
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setMessage(null); }}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-black disabled:opacity-50 transition flex items-center gap-1"
                            >
                                {savingPassword && <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {savingPassword ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
