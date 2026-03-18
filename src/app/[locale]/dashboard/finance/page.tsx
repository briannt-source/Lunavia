'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface TopUpRequest {
    id: string;
    operator: { id: string; name: string; email: string };
    amount: number;
    currency: string;
    proofUrl?: string;
    paymentReference?: string;
    notes?: string;
    createdAt: string;
}

interface WithdrawRequest {
    id: string;
    operator: { id: string; name: string; email: string };
    amount: number;
    currency: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    createdAt: string;
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    const json = await res.json();
    if (json.success === false) throw new Error(json.error);
    return json.success ? json.data : json;
};

export default function FinanceDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const { data, error, isLoading } = useSWR('/api/finance/requests', fetcher);
    const [activeTab, setActiveTab] = useState<'topup' | 'withdraw'>('topup');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<{ id: string; type: 'topup' | 'withdraw' } | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // Access Control (Client-side check, API also checks)
    if (session && !['SUPER_ADMIN', 'FINANCE'].includes(session.user.role)) {
        return <div className="p-8 text-center text-red-600">Unauthorized Access</div>;
    }

    const handleApprove = async (id: string, type: 'topup' | 'withdraw') => {
        if (!confirm('Are you sure you want to approve this request? This action involves real money flows.')) return;

        setProcessingId(id);
        try {
            const endpoint = type === 'topup'
                ? `/api/finance/topups/${id}/approve`
                : `/api/finance/withdrawals/${id}/approve`;

            const res = await fetch(endpoint, { method: 'POST', body: JSON.stringify({ proofUrl: 'MANUAL_APPROVAL' }) }); // proofUrl hardcoded for MVP manual approval
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Failed to approve');

            alert('Request Approved Successfully');
            mutate('/api/finance/requests');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectModal || !rejectReason.trim()) return;

        setProcessingId(rejectModal.id);
        try {
            const endpoint = rejectModal.type === 'topup'
                ? `/api/finance/topups/${rejectModal.id}/reject`
                : `/api/finance/withdrawals/${rejectModal.id}/reject`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectReason })
            });
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Failed to reject');

            alert('Request Rejected');
            setRejectModal(null);
            setRejectReason('');
            mutate('/api/finance/requests');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading finance data...</div>;
    if (error) return <div className="p-8 text-center text-red-600">Failed to load data</div>;

    const topUps = data?.topUps || [];
    const withdrawals = data?.withdrawals || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">Manage operator wallet top-ups and withdrawals.</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('topup')}
                        className={`${activeTab === 'topup'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Pending Top-ups ({topUps.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('withdraw')}
                        className={`${activeTab === 'withdraw'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Pending Withdrawals ({withdrawals.length})
                    </button>
                </nav>
            </div>

            {/* Content */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {activeTab === 'topup' && topUps.map((req: TopUpRequest) => (
                        <li key={req.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-indigo-600 truncate">{req.operator.name || req.operator.email}</p>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            PENDING
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                                        <div>
                                            <p><span className="font-semibold">Amount:</span> {req.amount.toLocaleString()} {req.currency}</p>
                                            <p><span className="font-semibold">Ref:</span> {req.paymentReference || 'N/A'}</p>
                                            <p><span className="font-semibold">Date:</span> {new Date(req.createdAt).toLocaleString()}</p>
                                            {req.notes && <p className="mt-1 italic">"{req.notes}"</p>}
                                        </div>
                                        <div>
                                            {req.proofUrl ? (
                                                <a href={req.proofUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                                                    View Proof of Payment ↗
                                                </a>
                                            ) : (
                                                <span className="text-red-500">No proof attached</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-4 flex items-center space-x-3">
                                    <button
                                        onClick={() => handleApprove(req.id, 'topup')}
                                        disabled={!!processingId}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setRejectModal({ id: req.id, type: 'topup' })}
                                        disabled={!!processingId}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}

                    {activeTab === 'withdraw' && withdrawals.map((req: WithdrawRequest) => (
                        <li key={req.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-indigo-600 truncate">{req.operator.name || req.operator.email}</p>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            PENDING
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                                        <div>
                                            <p><span className="font-semibold">Amount:</span> {req.amount.toLocaleString()} {req.currency}</p>
                                            <p><span className="font-semibold">Bank:</span> {req.bankName}</p>
                                            <p><span className="font-semibold">Account:</span> {req.accountNumber} ({req.accountName})</p>
                                        </div>
                                        <div>
                                            <p><span className="font-semibold">Requested:</span> {new Date(req.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-4 flex items-center space-x-3">
                                    <button
                                        onClick={() => handleApprove(req.id, 'withdraw')}
                                        disabled={!!processingId}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                    >
                                        Mark Paid
                                    </button>
                                    <button
                                        onClick={() => setRejectModal({ id: req.id, type: 'withdraw' })}
                                        disabled={!!processingId}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}

                    {activeTab === 'topup' && topUps.length === 0 && (
                        <li className="p-8 text-center text-gray-500">No pending top-up requests.</li>
                    )}
                    {activeTab === 'withdraw' && withdrawals.length === 0 && (
                        <li className="p-8 text-center text-gray-500">No pending withdrawal requests.</li>
                    )}
                </ul>
            </div>

            {/* Reject Modal */}
            {rejectModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Request</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Please provide a reason for rejecting this {rejectModal.type === 'topup' ? 'top-up' : 'withdrawal'} request.
                            The operator will be notified.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows={3}
                            placeholder="Reason for rejection..."
                        />
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || !!processingId}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            >
                                {processingId ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
