'use client';

import { useState } from 'react';

interface StaffActionsProps {
    userId: string;
    email: string;
    role: string;
}

export default function StaffActions({ userId, email, role }: StaffActionsProps) {
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showPassInput, setShowPassInput] = useState(false);
    const [tempPass, setTempPass] = useState('');

    async function handleResend() {
        if (!tempPass || tempPass.length < 8) {
            setResult({ type: 'error', message: 'Password must be at least 8 characters' });
            return;
        }

        setSending(true);
        setResult(null);

        try {
            const res = await fetch('/api/admin/staff/resend-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, tempPass }),
            });
            const data = await res.json();

            if (res.ok) {
                setResult({ type: 'success', message: '✅ Invite email sent!' });
                setShowPassInput(false);
                setTempPass('');
            } else {
                setResult({ type: 'error', message: data.error || 'Failed to send' });
            }
        } catch {
            setResult({ type: 'error', message: 'Network error' });
        } finally {
            setSending(false);
        }
    }

    if (role === 'SUPER_ADMIN') {
        return <span className="text-gray-300 text-xs">System</span>;
    }

    return (
        <div className="text-right space-y-2">
            {!showPassInput ? (
                <button
                    onClick={() => setShowPassInput(true)}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                    Resend Invite
                </button>
            ) : (
                <div className="flex items-center gap-2 justify-end">
                    <input
                        type="text"
                        value={tempPass}
                        onChange={(e) => setTempPass(e.target.value)}
                        placeholder="Temp password"
                        className="w-32 text-xs border border-gray-300 rounded px-2 py-1 font-mono"
                    />
                    <button
                        onClick={handleResend}
                        disabled={sending}
                        className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {sending ? '...' : 'Send'}
                    </button>
                    <button
                        onClick={() => { setShowPassInput(false); setResult(null); }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>
            )}
            {result && (
                <div className={`text-xs ${result.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {result.message}
                </div>
            )}
        </div>
    );
}
