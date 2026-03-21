"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function BankConfigPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const emptyBank = { bankName: '', accountNumber: '', accountName: '', branch: '' };
    const [config, setConfig] = useState({
        escrow: { ...emptyBank },
        revenue: { ...emptyBank }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [original, setOriginal] = useState(config);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            if (!['SUPER_ADMIN', 'OPS'].includes(session?.user?.role)) {
                router.push('/dashboard');
            } else {
                fetchConfig();
            }
        }
    }, [status, session, router]);

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/admin/system-config');
            if (res.ok) {
                const data = await res.json();
                setConfig(data);
                setOriginal(data);
            }
        } catch (error) {
            console.error('Failed to fetch config', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (type: 'escrow' | 'revenue', e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig({
            ...config,
            [type]: { ...config[type], [e.target.name]: e.target.value }
        });
    };

    const handleCancel = () => {
        setConfig(original);
        setEditing(false);
        setMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/system-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (res.ok) {
                setOriginal(config);
                setEditing(false);
                setMessage({ type: 'success', text: 'Bank details updated successfully.' });
            } else {
                setMessage({ type: 'error', text: 'Failed to update bank details.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading configuration...</div>;

    const inputBase = "w-full rounded-xl border bg-white px-4 py-3 text-gray-900 transition-all outline-none";
    const inputEditing = `${inputBase} border-gray-200 focus:border-lunavia-primary focus:ring-2 focus:ring-lunavia-primary/20`;
    const inputReadonly = `${inputBase} border-gray-100 bg-gray-50 text-gray-700 cursor-default`;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">Bank Account Configuration</h1>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 text-sm font-semibold text-lunavia-primary border border-lunavia-primary/20 rounded-xl hover:bg-lunavia-primary-light transition-colors"
                    >
                        ✏️ Edit
                    </button>
                )}
            </div>
            <p className="text-gray-500 text-sm mb-8">Manage the bank account details displayed to Operators for wallet top-ups.</p>

            {message && (
                <div className={`p-4 mb-6 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                
                {/* ── REVENUE SETTINGS (Subscriptions) ── */}
                <div className="space-y-5">
                    <div className="pb-2 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Revenue Account</h2>
                        <p className="text-xs text-gray-500">For collecting plan upgrades and subscriptions.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Name</label>
                            <input type="text" name="bankName" value={config.revenue.bankName} onChange={(e) => handleChange('revenue', e)} readOnly={!editing} className={editing ? inputEditing : inputReadonly} placeholder="e.g. Vietcombank" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Number</label>
                            <input type="text" name="accountNumber" value={config.revenue.accountNumber} onChange={(e) => handleChange('revenue', e)} readOnly={!editing} className={editing ? inputEditing : inputReadonly} placeholder="e.g. 1029384756" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Name</label>
                            <input type="text" name="accountName" value={config.revenue.accountName} onChange={(e) => handleChange('revenue', e)} readOnly={!editing} className={editing ? inputEditing : inputReadonly} placeholder="e.g. Lunavia JSC" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch (Optional)</label>
                            <input type="text" name="branch" value={config.revenue.branch || ''} onChange={(e) => handleChange('revenue', e)} readOnly={!editing} className={editing ? inputEditing : inputReadonly} placeholder="e.g. HCM City" />
                        </div>
                    </div>
                </div>

                {/* ── ESCROW SETTINGS (Top-ups) ── */}
                <div className="space-y-5 pt-4 border-t border-gray-100">
                    <div className="pb-2 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Escrow Account</h2>
                        <p className="text-xs text-gray-500">For managing operator top-ups and escrow holding.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Name</label>
                            <input type="text" name="bankName" value={config.escrow.bankName} onChange={(e) => handleChange('escrow', e)} readOnly={!editing} className={editing ? inputEditing : inputReadonly} placeholder="e.g. MB Bank" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Number</label>
                            <input type="text" name="accountNumber" value={config.escrow.accountNumber} onChange={(e) => handleChange('escrow', e)} readOnly={!editing} className={editing ? inputEditing : inputReadonly} placeholder="e.g. 4201998579" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Name</label>
                            <input type="text" name="accountName" value={config.escrow.accountName} onChange={(e) => handleChange('escrow', e)} readOnly={!editing} className={editing ? inputEditing : inputReadonly} placeholder="e.g. Lunavia Escrow" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch (Optional)</label>
                            <input type="text" name="branch" value={config.escrow.branch || ''} onChange={(e) => handleChange('escrow', e)} readOnly={!editing} className={editing ? inputEditing : inputReadonly} />
                        </div>
                    </div>
                </div>

                {editing && (
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button type="button" onClick={handleCancel} className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black disabled:opacity-50 transition shadow-sm">
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
