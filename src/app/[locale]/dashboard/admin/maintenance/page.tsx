"use client";
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function MaintenanceAdminPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [enabled, setEnabled] = useState(false);
    const [message, setMessage] = useState('');
    const [endTime, setEndTime] = useState('');
    const [type, setType] = useState<'SOFT' | 'HARD'>('SOFT');

    useEffect(() => {
        fetchStatus();
    }, []);

    async function fetchStatus() {
        try {
            const res = await fetch('/api/admin/maintenance');
            const data = await res.json();
            setEnabled(data.maintenanceMode);
            setMessage(data.message || '');
            setEndTime(data.endTime || '');
            setType(data.type || 'SOFT');
        } catch (error) {
            console.error('Failed to fetch maintenance status:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled, message, endTime, type }),
            });

            if (res.ok) {
                toast.success(enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
            } else {
                toast.error('Failed to update maintenance mode');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded"></div>
                    <div className="h-24 bg-gray-100 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Maintenance Mode</h1>
                <p className="text-sm text-gray-500">Control system availability during deployments</p>
            </div>

            {/* Current Status */}
            <div className={`rounded-xl border p-6 ${enabled ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className={`font-semibold ${enabled ? 'text-red-900' : 'text-green-900'}`}>
                            System is {enabled ? 'in Maintenance' : 'Online'}
                        </h3>
                        <p className={`text-sm ${enabled ? 'text-red-700' : 'text-green-700'}`}>
                            {enabled ? 'Users see the maintenance page' : 'All features are available'}
                        </p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${enabled ? 'bg-red-100' : 'bg-green-100'}`}>
                        <span className="text-2xl">{enabled ? '🔴' : '🟢'}</span>
                    </div>
                </div>
            </div>

            {/* Settings */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="font-medium text-gray-900">Enable Maintenance Mode</label>
                        <p className="text-sm text-gray-500">Users will see the maintenance page</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setEnabled(!enabled)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${enabled ? 'bg-red-600' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maintenance Type
                    </label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as 'SOFT' | 'HARD')}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    >
                        <option value="SOFT">🟡 Soft Lock — Read-only dashboards</option>
                        <option value="HARD">🔴 Hard Lock — All actions disabled</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message to Users
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="We are performing scheduled maintenance..."
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected End Time
                    </label>
                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Version Info */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">System Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">App Version</span>
                        <p className="font-mono font-medium text-gray-900">{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Environment</span>
                        <p className="font-mono font-medium text-gray-900">{process.env.NODE_ENV}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
