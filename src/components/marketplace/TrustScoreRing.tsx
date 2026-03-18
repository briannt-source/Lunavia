'use client';

import { useEffect, useState } from 'react';

// ── Tier Definitions ─────────────────────────────────────────────────
export type TrustTier = 'NEW' | 'ACTIVE' | 'TRUSTED' | 'ELITE';

export function getTrustTier(score: number): TrustTier {
    if (score >= 90) return 'ELITE';
    if (score >= 70) return 'TRUSTED';
    if (score >= 40) return 'ACTIVE';
    return 'NEW';
}

const TIER_CONFIG: Record<TrustTier, { label: string; color: string; ring: string; bg: string; text: string }> = {
    NEW: { label: 'New', color: '#9CA3AF', ring: '#D1D5DB', bg: 'bg-gray-100', text: 'text-gray-600' },
    ACTIVE: { label: 'Active', color: '#3B82F6', ring: '#60A5FA', bg: 'bg-blue-100', text: 'text-blue-700' },
    TRUSTED: { label: 'Trusted', color: '#10B981', ring: '#34D399', bg: 'bg-green-100', text: 'text-green-700' },
    ELITE: { label: 'Elite', color: '#7C3AED', ring: '#8B5CF6', bg: 'bg-purple-100', text: 'text-purple-700' },
};

export { TIER_CONFIG };

const TRUST_FACTORS = [
    'Completed tours',
    'Reliability record',
    'Verification status',
    'Partner feedback',
];

// ── TrustScoreRing — Animated circular gauge with tier badge ─────────
interface TrustScoreRingProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showTier?: boolean;
    showTooltip?: boolean;
    animate?: boolean;
}

const SIZE_MAP = {
    sm: { px: 56, stroke: 4, textClass: 'text-base', tierClass: 'text-[9px] px-1.5 py-0.5' },
    md: { px: 88, stroke: 6, textClass: 'text-xl', tierClass: 'text-[10px] px-2 py-0.5' },
    lg: { px: 120, stroke: 8, textClass: 'text-3xl', tierClass: 'text-xs px-2.5 py-1' },
};

export function TrustScoreRing({
    score,
    size = 'md',
    showTier = true,
    showTooltip = false,
    animate = true,
}: TrustScoreRingProps) {
    const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const tier = getTrustTier(score);
    const config = TIER_CONFIG[tier];
    const s = SIZE_MAP[size];

    useEffect(() => {
        if (!animate) { setDisplayScore(score); return; }
        const steps = 60;
        const increment = score / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= score) { setDisplayScore(score); clearInterval(timer); }
            else setDisplayScore(current);
        }, 25);
        return () => clearInterval(timer);
    }, [score, animate]);

    const radius = (s.px - s.stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (displayScore / 100) * circumference;

    return (
        <div className="relative inline-flex flex-col items-center gap-1.5">
            <div
                className="relative flex items-center justify-center cursor-help"
                style={{ width: s.px, height: s.px }}
                onMouseEnter={() => showTooltip && setTooltipOpen(true)}
                onMouseLeave={() => setTooltipOpen(false)}
            >
                <svg className="transform -rotate-90 w-full h-full">
                    <circle
                        className="text-gray-100"
                        strokeWidth={s.stroke}
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx={s.px / 2}
                        cy={s.px / 2}
                    />
                    <circle
                        stroke={config.ring}
                        strokeWidth={s.stroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="transparent"
                        r={radius}
                        cx={s.px / 2}
                        cy={s.px / 2}
                        className="transition-all duration-300 ease-out"
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className={`${s.textClass} font-bold`} style={{ color: config.color }}>
                        {Math.round(displayScore)}
                    </span>
                </div>
            </div>

            {showTier && (
                <span className={`inline-flex items-center rounded-full font-semibold ${s.tierClass} ${config.bg} ${config.text}`}>
                    {config.label}
                </span>
            )}

            {showTooltip && tooltipOpen && (
                <div className="absolute top-full mt-2 z-50 w-56 rounded-xl bg-white border border-gray-200 shadow-lg p-4 text-left">
                    <p className="text-xs font-semibold text-gray-900 mb-2">Trust Score reflects:</p>
                    <ul className="space-y-1">
                        {TRUST_FACTORS.map(f => (
                            <li key={f} className="text-xs text-gray-600 flex items-center gap-1.5">
                                <svg className="h-3 w-3 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ── TrustScoreBadge — Inline pill badge ──────────────────────────────
interface TrustScoreBadgeProps {
    score: number;
    size?: 'sm' | 'md';
}

export function TrustScoreBadge({ score, size = 'sm' }: TrustScoreBadgeProps) {
    const tier = getTrustTier(score);
    const config = TIER_CONFIG[tier];
    const cls = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

    return (
        <span className={`inline-flex items-center rounded-full font-semibold ${cls} ${config.bg} ${config.text}`}>
            {score} — {config.label}
        </span>
    );
}
