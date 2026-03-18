"use client";
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Voucher {
    id: string;
    code: string;
    plan: string;
    durationType: string;
    durationValue: number;
    expiresAt: string | null;
    maxRedemptions: number | null;
    currentRedemptions: number;
    status: string;
    createdAt: string;
    redemptions: { id: string; userId: string; redeemedAt: string }[];
}

export default function VoucherAdminPage() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Form state
    const [code, setCode] = useState('');
    const [plan, setPlan] = useState<'PRO' | 'PREMIUM'>('PRO');
    const [durationType, setDurationType] = useState<'DAYS' | 'USES'>('DAYS');
    const [durationValue, setDurationValue] = useState('30');
    const [expiresAt, setExpiresAt] = useState('');
    const [maxRedemptions, setMaxRedemptions] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchVouchers();
    }, []);

    async function fetchVouchers() {
        try {
            const res = await fetch('/api/admin/vouchers');
            const data = await res.json();
            setVouchers(data.vouchers || []);
        } catch (error) {
            console.error('Failed to fetch vouchers:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!code.trim()) {
            toast.error('Voucher code is required');
            return;
        }

        setCreating(true);
        try {
            const res = await fetch('/api/admin/vouchers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    plan,
                    durationType,
                    durationValue,
                    expiresAt: expiresAt || null,
                    maxRedemptions: maxRedemptions || null,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Voucher created successfully');
                setShowCreate(false);
                setCode('');
                setExpiresAt('');
                setMaxRedemptions('');
                fetchVouchers();
            } else {
                toast.error(data.error || 'Failed to create voucher');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setCreating(false);
        }
    }

    function generateCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'LV-';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCode(result);
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Voucher Management</h1>
                    <p className="text-sm text-gray-500">Create and manage promo codes</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 transition"
                >
                    + Create Voucher
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="text-2xl font-bold text-gray-900">{vouchers.length}</div>
                    <div className="text-sm text-gray-500">Total Vouchers</div>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
                    <div className="text-2xl font-bold text-green-700">
                        {vouchers.filter(v => v.status === 'ACTIVE').length}
                    </div>
                    <div className="text-sm text-green-600">Active</div>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
                    <div className="text-2xl font-bold text-blue-700">
                        {vouchers.reduce((acc, v) => acc + v.currentRedemptions, 0)}
                    </div>
                    <div className="text-sm text-blue-600">Total Redemptions</div>
                </div>
            </div>

            {/* Voucher List */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Redemptions</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {vouchers.map((voucher) => (
                            <tr key={voucher.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <span className="font-mono font-medium text-gray-900">{voucher.code}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${voucher.plan === 'PREMIUM' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {voucher.plan}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {voucher.durationValue} {voucher.durationType.toLowerCase()}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {voucher.currentRedemptions}
                                    {voucher.maxRedemptions && ` / ${voucher.maxRedemptions}`}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${voucher.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {voucher.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {new Date(voucher.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {vouchers.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                    No vouchers created yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Create Voucher</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Voucher Code *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="e.g., LV-LAUNCH2026"
                                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={generateCode}
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 transition"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan *</label>
                                    <select
                                        value={plan}
                                        onChange={(e) => setPlan(e.target.value as 'PRO' | 'PREMIUM')}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                    >
                                        <option value="PRO">PRO</option>
                                        <option value="PREMIUM">PREMIUM</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration Type *</label>
                                    <select
                                        value={durationType}
                                        onChange={(e) => setDurationType(e.target.value as 'DAYS' | 'USES')}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                    >
                                        <option value="DAYS">Days</option>
                                        <option value="USES">Uses</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration Value *
                                </label>
                                <input
                                    type="number"
                                    value={durationValue}
                                    onChange={(e) => setDurationValue(e.target.value)}
                                    placeholder="e.g., 30"
                                    min="1"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Expires At
                                    </label>
                                    <input
                                        type="date"
                                        value={expiresAt}
                                        onChange={(e) => setExpiresAt(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Redemptions
                                    </label>
                                    <input
                                        type="number"
                                        value={maxRedemptions}
                                        onChange={(e) => setMaxRedemptions(e.target.value)}
                                        placeholder="Unlimited"
                                        min="1"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                                >
                                    {creating ? 'Creating...' : 'Create Voucher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
