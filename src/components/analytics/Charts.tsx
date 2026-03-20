'use client';

import React from 'react';

// ═══════════════════════════════════════════════════════════════
// MINI AREA CHART
// ═══════════════════════════════════════════════════════════════

interface AreaChartProps {
    data: number[];
    labels?: string[];
    height?: number;
    color?: string;
    showDots?: boolean;
    showLabels?: boolean;
    showValues?: boolean;
    formatValue?: (v: number) => string;
}

export function MiniAreaChart({
    data,
    labels,
    height = 120,
    color = '#4f46e5',
    showDots = true,
    showLabels = false,
    showValues = false,
    formatValue = (v) => String(v),
}: AreaChartProps) {
    if (!data.length) return null;

    const padding = { top: 10, right: 10, bottom: showLabels ? 24 : 10, left: 10 };
    const width = 400;
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const max = Math.max(...data, 1);
    const points = data.map((v, i) => ({
        x: padding.left + (i / Math.max(data.length - 1, 1)) * chartW,
        y: padding.top + chartH - (v / max) * chartH,
        value: v,
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x},${padding.top + chartH} L ${points[0].x},${padding.top + chartH} Z`;

    const lightColor = color + '18';

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map(pct => (
                <line key={pct}
                    x1={padding.left} y1={padding.top + chartH * (1 - pct)}
                    x2={padding.left + chartW} y2={padding.top + chartH * (1 - pct)}
                    stroke="#f3f4f6" strokeWidth="1" />
            ))}

            {/* Area fill */}
            <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />
            <defs>
                <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                </linearGradient>
            </defs>

            {/* Line */}
            <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Dots */}
            {showDots && points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="2" />
            ))}

            {/* Values on dots */}
            {showValues && points.map((p, i) => (
                <text key={`v-${i}`} x={p.x} y={p.y - 10}
                    textAnchor="middle" fontSize="9" fontWeight="600" fill="#374151">
                    {formatValue(p.value)}
                </text>
            ))}

            {/* Labels */}
            {showLabels && labels && labels.map((label, i) => (
                <text key={`l-${i}`} x={points[i]?.x || 0} y={height - 4}
                    textAnchor="middle" fontSize="9" fill="#9ca3af">
                    {label}
                </text>
            ))}
        </svg>
    );
}

// ═══════════════════════════════════════════════════════════════
// BAR CHART
// ═══════════════════════════════════════════════════════════════

interface BarChartProps {
    data: { label: string; value: number; color?: string }[];
    height?: number;
    color?: string;
    showValues?: boolean;
    formatValue?: (v: number) => string;
}

export function MiniBarChart({
    data,
    height = 140,
    color = '#4f46e5',
    showValues = true,
    formatValue = (v) => String(v),
}: BarChartProps) {
    if (!data.length) return null;

    const padding = { top: showValues ? 18 : 8, right: 8, bottom: 22, left: 8 };
    const width = 400;
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const max = Math.max(...data.map(d => d.value), 1);
    const barGap = 4;
    const barWidth = Math.min((chartW - barGap * (data.length - 1)) / data.length, 40);
    const totalWidth = data.length * barWidth + (data.length - 1) * barGap;
    const offsetX = padding.left + (chartW - totalWidth) / 2;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
            {data.map((d, i) => {
                const barH = (d.value / max) * chartH;
                const x = offsetX + i * (barWidth + barGap);
                const y = padding.top + chartH - barH;
                const barColor = d.color || color;

                return (
                    <g key={i}>
                        {/* Bar */}
                        <rect x={x} y={y} width={barWidth} height={barH}
                            rx={3} fill={barColor} opacity="0.85" />

                        {/* Value */}
                        {showValues && d.value > 0 && (
                            <text x={x + barWidth / 2} y={y - 4}
                                textAnchor="middle" fontSize="9" fontWeight="600" fill="#374151">
                                {formatValue(d.value)}
                            </text>
                        )}

                        {/* Label */}
                        <text x={x + barWidth / 2} y={height - 4}
                            textAnchor="middle" fontSize="8" fill="#9ca3af">
                            {d.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

// ═══════════════════════════════════════════════════════════════
// DONUT CHART
// ═══════════════════════════════════════════════════════════════

interface DonutChartProps {
    segments: { label: string; value: number; color: string }[];
    size?: number;
    thickness?: number;
    centerLabel?: string;
    centerValue?: string | number;
}

export function DonutChart({
    segments,
    size = 120,
    thickness = 16,
    centerLabel,
    centerValue,
}: DonutChartProps) {
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    if (total === 0) return null;

    const r = (size - thickness) / 2;
    const circumference = 2 * Math.PI * r;
    let offset = 0;

    return (
        <div className="flex items-center gap-4">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {segments.map((seg, i) => {
                    const pct = seg.value / total;
                    const dashLen = pct * circumference;
                    const dashOffset = -offset * circumference;
                    offset += pct;

                    return (
                        <circle key={i}
                            cx={size / 2} cy={size / 2} r={r}
                            fill="none" stroke={seg.color} strokeWidth={thickness}
                            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        />
                    );
                })}
                {centerValue !== undefined && (
                    <>
                        <text x={size / 2} y={size / 2 - 2}
                            textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">
                            {centerValue}
                        </text>
                        {centerLabel && (
                            <text x={size / 2} y={size / 2 + 12}
                                textAnchor="middle" fontSize="9" fill="#9ca3af">
                                {centerLabel}
                            </text>
                        )}
                    </>
                )}
            </svg>
            <div className="space-y-1.5">
                {segments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
                        <span className="text-xs text-gray-600">{seg.label}</span>
                        <span className="text-xs font-semibold text-gray-900 ml-auto">{seg.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TREND BADGE
// ═══════════════════════════════════════════════════════════════

export function TrendBadge({ value, suffix = '%' }: { value: number; suffix?: string }) {
    const isUp = value > 0;
    const isFlat = value === 0;

    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
            isFlat ? 'bg-gray-100 text-gray-500' :
            isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
            {!isFlat && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d={isUp ? "M4.5 15.75l7.5-7.5 7.5 7.5" : "M19.5 8.25l-7.5 7.5-7.5-7.5"} />
                </svg>
            )}
            {isFlat ? '—' : `${isUp ? '+' : ''}${value}${suffix}`}
        </span>
    );
}

// ═══════════════════════════════════════════════════════════════
// HORIZONTAL BAR (for top cities / rankings)
// ═══════════════════════════════════════════════════════════════

export function HorizontalBarList({ items, color = '#4f46e5', maxItems = 5 }: {
    items: { label: string; value: number }[];
    color?: string;
    maxItems?: number;
}) {
    const visible = items.slice(0, maxItems);
    const max = Math.max(...visible.map(i => i.value), 1);

    return (
        <div className="space-y-2">
            {visible.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-20 truncate shrink-0">{item.label}</span>
                    <div className="flex-1 h-5 bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                            width: `${(item.value / max) * 100}%`,
                            background: color,
                            opacity: 1 - i * 0.12,
                        }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-8 text-right">{item.value}</span>
                </div>
            ))}
        </div>
    );
}
