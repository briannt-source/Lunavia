'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface CommissionEntry {
    tourId: string;
    tourTitle: string;
    totalAmount: number;
    commission: number;
    netReceived: number;
    date: string;
    ledgerRef: string;
}

export default function OperatorFinancePage() {
    const { data: session } = useSession();
    const [entries, setEntries] = useState<CommissionEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [totals, setTotals] = useState({ totalCommission: 0, totalNet: 0, totalGross: 0 });

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/operator/wallet');
                const json = await res.json();
                if (json.transactions) {
                    // Extract commission data from completed tour transactions
                    const tourTransactions = json.transactions
                        .filter((t: any) => t.type === 'TOUR_PAYMENT' && t.status === 'COMPLETED')
                        .map((t: any) => {
                            const meta = typeof t.metadata === 'string' ? JSON.parse(t.metadata || '{}') : (t.metadata || {});
                            const gross = t.amount || 0;
                            const commRate = meta.commissionRate || 0.1;
                            const commission = Math.round(gross * commRate);
                            return {
                                tourId: meta.tourId || t.referenceId || 'N/A',
                                tourTitle: meta.tourTitle || t.description || 'Tour Payment',
                                totalAmount: gross,
                                commission,
                                netReceived: gross - commission,
                                date: t.createdAt,
                                ledgerRef: t.id,
                            };
                        });
                    setEntries(tourTransactions);
                    setTotals({
                        totalGross: tourTransactions.reduce((s: number, e: CommissionEntry) => s + e.totalAmount, 0),
                        totalCommission: tourTransactions.reduce((s: number, e: CommissionEntry) => s + e.commission, 0),
                        totalNet: tourTransactions.reduce((s: number, e: CommissionEntry) => s + e.netReceived, 0),
                    });
                }
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const formatVND = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Commission & Revenue</h1>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Commission & Revenue</h1>
            <p className="text-sm text-gray-500 mb-6">
                Transparent breakdown of platform commission per tour. Constitution v2 compliant.
            </p>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium text-gray-500 uppercase">Gross Revenue</div>
                    <div className="text-xl font-bold text-gray-900 mt-1">{formatVND(totals.totalGross)}</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium text-gray-500 uppercase">Commission Paid</div>
                    <div className="text-xl font-bold text-amber-600 mt-1">{formatVND(totals.totalCommission)}</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium text-gray-500 uppercase">Net Received</div>
                    <div className="text-xl font-bold text-green-600 mt-1">{formatVND(totals.totalNet)}</div>
                </div>
            </div>

            {/* Commission Table */}
            {entries.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-gray-500">No completed tour payments yet.</p>
                </div>
            ) : (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-4 py-3 font-medium text-gray-500">Tour</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-500">Gross</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-500">Commission</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-500">Net</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-500">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry, idx) => (
                                <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{entry.tourTitle}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">Ref: {entry.ledgerRef.slice(0, 8)}...</div>
                                    </td>
                                    <td className="text-right px-4 py-3 text-gray-700">{formatVND(entry.totalAmount)}</td>
                                    <td className="text-right px-4 py-3 text-amber-600">-{formatVND(entry.commission)}</td>
                                    <td className="text-right px-4 py-3 font-medium text-green-600">{formatVND(entry.netReceived)}</td>
                                    <td className="text-right px-4 py-3 text-gray-400">
                                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
