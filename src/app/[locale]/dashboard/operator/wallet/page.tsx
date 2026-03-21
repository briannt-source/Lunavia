'use client';

import DocumentUpload from '@/components/DocumentUpload';
import { useEffect, useState } from 'react';
import { Link } from '@/navigation';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import SavedPaymentMethods from '@/components/wallet/SavedPaymentMethods';

interface WalletData {
    id: string;
    availableBalance: number;
    pendingBalance: number;
    totalDeposited: number;
    currency: string;
    activeHolds: number;
}

interface Transaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    description?: string; // Made optional
    createdAt: string;
    relatedTourId?: string | null; // Made optional
    isTopUpRequest?: boolean; // Added
}

interface UploadedFile {
    id: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
}

export default function OperatorWalletPage() {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const t = useTranslations('Operator.Wallet');

    // Top-up form
    const [showTopUp, setShowTopUp] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [topUpNotes, setTopUpNotes] = useState('');
    const [topUpDocs, setTopUpDocs] = useState<UploadedFile[]>([]);

    // Withdraw form
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawBankName, setWithdrawBankName] = useState('');
    const [withdrawAccountNumber, setWithdrawAccountNumber] = useState('');
    const [withdrawAccountName, setWithdrawAccountName] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [exporting, setExporting] = useState(false);

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const res = await fetch('/api/export/earnings?format=csv');
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lunavia-tours-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success(t('export.success'));
        } catch {
            toast.error(t('export.failed'));
        } finally {
            setExporting(false);
        }
    };



    const [bankConfig, setBankConfig] = useState<{
        bankName: string;
        accountNumber: string;
        accountName: string;
        branch: string;
    } | null>(null);
    const [bankLoading, setBankLoading] = useState(true);

    useEffect(() => {
        fetchWallet();
        fetchBankConfig();
    }, []);

    async function fetchBankConfig() {
        try {
            const res = await fetch('/api/bank-info');
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data) {
                    setBankConfig(data.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch bank config', error);
        } finally {
            setBankLoading(false);
        }
    }

    async function fetchWallet() {
        try {
            const res = await fetch('/api/operator/wallet');
            const data = await res.json();
            if (data.wallet) {
                setWallet(data.wallet);
                setTransactions(data.transactions || []);
            }
        } catch { /* handled by null check */ }
        finally { setLoading(false); }
    }

    async function handleTopUp(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        const amount = parseInt(topUpAmount.replace(/\D/g, ''), 10);
        if (!amount || amount < 100000) {
            setMessage({ type: 'error', text: t('alerts.minTopUp') });
            setSubmitting(false);
            return;
        }

        if (topUpDocs.length === 0) {
            setMessage({ type: 'error', text: t('alerts.uploadProof') });
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch('/api/operator/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    notes: topUpNotes,
                    proofUrl: `/api/uploads/proofs/${topUpDocs[0].filename}` // Secure serving path
                }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(t('alerts.topUpSuccess'));
                setMessage({ type: 'success', text: t('alerts.topUpMessage') });
                setTopUpAmount('');
                setTopUpNotes('');
                setTopUpDocs([]);
                setShowTopUp(false);
                fetchWallet(); // Refresh
            } else {
                setMessage({ type: 'error', text: data.error || t('alerts.topUpFailed') });
            }
        } catch {
            setMessage({ type: 'error', text: t('alerts.networkError') });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleWithdraw(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        const amount = parseInt(withdrawAmount.replace(/\D/g, ''), 10);
        const available = wallet?.availableBalance ?? 0;

        if (!amount || amount <= 0) {
            setMessage({ type: 'error', text: t('alerts.invalidAmount') });
            setSubmitting(false);
            return;
        }

        if (amount > available) {
            setMessage({ type: 'error', text: t('alerts.insufficientBalance') });
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch('/api/operator/wallet/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    bankName: withdrawBankName,
                    accountNumber: withdrawAccountNumber,
                    accountName: withdrawAccountName
                }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(t('alerts.withdrawSuccess'));
                setMessage({ type: 'success', text: t('alerts.withdrawMessage') });
                setWithdrawAmount('');
                setWithdrawBankName('');
                setWithdrawAccountNumber('');
                setWithdrawAccountName('');
                setShowWithdraw(false);
                fetchWallet();
            } else {
                setMessage({ type: 'error', text: data.error || t('alerts.withdrawFailed') });
            }
        } catch {
            setMessage({ type: 'error', text: t('alerts.networkError') });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleCancelWithdraw(transactionId: string) {
        if (!confirm(t('alerts.cancelWithdrawConfirm'))) return;
        setSubmitting(true);
        try {
            // Find the withdraw request ID from transaction
            const res = await fetch(`/api/operator/wallet/withdraw/${transactionId}/cancel`, {
                method: 'POST',
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(t('alerts.cancelWithdrawSuccess'));
                fetchWallet();
            } else {
                toast.error(data.error || t('alerts.cancelWithdrawFailed'));
            }
        } catch {
            toast.error(t('alerts.networkError'));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleCancelTopUp(requestId: string) {
        if (!confirm(t('alerts.cancelTopUpConfirm'))) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/operator/wallet/topup/${requestId}/cancel`, {
                method: 'POST',
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(t('alerts.cancelTopUpSuccess'));
                fetchWallet();
            } else {
                toast.error(data.error || t('alerts.cancelTopUpFailed'));
            }
        } catch {
            toast.error(t('alerts.networkError'));
        } finally {
            setSubmitting(false);
        }
    }

    const fmt = (n: number) => n.toLocaleString('vi-VN');

    function formatTransactionAmount(type: string, amount: number): string {
        const abs = Math.abs(amount);
        if (type === 'PAYOUT' || type === 'HOLD') {
            return `- ${fmt(abs)}`;
        }
        return `+ ${fmt(abs)}`;
    }

    const typeColors: Record<string, string> = {
        TOP_UP: 'bg-green-50 text-green-700',
        HOLD: 'bg-amber-50 text-amber-700',
        RELEASE: 'bg-blue-50 text-blue-700',
        REFUND: 'bg-indigo-50 text-indigo-700',
        PAYOUT: 'bg-purple-50 text-purple-700',
    };

    const statusColors: Record<string, string> = {
        COMPLETED: 'text-green-600',
        PENDING: 'text-amber-600',
        FAILED: 'text-red-600',
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-100 rounded w-48" />
                    <div className="h-32 bg-gray-100 rounded-xl" />
                    <div className="h-64 bg-gray-100 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
                </div>
                <Link
                    href="/dashboard/operator"
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                    {t('backToDashboard')}
                </Link>
            </div>

            {/* Messages */}
            {message && (
                <div className={`rounded-lg p-4 text-sm flex items-start justify-between ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)} className="ml-3 text-current opacity-50 hover:opacity-100">✕</button>
                </div>
            )}

            {/* Balance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <span className="text-xs font-medium text-gray-500 block mb-1">{t('balances.available')}</span>
                    <span className="text-2xl font-bold text-gray-900">{fmt(wallet?.availableBalance ?? 0)}</span>
                    <span className="text-sm text-gray-400 ml-1">{wallet?.currency || 'VND'}</span>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <span className="text-xs font-medium text-gray-500 block mb-1">{t('balances.escrow')}</span>
                    <span className="text-2xl font-bold text-amber-600">{fmt(wallet?.pendingBalance ?? 0)}</span>
                    <span className="text-sm text-gray-400 ml-1">{wallet?.currency || 'VND'}</span>
                    {(wallet?.activeHolds ?? 0) > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                            {wallet?.activeHolds === 1 ? t('balances.activeHolds', { count: 1 }) : t('balances.activeHoldsPlural', { count: wallet?.activeHolds ?? 0 })}
                        </p>
                    )}
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <span className="text-xs font-medium text-gray-500 block mb-1">{t('balances.deposited')}</span>
                    <span className="text-2xl font-bold text-gray-600">{fmt(wallet?.totalDeposited ?? 0)}</span>
                    <span className="text-sm text-gray-400 ml-1">{wallet?.currency || 'VND'}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Up */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('topUp.title')}</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        {t('topUp.desc')}
                    </p>

                    {/* Bank Details */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
                        <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-3">{t('topUp.bankAccountTitle')}</h4>
                        {bankLoading ? (
                            <div className="text-sm text-indigo-600 animate-pulse">{t('topUp.loadingBankDetails')}</div>
                        ) : !bankConfig ? (
                            <div className="text-sm text-red-600">{t('topUp.bankDetailsNotAvailable')}</div>
                        ) : (
                        <div className="space-y-2 text-sm text-indigo-900">
                            <div className="flex justify-between border-b border-indigo-100 pb-1">
                                <span className="opacity-70">{t('topUp.bankName')}</span>
                                <span className="font-medium">{bankConfig.bankName}</span>
                            </div>
                            <div className="flex justify-between border-b border-indigo-100 pb-1">
                                <span className="opacity-70">{t('topUp.accountNo')}</span>
                                <span className="font-mono font-bold text-lg select-all">{bankConfig.accountNumber}</span>
                            </div>
                            <div className="flex justify-between border-b border-indigo-100 pb-1">
                                <span className="opacity-70">{t('topUp.accountName')}</span>
                                <span className="font-medium">{bankConfig.accountName}</span>
                            </div>
                            {bankConfig.branch && (
                                <div className="flex justify-between border-b border-indigo-100 pb-1">
                                    <span className="opacity-70">{t('topUp.branch')}</span>
                                    <span className="font-medium">{bankConfig.branch}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-1">
                                <span className="opacity-70">{t('topUp.transferContent')}</span>
                                <span className="font-mono font-medium select-all">LUNAVIA-OP-{wallet?.id.slice(-6).toUpperCase()}</span>
                            </div>
                        </div>
                        )}
                    </div>

                    {!showTopUp ? (
                        <button
                            onClick={() => setShowTopUp(true)}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition"
                        >
                            {t('topUp.submitProofBtn')}
                        </button>
                    ) : (
                        <form onSubmit={handleTopUp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('topUp.amountLabel')}</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    placeholder={t('topUp.amountPlaceholder')}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">{t('topUp.minAmount')}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('topUp.uploadProofLabel')}</label>
                                <DocumentUpload
                                    label={t('topUp.uploadReceiptHint')}
                                    hint={t('topUp.uploadHint')}
                                    maxFiles={5}
                                    uploadUrl="/api/uploads/proof"
                                    onDocumentsChange={setTopUpDocs}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('topUp.notesLabel')}</label>
                                <textarea
                                    value={topUpNotes}
                                    onChange={(e) => setTopUpNotes(e.target.value)}
                                    rows={2}
                                    placeholder={t('topUp.notesPlaceholder')}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowTopUp(false)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                    {t('topUp.cancelBtn')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                                >
                                    {submitting ? t('topUp.submittingBtn') : t('topUp.submitRequestBtn')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Withdraw */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('withdraw.title')}</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        {t('withdraw.desc')}
                    </p>

                    {!showWithdraw ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                            <p className="text-sm text-gray-600 mb-4">
                                {t('withdraw.availableText')} <span className="font-bold text-gray-900">{fmt(wallet?.availableBalance ?? 0)} VND</span>
                            </p>
                            <button
                                onClick={() => setShowWithdraw(true)}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
                            >
                                {t('withdraw.requestBtn')}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleWithdraw} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('withdraw.amountLabel')}</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder={t('withdraw.amountPlaceholder')}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">{t('withdraw.maxAmount', { amount: fmt(wallet?.availableBalance ?? 0) })}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('withdraw.bankNameLabel')}</label>
                                    <input
                                        type="text"
                                        value={withdrawBankName}
                                        onChange={(e) => setWithdrawBankName(e.target.value)}
                                        placeholder={t('withdraw.bankNamePlaceholder')}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('withdraw.accountNoLabel')}</label>
                                    <input
                                        type="text"
                                        value={withdrawAccountNumber}
                                        onChange={(e) => setWithdrawAccountNumber(e.target.value)}
                                        placeholder={t('withdraw.accountNoPlaceholder')}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('withdraw.accountNameLabel')}</label>
                                <input
                                    type="text"
                                    value={withdrawAccountName}
                                    onChange={(e) => setWithdrawAccountName(e.target.value.toUpperCase())}
                                    placeholder={t('withdraw.accountNamePlaceholder')}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowWithdraw(false)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                    {t('topUp.cancelBtn')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition"
                                >
                                    {submitting ? t('withdraw.processingBtn') : t('withdraw.requestBtn')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Saved Payment Methods */}
            <SavedPaymentMethods
                onSelectForWithdraw={(method) => {
                    setWithdrawBankName(method.bankName);
                    setWithdrawAccountNumber(method.accountNumber);
                    setWithdrawAccountName(method.accountName);
                    setShowWithdraw(true);
                }}
            />

            {/* Transaction History */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">{t('history.title')}</h3>
                    <button
                        onClick={handleExportCSV}
                        disabled={exporting || transactions.length === 0}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
                    >
                        📥 {exporting ? t('export.exporting') : t('export.btn')}
                    </button>
                </div>
                {transactions.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm text-gray-400">{t('history.emptyState')}</p>
                        <p className="text-xs text-gray-300 mt-1">{t('history.emptyDesc')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">{t('history.colType')}</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">{t('history.colDesc')}</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">{t('history.colAmount')}</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">{t('history.colStatus')}</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">{t('history.colDate')}</th>
                                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeColors[tx.type] || 'bg-gray-50 text-gray-700'}`}>
                                                {t(`types.${tx.type}`)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-700 max-w-xs truncate">{tx.description}</td>
                                        <td className={`px-5 py-3 text-right font-semibold ${(tx.type === 'PAYOUT' || tx.type === 'HOLD') ? 'text-red-600' : 'text-green-700'}`}>
                                            {formatTransactionAmount(tx.type, tx.amount)} VND
                                        </td>
                                        <td className={`px-5 py-3 text-xs font-medium ${statusColors[tx.status] || 'text-gray-500'}`}>
                                            {t(`status.${tx.status}`)}
                                        </td>
                                        <td className="px-5 py-3 text-gray-400 text-xs">
                                            {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-5 py-3 text-right flex items-center justify-end gap-2">
                                            {tx.status === 'COMPLETED' && (
                                                <Link
                                                    href={`/invoice/${tx.id}`}
                                                    target="_blank"
                                                    className="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
                                                >
                                                    {t('history.invoiceBtn')}
                                                </Link>
                                            )}
                                            {tx.type === 'PAYOUT' && tx.status === 'PENDING' && !tx.isTopUpRequest && (
                                                <button
                                                    onClick={() => handleCancelWithdraw(tx.id)}
                                                    disabled={submitting}
                                                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition"
                                                >
                                                    {t('history.cancelBtn')}
                                                </button>
                                            )}
                                            {tx.type === 'TOP_UP' && tx.status === 'PENDING' && tx.isTopUpRequest && (
                                                <button
                                                    onClick={() => handleCancelTopUp(tx.id)}
                                                    disabled={submitting}
                                                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition"
                                                >
                                                    {t('history.cancelBtn')}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
