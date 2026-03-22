'use client';

import React from 'react';

interface DemandItem {
    province: string;
    language: string;
    count: number;
}

export function DemandSignal({ demand }: { demand: DemandItem[] }) {
    if (demand.length === 0) {
        return (
            <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl text-center">
                <p className="text-gray-500 text-sm italic">Lower demand currently. Perfect time for training!</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-[#5BA4CF]/20 rounded-xl overflow-hidden">
            <div className="bg-lunavia-light/50 p-4 border-b border-indigo-50">
                <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                    🔥 High Demand Areas (Next 7 Days)
                </h3>
                <p className="text-[11px] text-[#2E8BC0] mt-1">Based on open tours needing guides. Update your availability!</p>
            </div>
            <div className="p-4 grid gap-3 sm:grid-cols-2">
                {demand.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <div className="text-xs font-bold text-gray-900">{item.province}</div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                <span className="uppercase">{item.language}</span>
                                <span>•</span>
                                <span>{item.count} openings</span>
                            </div>
                        </div>
                        <div className="flex -space-x-1">
                            <div className={`h-1.5 w-6 rounded-full ${item.count > 10 ? 'bg-red-500' :
                                    item.count > 5 ? 'bg-orange-400' : 'bg-green-400'
                                }`} />
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                <button className="text-xs font-semibold text-[#5BA4CF] hover:text-indigo-800 transition">
                    Enable Notifications for these Areas →
                </button>
            </div>
        </div>
    );
}
