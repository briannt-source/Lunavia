'use client';

import { useEffect, useState } from 'react';

interface Props {
    operatorId: string;
    className?: string;
}

interface RiskSummary {
    trustScore: number;
    riskLevel: string;
    toursCompleted: number;
    disputeCount: number;
    latePayments: number;
}

export default function OperatorRiskPanel({ operatorId, className = '' }: Props) {
    const [data, setData] = useState<RiskSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/operator/${operatorId}/risk-summary`)
            .then(r => r.ok ? r.json() : null)
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [operatorId]);

    if (loading) {
        return <div className={`bg-white rounded-xl border border-gray-200 p-6 animate-pulse ${className}`}>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-1/4" />
        </div>;
    }

    if (!data) return null;

    const levelConfig = {
        LOW: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: '✅ Low Risk' },
        MODERATE: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: '⚠️ Moderate Risk' },
        HIGH: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: '🔴 High Risk' },
    }[data.riskLevel] || { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', label: data.riskLevel };

    return (
        <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Operator Reputation</h4>

            <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                    <div className="text-3xl font-bold text-[#5BA4CF]">{data.trustScore}</div>
                    <div className="text-xs text-gray-400">Trust Score</div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${levelConfig.color} ${levelConfig.bg} ${levelConfig.border}`}>
                    {levelConfig.label}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-gray-900">{data.toursCompleted}</div>
                    <div className="text-xs text-gray-500">Tours (90d)</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className={`text-lg font-bold ${data.disputeCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{data.disputeCount}</div>
                    <div className="text-xs text-gray-500">Disputes</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className={`text-lg font-bold ${data.latePayments > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{data.latePayments}</div>
                    <div className="text-xs text-gray-500">Late Pay</div>
                </div>
            </div>
        </div>
    );
}
