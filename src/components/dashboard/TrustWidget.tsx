'use client';

import { TrustScoreGauge } from './TrustScoreGauge';
import { Fragment } from 'react';

interface TrustWidgetProps {
    score: number;
    metrics: {
        label: string;
        value: string | number;
        trend?: 'up' | 'down' | 'neutral';
        trendValue?: string;
    }[];
}

export function TrustWidget({ score, metrics }: TrustWidgetProps) {
    const getVerdict = (s: number) => {
        if (s >= 90) return { label: 'Excellent', color: 'text-emerald-600 bg-emerald-50' };
        if (s >= 70) return { label: 'Good', color: 'text-blue-600 bg-blue-50' };
        if (s >= 50) return { label: 'Fair', color: 'text-amber-600 bg-amber-50' };
        return { label: 'At Risk', color: 'text-red-600 bg-red-50' };
    };

    const verdict = getVerdict(score);

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Left: Gauge */}
                <div className="flex flex-col items-center gap-3">
                    <TrustScoreGauge score={score} size={140} strokeWidth={12} />
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${verdict.color}`}>
                        {verdict.label}
                    </span>
                </div>

                {/* Vertical Divider */}
                <div className="hidden sm:block w-px h-32 bg-gray-100" />

                {/* Right: Detailed Metrics */}
                <div className="flex-1 w-full grid grid-cols-2 gap-4">
                    {metrics.map((m, i) => (
                        <div key={i} className="flex flex-col p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{m.label}</span>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-lg font-bold text-gray-900">{m.value}</span>
                                {m.trend && (
                                    <span className={`text-xs font-medium ${m.trend === 'up' ? 'text-green-600' :
                                            m.trend === 'down' ? 'text-red-600' : 'text-gray-400'
                                        }`}>
                                        {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '•'} {m.trendValue}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
