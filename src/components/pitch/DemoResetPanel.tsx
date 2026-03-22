'use client';

import { useState } from 'react';
import { isPitchMode, DEMO_IDS } from '@/lib/pitch-mode';

/**
 * Demo Reset Panel
 * 
 * Admin panel to reset demo data during pitches.
 * Super Admin only.
 */
export default function DemoResetPanel() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleReset = async (action: string) => {
        if (!confirm(`Reset ${action} demo data? This cannot be undone.`)) {
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/demo-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(`✅ ${data.message}`);
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (err) {
            setMessage('❌ Failed to reset demo data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Demo Reset Tools</h2>
            <p className="mb-4 text-sm text-gray-600">
                Reset demo data before or after a pitch. Only affects demo users and tours.
            </p>

            {message && (
                <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm">
                    {message}
                </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ResetButton
                    label="Reset Tours"
                    icon="📋"
                    onClick={() => handleReset('tours')}
                    loading={loading}
                />
                <ResetButton
                    label="Reset Payments"
                    icon="💳"
                    onClick={() => handleReset('payments')}
                    loading={loading}
                />
                <ResetButton
                    label="Reset Trust"
                    icon="🛡️"
                    onClick={() => handleReset('trust')}
                    loading={loading}
                />
                <ResetButton
                    label="Reset All"
                    icon="🔄"
                    onClick={() => handleReset('all')}
                    loading={loading}
                    variant="danger"
                />
            </div>

            <div className="mt-6 rounded-lg bg-lunavia-light p-4 text-sm text-blue-800">
                <strong>Demo Credentials:</strong>
                <div className="mt-2 space-y-1 font-mono text-xs">
                    <div>Operator: demo-operator@lunavia.vn</div>
                    <div>Guide: demo-guide@lunavia.vn</div>
                    <div>Intern: demo-intern@lunavia.vn</div>
                    <div className="text-lunavia-primary">Password: DemoPass123!</div>
                </div>
            </div>
        </div>
    );
}

function ResetButton({ label, icon, onClick, loading, variant = 'default' }: {
    label: string;
    icon: string;
    onClick: () => void;
    loading: boolean;
    variant?: 'default' | 'danger';
}) {
    const baseClasses = 'flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50';
    const variantClasses = variant === 'danger'
        ? 'bg-red-100 text-red-700 hover:bg-red-200'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200';

    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`${baseClasses} ${variantClasses}`}
        >
            <span>{icon}</span>
            {label}
        </button>
    );
}
