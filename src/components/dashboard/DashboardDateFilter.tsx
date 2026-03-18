"use client";
import { useRouter, useSearchParams } from 'next/navigation';

export default function DashboardDateFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentRange = searchParams.get('range') || '30d';

    const ranges = [
        { value: '24h', label: 'Last 24h' },
        { value: '7d', label: '7 Days' },
        { value: '30d', label: '30 Days' },
        { value: '90d', label: '3 Months' },
    ];

    function setRange(range: string) {
        const params = new URLSearchParams(searchParams);
        params.set('range', range);
        router.replace(`?${params.toString()}`);
    }

    return (
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm inline-flex">
            {ranges.map((r) => (
                <button
                    key={r.value}
                    onClick={() => setRange(r.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentRange === r.value
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                >
                    {r.label}
                </button>
            ))}
        </div>
    );
}
