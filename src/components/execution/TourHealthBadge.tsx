'use client';

import { useEffect, useState, useCallback } from 'react';

// ── Tour Health Badge ─────────────────────────────────────────────────
// Compact health score display with optional factor breakdown

interface HealthData {
    score: number;
    status: string;
    emoji: string;
    label: string;
    factors: Record<string, { score: number; detail: string }>;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; ring: string; bar: string }> = {
    Healthy: { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200', bar: 'bg-green-500' },
    'Minor Risk': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', bar: 'bg-amber-500' },
    'At Risk': { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200', bar: 'bg-orange-500' },
    Critical: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200', bar: 'bg-red-500' },
};

const FACTOR_LABELS: Record<string, { label: string; icon: string }> = {
    startDelay: { label: 'Start Timing', icon: '⏰' },
    segmentProgress: { label: 'Segment Progress', icon: '📍' },
    skippedSegments: { label: 'Skipped Segments', icon: '⏭️' },
    incidents: { label: 'Incidents', icon: '⚠️' },
    guideReliability: { label: 'Guide Activity', icon: '👤' },
};

interface TourHealthBadgeProps {
    tourId: string;
    showFactors?: boolean;
    compact?: boolean;
    autoRefresh?: boolean;
}

export function TourHealthBadge({ tourId, showFactors = false, compact = false, autoRefresh = false }: TourHealthBadgeProps) {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const fetchHealth = useCallback(async () => {
        try {
            const res = await fetch(`/api/tours/${tourId}/health`);
            const json = await res.json();
            if (json.success) setHealth(json.data.health);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [tourId]);

    useEffect(() => {
        fetchHealth();
        if (autoRefresh) {
            const interval = setInterval(fetchHealth, 30000);
            return () => clearInterval(interval);
        }
    }, [fetchHealth, autoRefresh]);

    if (loading || !health) {
        return compact
            ? <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-400">⏳ —</span>
            : <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />;
    }

    const colors = STATUS_COLORS[health.label] || STATUS_COLORS.Critical;

    // Compact inline badge
    if (compact) {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${colors.bg} ${colors.text}`}>
                {health.emoji} {health.score}
            </span>
        );
    }

    // Full card
    return (
        <div className={`rounded-xl border p-4 ${colors.bg} ring-1 ${colors.ring}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-2xl">{health.emoji}</div>
                    <div>
                        <div className={`text-lg font-bold ${colors.text}`}>{health.score}</div>
                        <div className="text-xs text-gray-600">{health.label}</div>
                    </div>
                </div>
                {/* Score bar */}
                <div className="w-24">
                    <div className="bg-white/50 rounded-full h-2">
                        <div className={`${colors.bar} h-2 rounded-full transition-all`} style={{ width: `${health.score}%` }} />
                    </div>
                </div>
            </div>

            {/* Factor toggle */}
            {(showFactors || expanded) && (
                <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-2">
                    {Object.entries(health.factors).map(([key, factor]) => {
                        const meta = FACTOR_LABELS[key] || { label: key, icon: '📊' };
                        return (
                            <div key={key} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 text-gray-600">
                                    <span>{meta.icon}</span>
                                    <span>{meta.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 bg-white/50 rounded-full h-1.5">
                                        <div className={`h-1.5 rounded-full transition-all ${factor.score >= 80 ? 'bg-green-500' :
                                                factor.score >= 60 ? 'bg-amber-500' :
                                                    factor.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                            }`} style={{ width: `${factor.score}%` }} />
                                    </div>
                                    <span className="font-mono w-6 text-right text-gray-500">{factor.score}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!showFactors && (
                <button onClick={() => setExpanded(!expanded)}
                    className="mt-2 text-[10px] text-gray-500 hover:text-gray-700 transition">
                    {expanded ? 'Hide details' : 'Show details'}
                </button>
            )}
        </div>
    );
}
