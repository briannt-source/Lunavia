'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ObserverDashboardPage() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Default to SYSTEM for preview
    const previewType = searchParams.get('previewType') || 'SYSTEM';

    useEffect(() => {
        setLoading(true);
        setError(null);

        let endpoint = '';
        if (previewType === 'SYSTEM') endpoint = '/api/observer/system/health';
        else if (previewType === 'INVESTOR') endpoint = '/api/observer/investor/metrics';
        else if (previewType === 'OPERATOR_PERFORMANCE') {
            // Need a sample operator ID for preview, since we don't have linkedOperatorId in session natively
            endpoint = '/api/observer/operator/sample/performance'; 
        }

        if (!endpoint) return;

        fetch(endpoint)
            .then(res => res.json())
            .then(json => {
                if (json.success) setData(json.data);
                else setError(json.error || 'Failed to fetch data');
            })
            .catch(() => setError('Network error'))
            .finally(() => setLoading(false));

    }, [previewType]);

    if (loading) return (
        <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-64" />
            <div className="grid grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}</div>
            <div className="h-96 bg-gray-200 rounded-xl" />
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-center">
            <p className="font-bold">Access Error: {error}</p>
            <p className="text-sm mt-1">Observer access is strictly controlled. Ensure you have the correct permissions and linked IDs.</p>
        </div>
    );

    if (!data) return null;

    if (previewType === 'SYSTEM') return <SystemHealthView data={data} />;
    if (previewType === 'INVESTOR') return <InvestorView data={data} />;
    if (previewType === 'OPERATOR_PERFORMANCE') return <OperatorPerformanceView data={data} />;

    return null;
}

// ── View Components ──

function SystemHealthView({ data }: { data: any }) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-gray-900">System Health Dashboard</h1>
            <p className="text-sm text-gray-500">Anonymized, read-only system-wide operational metrics.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Metric label="Total Tours" value={data.totalTours} icon="🗺️" />
                <Metric label="Active Tours" value={data.activeTours} icon="▶️" />
                <Metric label="Completed Tours" value={data.completedTours} icon="✅" />
                <Metric label="Escrow Held" value={`₫${new Intl.NumberFormat('vi-VN').format(data.escrowTotal || 0)}`} icon="💰" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4">Tour Status Breakdown</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {data.statusBreakdown?.map((s: any) => (
                        <div key={s.status} className="bg-gray-50 rounded p-3 text-center">
                            <p className="text-xl font-black text-gray-900">{s.count}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase">{s.status}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
                <h2 className="font-bold text-amber-900 mb-2">Safety & Incident Alerts</h2>
                <div className="flex gap-4">
                    <div>
                        <p className="text-3xl font-black text-amber-700">{data.openSOS}</p>
                        <p className="text-xs font-bold text-amber-800 uppercase">Open SOS</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InvestorView({ data }: { data: any }) {
    const { userGrowth, tourVolume, revenue } = data;
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-gray-900">Investor Metrics</h1>
            <p className="text-sm text-gray-500">High-level growth, revenue, and retention data.</p>

            <div className="grid grid-cols-3 gap-4">
                <Metric label="Total Users" value={userGrowth?.totalSignups} icon="👥" />
                <Metric label="Total GMV" value={`₫${new Intl.NumberFormat('vi-VN').format(revenue?.totalGMV || 0)}`} icon="💵" />
                <Metric label="Completed Tours" value={tourVolume?.completed} icon="🎯" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4">Engagement</h2>
                <div className="grid grid-cols-3 text-center gap-4">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="text-2xl font-black text-indigo-900">{userGrowth?.active30d?.operators}</p>
                        <p className="text-[10px] font-bold text-indigo-700 uppercase">Active Operators (30d)</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-lg">
                        <p className="text-2xl font-black text-emerald-900">{userGrowth?.active30d?.guides}</p>
                        <p className="text-[10px] font-bold text-emerald-700 uppercase">Active Guides (30d)</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-2xl font-black text-blue-900">{tourVolume?.thisMonth}</p>
                        <p className="text-[10px] font-bold text-blue-700 uppercase">Tours This Month</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OperatorPerformanceView({ data }: { data: any }) {
    const { tourStats, safety, financial } = data;
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-gray-900">Operator Performance</h1>
            <p className="text-sm text-gray-500">Anonymized performance metrics for linked operator.</p>

            <div className="grid grid-cols-4 gap-4">
                <Metric label="Total Tours" value={tourStats?.totalTours} icon="🗺️" />
                <Metric label="Completion Rate" value={`${tourStats?.completionRate}%`} icon="📈" />
                <Metric label="Cancellation Rate" value={`${tourStats?.cancellationRate}%`} icon="📉" />
                <Metric label="GMV" value={`₫${new Intl.NumberFormat('vi-VN').format(financial?.totalPayoutsGenerated || 0)}`} icon="💵" />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="font-bold text-gray-900 mb-4">Safety & Disputes</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between border-b pb-2"><span>Incidents Reported</span><span className="font-black">{safety?.incidentsReported}</span></div>
                        <div className="flex justify-between border-b pb-2"><span>Disputes Received</span><span className="font-black">{safety?.disputesReceived}</span></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="font-bold text-gray-900 mb-4">Recent Feedback</h2>
                    {data.recentFeedback?.length === 0 ? <p className="text-sm text-gray-400">No recent feedback</p> : (
                        <div className="space-y-2">
                            {data.recentFeedback?.map((f: any) => (
                                <div key={f.id} className="text-sm p-2 bg-gray-50 rounded">
                                    <span className="font-bold text-indigo-600 mr-2">{f.rating}★</span>
                                    {f.tags && <span className="text-xs text-gray-500">[{f.tags}] </span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Metric({ label, value, icon }: { label: string; value: string | number; icon: string }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <span className="text-3xl">{icon}</span>
            <div>
                <p className="text-xl font-black text-gray-900 leading-tight">{value || 0}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
}
