'use client';

import { useState, useEffect } from 'react';

export default function NotificationToggle() {
    const [muted, setMuted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/notifications/mute').then(r => r.json()).then(d => setMuted(d.muted)).catch(() => {});
    }, []);

    const toggle = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications/mute', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ muted: !muted }),
            });
            const data = await res.json();
            if (res.ok) setMuted(data.muted);
        } catch { /* ignore */ }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900">Mute All Notifications</p>
                    <p className="text-xs text-gray-500 mt-0.5">No new notifications will be created for your account.</p>
                </div>
                <button
                    onClick={toggle}
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${muted ? 'bg-red-500' : 'bg-gray-200'} ${loading ? 'opacity-50' : ''}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${muted ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
            {muted && (
                <div className="mt-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
                    ⚠️ All notifications are muted.
                </div>
            )}
        </div>
    );
}
