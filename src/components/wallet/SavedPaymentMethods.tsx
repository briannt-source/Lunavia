'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface PaymentMethod {
    id: string;
    type: string;
    accountName: string;
    accountNumber: string;
    bankName?: string;
    branchName?: string;
    isDefault: boolean;
    isVerified: boolean;
    verifiedAt?: string;
}

interface SavedPaymentMethodsProps {
    /** Called when the user selects a method to auto-fill withdrawal form */
    onSelectForWithdraw?: (method: { bankName: string; accountNumber: string; accountName: string }) => void;
    /** Compact mode shows fewer details */
    compact?: boolean;
}

export default function SavedPaymentMethods({ onSelectForWithdraw, compact }: SavedPaymentMethodsProps) {
    const t = useTranslations('Components.SavedPaymentMethods');
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        type: 'BANK',
        accountName: '',
        accountNumber: '',
        bankName: '',
        branchName: '',
        isDefault: false,
    });

    const fetchMethods = useCallback(async () => {
        try {
            const res = await fetch('/api/payment-methods');
            if (res.ok) {
                const data = await res.json();
                setMethods(Array.isArray(data) ? data : []);
            }
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMethods();
    }, [fetchMethods]);

    function resetForm() {
        setFormData({ type: 'BANK', accountName: '', accountNumber: '', bankName: '', branchName: '', isDefault: false });
        setEditingId(null);
        setShowForm(false);
    }

    function openEdit(method: PaymentMethod) {
        setEditingId(method.id);
        setFormData({
            type: method.type || 'BANK',
            accountName: method.accountName || '',
            accountNumber: method.accountNumber || '',
            bankName: method.bankName || '',
            branchName: method.branchName || '',
            isDefault: method.isDefault,
        });
        setShowForm(true);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingId ? `/api/payment-methods/${editingId}` : '/api/payment-methods';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success(editingId ? t('updated') : t('added'));
                resetForm();
                fetchMethods();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Error');
            }
        } catch {
            toast.error('Network error');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this payment method?')) return;
        try {
            const res = await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success(t('deleted'));
                fetchMethods();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Error');
            }
        } catch {
            toast.error('Network error');
        }
    }

    function handleUseForWithdraw(method: PaymentMethod) {
        onSelectForWithdraw?.({
            bankName: method.bankName || method.type,
            accountNumber: method.accountNumber,
            accountName: method.accountName,
        });
        toast.success(t('filledFromSaved'));
    }

    const typeLabels: Record<string, string> = {
        BANK: '🏦 Bank',
        MOMO: '📱 MoMo',
        ZALO: '💳 ZaloPay',
    };

    if (loading) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="animate-pulse space-y-3">
                    <div className="h-5 bg-gray-100 rounded w-48" />
                    <div className="h-16 bg-gray-50 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">{t('title')}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{t('subtitle')}</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#2E8BC0] bg-lunavia-light border border-[#5BA4CF]/30 rounded-lg hover:bg-lunavia-muted/50 transition"
                    >
                        + {t('addNew')}
                    </button>
                )}
            </div>

            <div className="p-5">
                {/* Add/Edit Form */}
                {showForm && (
                    <form onSubmit={handleSave} className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">{t('typeLabel')}</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="BANK">Bank</option>
                                    <option value="MOMO">MoMo</option>
                                    <option value="ZALO">ZaloPay</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">{t('accountHolder')} *</label>
                                <input
                                    type="text"
                                    value={formData.accountName}
                                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value.toUpperCase() })}
                                    placeholder="NGUYEN VAN A"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    {formData.type === 'BANK' ? t('accountNumber') : t('phoneNumber')} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    placeholder={formData.type === 'BANK' ? '0123456789' : '0909xxx'}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            {formData.type === 'BANK' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('bankName')} *</label>
                                    <input
                                        type="text"
                                        value={formData.bankName}
                                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                        placeholder="Vietcombank, Techcombank..."
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="pm-default"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="rounded border-gray-300"
                            />
                            <label htmlFor="pm-default" className="text-xs text-gray-600 cursor-pointer">{t('setDefault')}</label>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 rounded-lg bg-lunavia-primary px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                            >
                                {submitting ? t('saving') : editingId ? t('update') : t('add')}
                            </button>
                        </div>
                    </form>
                )}

                {/* Methods List */}
                {methods.length === 0 ? (
                    <div className="text-center py-6">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-gray-300">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        </div>
                        <p className="text-sm text-gray-500">{t('noMethods')}</p>
                        <p className="text-xs text-gray-400 mt-1">{t('noMethodsHint')}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {methods.map((m) => (
                            <div key={m.id} className={`rounded-lg border p-3 flex items-center justify-between ${m.isDefault ? 'border-[#5BA4CF]/30 bg-lunavia-light/40' : 'border-gray-200 bg-white'}`}>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-gray-700">{typeLabels[m.type] || m.type}</span>
                                        {m.isDefault && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-lunavia-muted/50 text-[#2E8BC0] rounded">{t('default')}</span>
                                        )}
                                        {m.isVerified && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded">✓ {t('verified')}</span>
                                        )}
                                    </div>
                                    <div className={`text-sm text-gray-600 ${compact ? '' : 'grid grid-cols-2 gap-x-4'}`}>
                                        <span><span className="text-gray-400 text-xs">{t('holderShort')}:</span> {m.accountName}</span>
                                        <span className="font-mono"><span className="text-gray-400 text-xs">{t('acctShort')}:</span> {m.accountNumber}</span>
                                        {m.bankName && !compact && (
                                            <span className="col-span-2 text-xs text-gray-400 mt-0.5">{m.bankName}{m.branchName ? ` - ${m.branchName}` : ''}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 ml-3 shrink-0">
                                    {onSelectForWithdraw && (
                                        <button
                                            onClick={() => handleUseForWithdraw(m)}
                                            className="px-2.5 py-1.5 text-[11px] font-medium text-[#2E8BC0] bg-lunavia-light border border-[#5BA4CF]/30 rounded-lg hover:bg-lunavia-muted/50 transition"
                                            title="Use for withdrawal"
                                        >
                                            {t('use')}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => openEdit(m)}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                        title="Edit"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(m.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Delete"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
