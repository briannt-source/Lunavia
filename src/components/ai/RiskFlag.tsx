'use client';

import { RiskSignalResult } from '@/lib/risk-signals';

interface Props {
    signal: RiskSignalResult;
    compact?: boolean;
}

/**
 * components/ai/RiskFlag.tsx
 * 
 * Visual risk indicator for users and tours.
 */
export default function RiskFlag({ signal, compact = false }: Props) {
    if (signal.level === 'STABLE' && compact) return null;

    if (compact) {
        return (
            <div title={signal.message} className={`flex h-5 w-5 items-center justify-center rounded-full border shadow-sm ${signal.color}`}>
                <span className="text-[10px] font-bold">!</span>
            </div>
        );
    }

    return (
        <div className={`flex items-start gap-2 rounded-lg border p-3 shadow-sm ${signal.color}`}>
            <span className="mt-0.5 text-lg">⚠️</span>
            <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-wider">{signal.level.replace('_', ' ')}</div>
                <div className="mt-0.5 text-xs font-medium leading-relaxed opacity-90">
                    {signal.message}
                </div>
            </div>
        </div>
    );
}
