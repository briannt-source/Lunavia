"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

const fmtVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
const fmtDateTime = (d: string) => new Date(d).toLocaleString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

interface InvoiceData {
    invoiceNumber: string;
    transactionId: string;
    type: string;
    amount: number;
    status: string;
    description: string | null;
    createdAt: string;
    processedAt: string | null;
    currency: string;
    operator: { name: string; email: string; legalAddress: string | null; licenseNumber: string | null };
    tour: { id: string; title: string; location: string; province: string | null; startTime: string; endTime: string; totalPayout: number | null } | null;
    guide: { name: string; email: string } | null;
    platformFee: number | null;
    guidePayout: number | null;
}

export default function InvoicePage() {
    const { txId } = useParams();
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!txId) return;
        fetch(`/api/finance/invoice/${txId}`)
            .then(r => r.json())
            .then(json => {
                if (json.success) setInvoice(json.data);
                else setError(json.error || 'Failed to load invoice');
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [txId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
    );

    if (error || !invoice) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                <div className="text-4xl mb-4">📄</div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
                <p className="text-gray-500">{error || 'The requested invoice could not be loaded.'}</p>
            </div>
        </div>
    );

    const typeLabel: Record<string, string> = {
        ESCROW_HOLD: 'Escrow Hold',
        ESCROW_RELEASE: 'Payout Release',
        ESCROW_REFUND: 'Escrow Refund',
        TOPUP: 'Top-Up',
        WITHDRAWAL: 'Withdrawal',
        COMMISSION: 'Platform Commission',
    };

    return (
        <>
            {/* Print-only styles */}
            <style>{`
                @media print {
                    body { background: white !important; }
                    .no-print { display: none !important; }
                    .print-area { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 2rem !important; }
                }
            `}</style>

            <div className="min-h-screen bg-gray-100 py-8 px-4">
                {/* Action Bar (hidden when printing) */}
                <div className="no-print max-w-3xl mx-auto mb-4 flex items-center justify-between">
                    <a href="/" className="text-sm text-[#5BA4CF] font-medium hover:underline">← Back to Lunavia</a>
                    <button
                        onClick={() => window.print()}
                        className="px-5 py-2 bg-lunavia-primary text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                        🖨️ Print / Save as PDF
                    </button>
                </div>

                {/* Invoice Document */}
                <div ref={printRef} className="print-area max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-10">

                    {/* Header */}
                    <div className="flex items-start justify-between mb-10">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">LUNAVIA</h1>
                            <p className="text-xs text-gray-400 mt-1 font-medium">Tour Operations Platform</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">{invoice.invoiceNumber}</div>
                            <div className="text-xs text-gray-500 mt-1">Issued: {fmtDate(invoice.createdAt)}</div>
                            <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                invoice.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                                invoice.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {invoice.status}
                            </div>
                        </div>
                    </div>

                    {/* From / To */}
                    <div className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b border-gray-100">
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">From (Platform)</div>
                            <div className="text-sm font-bold text-gray-900">Lunavia Marketplace</div>
                            <div className="text-xs text-gray-500 mt-1">Ho Chi Minh City, Vietnam</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To (Operator)</div>
                            <div className="text-sm font-bold text-gray-900">{invoice.operator.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{invoice.operator.email}</div>
                            {invoice.operator.legalAddress && (
                                <div className="text-xs text-gray-500">{invoice.operator.legalAddress}</div>
                            )}
                            {invoice.operator.licenseNumber && (
                                <div className="text-xs text-gray-400 mt-1">License: {invoice.operator.licenseNumber}</div>
                            )}
                        </div>
                    </div>

                    {/* Transaction Type */}
                    <div className="mb-8">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Transaction Details</div>
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                            <div className="grid grid-cols-2 gap-y-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Type:</span>
                                    <span className="ml-2 font-semibold text-gray-900">{typeLabel[invoice.type] || invoice.type}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Transaction ID:</span>
                                    <span className="ml-2 font-mono text-xs text-gray-700">{invoice.transactionId}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Date:</span>
                                    <span className="ml-2 font-semibold text-gray-900">{fmtDateTime(invoice.createdAt)}</span>
                                </div>
                                {invoice.processedAt && (
                                    <div>
                                        <span className="text-gray-500">Processed:</span>
                                        <span className="ml-2 font-semibold text-gray-900">{fmtDateTime(invoice.processedAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tour Details (if applicable) */}
                    {invoice.tour && (
                        <div className="mb-8">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tour Information</div>
                            <div className="bg-lunavia-light rounded-xl p-5 border border-[#5BA4CF]/20">
                                <div className="font-bold text-indigo-900 text-sm mb-2">{invoice.tour.title}</div>
                                <div className="grid grid-cols-2 gap-y-2 text-sm">
                                    <div>
                                        <span className="text-indigo-400">Location:</span>
                                        <span className="ml-2 text-indigo-900">{invoice.tour.location}{invoice.tour.province ? `, ${invoice.tour.province}` : ''}</span>
                                    </div>
                                    <div>
                                        <span className="text-indigo-400">Date:</span>
                                        <span className="ml-2 text-indigo-900">{fmtDate(invoice.tour.startTime)}</span>
                                    </div>
                                    {invoice.guide && (
                                        <div className="col-span-2">
                                            <span className="text-indigo-400">Guide:</span>
                                            <span className="ml-2 text-indigo-900">{invoice.guide.name} ({invoice.guide.email})</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Line Items Table */}
                    <div className="mb-8">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Financial Summary</div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-3 font-bold text-gray-900">Description</th>
                                    <th className="text-right py-3 font-bold text-gray-900">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="py-3 text-gray-700">
                                        {invoice.description || `${typeLabel[invoice.type] || invoice.type} Transaction`}
                                    </td>
                                    <td className="py-3 text-right font-semibold text-gray-900">{fmtVND(Math.abs(invoice.amount))}</td>
                                </tr>
                                {invoice.platformFee != null && invoice.platformFee > 0 && (
                                    <tr>
                                        <td className="py-3 text-gray-500">Platform Commission</td>
                                        <td className="py-3 text-right text-gray-500">{fmtVND(invoice.platformFee)}</td>
                                    </tr>
                                )}
                                {invoice.guidePayout != null && invoice.guidePayout > 0 && (
                                    <tr>
                                        <td className="py-3 text-gray-500">Guide Payout</td>
                                        <td className="py-3 text-right text-gray-500">{fmtVND(invoice.guidePayout)}</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-gray-900">
                                    <td className="py-4 font-black text-gray-900 text-base">Total</td>
                                    <td className="py-4 text-right font-black text-gray-900 text-base">{fmtVND(Math.abs(invoice.amount))}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="pt-8 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400">
                            This is a system-generated invoice from Lunavia. For questions, contact support@lunavia.io
                        </p>
                        <p className="text-[10px] text-gray-300 mt-2">
                            {invoice.invoiceNumber} • Generated on {new Date().toLocaleDateString()}
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
}
