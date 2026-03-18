"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface AnalyticsData {
    range: string;
    adoption: {
        totalOperators: number;
        activeOperators: number;
        conversionRate: string;
    };
    guides: {
        totalGuides: number;
    };
    serviceRequests: {
        total: number;
        completed: number;
        cancelled: number;
        completionRate: string;
    };
    incidents?: {
        open: number;
        resolved: number;
    };
    feedback: {
        averageRating: string;
    };
    monetization?: {
        totalRevenue: number;
        activePaidUsers: number;
        approvedRequests: number;
    };
}

export default function AnalyticsDashboard() {
    const [range, setRange] = useState('30d');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/analytics?range=${range}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Failed to fetch analytics');
                setData(json);
            } catch (err: any) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [range]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
    if (!data) return <div className="p-8 text-center text-gray-500">No data available</div>;

    return (
        <div className="space-y-8">
            {/* Header & Filter */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
                    <p className="text-sm text-gray-600">Decision data for Go / No-Go (Read-only)</p>
                </div>
                <div>
                    <div className="flex items-center">
                        <button
                            onClick={() => {
                                if (!data) return;
                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `lunavia-analytics-${range}-${new Date().toISOString().split('T')[0]}.json`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            }}
                            className="mr-3 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Export JSON
                        </button>
                        <div className="inline-flex rounded-lg bg-gray-100 p-1">
                            {['7d', '30d', '90d'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRange(r)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${range === r
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    Last {r.replace('d', ' Days')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Tours" value={data.serviceRequests.total} />
                <StatCard label="Completion Rate" value={`${data.serviceRequests.completionRate}%`} />
                <StatCard label="Active Operators" value={data.adoption.activeOperators} />
                <StatCard label="Avg Rating" value={data.feedback.averageRating} />
            </div>

            {/* 2. Detailed Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Operator Adoption */}
                <SectionCard title="Operator Adoption">
                    <div className="space-y-4">
                        <MetricRow label="Total Registered" value={data.adoption.totalOperators} />
                        <MetricRow label="With >0 Tours" value={data.adoption.activeOperators} />
                        <div className="pt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Activation Rate</span>
                                <span className="text-lg font-bold text-indigo-600">{data.adoption.conversionRate}%</span>
                            </div>
                            <div className="mt-1 w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{ width: `${Math.min(parseFloat(data.adoption.conversionRate), 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* Service Health */}
                <SectionCard title="Service Health">
                    <div className="space-y-4">
                        <div className="flex items-center justify-center h-32">
                            {/* Simple Placeholder Pie Visualization */}
                            <div className="flex gap-8">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{data.serviceRequests.completed}</div>
                                    <div className="text-xs text-gray-500">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{data.serviceRequests.cancelled}</div>
                                    <div className="text-xs text-gray-500">Cancelled</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* Incidents (Role Gated) */}
                {data.incidents && (
                    <SectionCard title="Incidents & Ops">
                        <div className="flex gap-4">
                            <div className="flex-1 bg-red-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-red-700">{data.incidents.open}</div>
                                <div className="text-xs font-medium text-red-600">Open Incidents</div>
                            </div>
                            <div className="flex-1 bg-green-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-700">{data.incidents.resolved}</div>
                                <div className="text-xs font-medium text-green-600">Resolved</div>
                            </div>
                        </div>
                    </SectionCard>
                )}

                {/* Monetization (Role Gated) */}
                {data.monetization && (
                    <SectionCard title="Monetization (Soft Signal)">
                        <div className="space-y-4">
                            <MetricRow label="Active Paid Plans" value={data.monetization.activePaidUsers} />
                            <MetricRow label="Upgrade Requests" value={data.monetization.approvedRequests} />
                            <div className="pt-2 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Total Revenue (Est.)</span>
                                    <span className="text-lg font-bold text-emerald-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.monetization.totalRevenue)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                )}
            </div>

            <div className="text-center text-xs text-gray-400 pt-8">
                Data generated for decision making only. Last updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
}

function StatCard({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
        </div>
    );
}

function SectionCard({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
            <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
            {children}
        </div>
    );
}

function MetricRow({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="font-medium text-gray-900">{value}</span>
        </div>
    );
}
