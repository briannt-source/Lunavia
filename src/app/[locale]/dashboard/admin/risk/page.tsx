"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface RiskItem {
    type: 'LEDGER_DRIFT' | 'HIGH_BOOST_FREQUENCY' | 'STALE_RISK';
    severity: 'critical' | 'warning';
    walletId?: string;
    operatorId?: string;
    ledgerBalance?: number;
    columnBalance?: number;
    drift?: number;
    boostCount?: number;
    period?: string;
    userId?: string;
    riskScore?: number;
    lastUpdated?: string;
    daysSinceUpdate?: number;
}

interface RiskData {
    domain: string;
    items: RiskItem[];
    total: number;
    pending: number;
    breakdown: {
        ledgerDrift: number;
        highBoostFrequency: number;
        staleRisk: number;
    };
}

const SEVERITY_STYLES = {
    critical: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800', badge: 'bg-red-100 text-red-700' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-700' },
};

const TYPE_LABELS: Record<string, { title: string; icon: string }> = {
    LEDGER_DRIFT: { title: 'Wallet Ledger Drift', icon: '💰' },
    HIGH_BOOST_FREQUENCY: { title: 'High Boost Frequency', icon: '🚀' },
    STALE_RISK: { title: 'Stale Risk Profile', icon: '⏰' },
};

export default function RiskMonitoringPage() {
    const { data: session } = useSession();
    const [data, setData] = useState<RiskData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRisk() {
            try {
                const res = await fetch('/api/admin/risk');
                if (!res.ok) throw new Error('Failed to load risk data');
                const result = await res.json();
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchRisk();
    }, []);

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">Risk Monitoring</h1>
                <div className="animate-pulse space-y-3">
                    <div className="h-24 bg-gray-200 rounded-lg"></div>
                    <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Risk Monitoring</h1>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-red-700">Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">🛡️ Risk Monitoring</h1>
                    <p className="text-sm text-gray-500 mt-1">Domain: RISK — Displays financial integrity checks and risk signals</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                        🛡️ RISK
                    </span>
                    {data && data.pending > 0 && (
                        <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                            {data.pending} critical
                        </span>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            {data && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="text-2xl font-bold text-red-700">{data.breakdown.ledgerDrift}</div>
                        <div className="text-sm text-red-600">Ledger Drift Cases</div>
                    </div>
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <div className="text-2xl font-bold text-yellow-700">{data.breakdown.highBoostFrequency}</div>
                        <div className="text-sm text-yellow-600">High Boost Frequency</div>
                    </div>
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                        <div className="text-2xl font-bold text-orange-700">{data.breakdown.staleRisk}</div>
                        <div className="text-sm text-orange-600">Stale Risk Profiles</div>
                    </div>
                </div>
            )}

            {/* Items */}
            {data && data.total === 0 ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
                    <span className="text-2xl">✅</span>
                    <h3 className="font-semibold text-green-800 mt-2">All Clear</h3>
                    <p className="text-sm text-green-600">No risk signals detected across any category</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {data?.items.map((item, idx) => {
                        const style = SEVERITY_STYLES[item.severity];
                        const typeInfo = TYPE_LABELS[item.type] || { title: item.type, icon: '⚠️' };

                        return (
                            <div key={idx} className={`rounded-lg border-l-4 ${style.border} ${style.bg} p-4`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{typeInfo.icon}</span>
                                        <h4 className={`font-medium ${style.text}`}>{typeInfo.title}</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${style.badge}`}>
                                            {item.severity}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-gray-600">
                                    {item.type === 'LEDGER_DRIFT' && (
                                        <div className="grid grid-cols-4 gap-2 mt-1">
                                            <div><span className="text-gray-400">Wallet:</span> <span className="font-mono text-xs">{item.walletId?.slice(0, 8)}...</span></div>
                                            <div><span className="text-gray-400">Ledger:</span> {item.ledgerBalance?.toLocaleString()}</div>
                                            <div><span className="text-gray-400">Column:</span> {item.columnBalance?.toLocaleString()}</div>
                                            <div><span className="text-gray-400">Drift:</span> <span className="font-semibold text-red-600">{item.drift?.toLocaleString()}</span></div>
                                        </div>
                                    )}
                                    {item.type === 'HIGH_BOOST_FREQUENCY' && (
                                        <span>Operator <span className="font-mono text-xs">{item.operatorId?.slice(0, 8)}...</span> has {item.boostCount} boosts in {item.period}</span>
                                    )}
                                    {item.type === 'STALE_RISK' && (
                                        <span>User <span className="font-mono text-xs">{item.userId?.slice(0, 8)}...</span> — Risk score: {item.riskScore}, last updated {item.daysSinceUpdate} days ago</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
                Risk monitoring data is read-only. All actions must go through appropriate domain workflows.
            </div>
        </div>
    );
}
