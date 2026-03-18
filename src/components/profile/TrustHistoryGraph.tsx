'use client';

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface TrustEvent {
    createdAt: string;
    newScore: number;
    changeValue: number;
    type: string;
    description: string;
}

export function TrustHistoryGraph({ userId }: { userId: string }) {
    const [data, setData] = useState<TrustEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/trust/history');
                const json = await res.json();
                if (Array.isArray(json)) {
                    // Seed initial point if empty or just to look nice
                    if (json.length === 0) {
                        setData([{ createdAt: new Date().toISOString(), newScore: 50, changeValue: 0, type: 'INIT', description: 'Initial Score' }]);
                    } else {
                        setData(json);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch trust history', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    if (loading) return <div className="h-48 flex items-center justify-center text-gray-400">Loading history...</div>;

    const chartData = data.map(event => ({
        date: format(new Date(event.createdAt), 'MMM d'),
        score: event.newScore,
        tooltipDate: format(new Date(event.createdAt), 'PPP p'),
        reason: event.type
    }));

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        hide
                    />
                    <Tooltip
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                        <p className="font-semibold text-gray-900">{payload[0].payload.tooltipDate}</p>
                                        <p className="text-indigo-600 font-bold text-lg">Score: {payload[0].value}</p>
                                        <p className="text-xs text-gray-500 mt-1">{payload[0].payload.reason}</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#4F46E5"
                        fillOpacity={1}
                        fill="url(#colorScore)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
