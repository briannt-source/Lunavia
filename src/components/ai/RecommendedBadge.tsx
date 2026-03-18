'use client';

import { MatchingScoreBreakdown } from '@/lib/matching-score';

interface Props {
    score: number;
    breakdown: MatchingScoreBreakdown;
    recommendation: string;
}

/**
 * components/ai/RecommendedBadge.tsx
 * 
 * Displays an AI-assisted recommendation badge with an explainable breakdown.
 */
export default function RecommendedBadge({ score, breakdown, recommendation }: Props) {
    const isHigh = score >= 75;
    const isMedium = score >= 50 && score < 75;

    return (
        <div className="group relative inline-block">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm transition-colors cursor-help
                ${isHigh ? 'bg-indigo-100 text-indigo-700' : isMedium ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                {isHigh ? '⭐️ Recommended' : '✨ Suitable'}
                <span className="ml-1 text-[10px] opacity-70">{score}%</span>
            </span>

            {/* Explainable Tooltip */}
            <div className="absolute left-1/2 bottom-full mb-2 hidden w-64 -translate-x-1/2 flex-col rounded-lg border border-gray-200 bg-white p-3 shadow-xl group-hover:flex z-50">
                <div className="mb-2 text-xs font-bold text-gray-900">Why this recommendation?</div>
                <div className="space-y-1.5 mb-3">
                    <BreakdownRow label="Trust Score" value={breakdown.trust} max={30} />
                    <BreakdownRow label="Role Fit" value={breakdown.role} max={10} />
                    <BreakdownRow label="Language" value={breakdown.language} max={15} />
                    <BreakdownRow label="Local Knowledge" value={breakdown.province} max={10} />
                    <BreakdownRow label="Experience" value={breakdown.completion} max={15} />
                    <BreakdownRow label="Recency / Activity" value={breakdown.recency} max={5} />
                    <BreakdownRow label="Penalties" value={breakdown.penalty} max={0} color="text-red-500" />
                </div>
                <div className="border-t border-gray-100 pt-2 text-[11px] italic text-gray-600">
                    "{recommendation}"
                </div>
                <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-gray-200 bg-white"></div>
            </div>
        </div>
    );
}

function BreakdownRow({ label, value, max, color = 'text-gray-700' }: { label: string; value: number; max: number; color?: string }) {
    if (value === 0 && max > 0) return null;
    return (
        <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-500">{label}</span>
            <span className={`font-mono font-medium ${color}`}>
                {value > 0 ? '+' : ''}{value}
            </span>
        </div>
    );
}
