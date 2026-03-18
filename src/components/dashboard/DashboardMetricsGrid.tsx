import { ReactNode } from 'react';

export interface MetricCardProps {
    label: string;
    value: string | number;
    icon?: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: string; // bg color class
    subtext?: string;
    trendValue?: string;
}

export function DashboardMetricsGrid({ metrics }: { metrics: MetricCardProps[] }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className="relative overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-gray-200 transition-all hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                            <p className="mt-1.5 text-2xl font-bold text-gray-900">{metric.value}</p>
                        </div>
                        {metric.icon && (
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.color || 'bg-gray-50'} text-xl`}>
                                {metric.icon}
                            </div>
                        )}
                    </div>

                    {(metric.change || metric.subtext) && (
                        <div className="mt-3 flex items-center text-sm">
                            {(metric.change || metric.trendValue) && (
                                <span className={`font-medium ${metric.trend === 'up' ? 'text-green-600' :
                                    metric.trend === 'down' ? 'text-red-600' :
                                        'text-gray-500'
                                    }`}>
                                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : ''} {metric.change || metric.trendValue}
                                </span>
                            )}
                            {(metric.change || metric.trendValue) && metric.subtext && <span className="mx-2 text-gray-300">|</span>}
                            {metric.subtext && (
                                <span className="text-gray-500">{metric.subtext}</span>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
