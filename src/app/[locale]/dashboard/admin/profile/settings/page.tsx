"use client";

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/navigation';

export default function AdminSettingsPage() {
    const { data: session, update } = useSession();
    const user = session?.user as any;
    const fileRef = useRef<HTMLInputElement>(null);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [displayName, setDisplayName] = useState(user?.name || '');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.image || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setDisplayName(user?.name || '');
        setAvatarPreview(user?.image || null);
        setAvatarFile(null);
        setMessage(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            // Save display name via existing profile API
            const res = await fetch('/api/settings/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: displayName }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Settings updated successfully.' });
                setEditing(false);
                // Refresh session to pick up new name
                await update();
            } else {
                const data = await res.json().catch(() => ({}));
                setMessage({ type: 'error', text: data.error || 'Failed to update settings.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'An error occurred while saving.' });
        } finally {
            setSaving(false);
        }
    };

    const initials = (user?.name?.[0] || user?.email?.[0] || '?').toUpperCase();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link href="/dashboard/admin/profile" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
                ← Back to Profile
            </Link>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Settings & Preferences</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your display name, avatar, and theme.</p>
                </div>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 text-sm font-semibold text-lunavia-primary border border-lunavia-primary/20 rounded-xl hover:bg-lunavia-primary-light transition-colors"
                    >
                        ✏️ Edit
                    </button>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* Avatar Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Avatar</h2>
                <div className="flex items-center gap-5">
                    <div className="relative group">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="h-20 w-20 rounded-2xl object-cover border-2 border-gray-100" />
                        ) : (
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-lunavia-primary to-lunavia-accent flex items-center justify-center text-2xl font-bold text-white border-2 border-lunavia-primary/20">
                                {initials}
                            </div>
                        )}
                        {editing && (
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <span className="text-white text-xs font-bold">Change</span>
                            </button>
                        )}
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{user?.name || user?.email || 'Admin'}</p>
                        <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                        {editing && (
                            <p className="text-xs text-gray-400 mt-2">Click the avatar to upload a new photo.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Display Name */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Display Name</h2>
                <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    readOnly={!editing}
                    className={`w-full rounded-xl border px-4 py-3 text-gray-900 transition-all outline-none ${
                        editing
                            ? 'border-gray-200 bg-white focus:border-lunavia-primary focus:ring-2 focus:ring-lunavia-primary/20'
                            : 'border-gray-100 bg-gray-50 cursor-default'
                    }`}
                    placeholder="Your display name"
                />
            </div>

            {/* Theme */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Appearance</h2>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        disabled={!editing}
                        onClick={() => setTheme('light')}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                            theme === 'light'
                                ? 'border-lunavia-primary bg-lunavia-primary-light'
                                : editing ? 'border-gray-100 hover:border-gray-200' : 'border-gray-100 opacity-60 cursor-default'
                        }`}
                    >
                        <div className="text-2xl mb-2">☀️</div>
                        <div className="text-sm font-semibold text-gray-900">Light</div>
                    </button>
                    <button
                        type="button"
                        disabled={!editing}
                        onClick={() => setTheme('dark')}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                            theme === 'dark'
                                ? 'border-lunavia-primary bg-lunavia-primary-light'
                                : editing ? 'border-gray-100 hover:border-gray-200' : 'border-gray-100 opacity-60 cursor-default'
                        }`}
                    >
                        <div className="text-2xl mb-2">🌙</div>
                        <div className="text-sm font-semibold text-gray-900">Dark</div>
                        <div className="text-[10px] text-gray-400 mt-1">Coming Soon</div>
                    </button>
                </div>
            </div>

            {/* Save/Cancel */}
            {editing && (
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button onClick={handleCancel} className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black disabled:opacity-50 transition shadow-sm flex items-center gap-2">
                        {saving && <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            )}
        </div>
    );
}
