'use client';

// ── Segment Status Badge ──────────────────────────────────────────────
// Displays a colored badge for segment check-in status

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    ARRIVED: { bg: 'bg-lunavia-light', text: 'text-lunavia-primary-hover', dot: 'bg-lunavia-light0', label: 'Arrived' },
    STARTED: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'In Progress' },
    COMPLETED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Completed' },
    SKIPPED: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Skipped' },
    PENDING: { bg: 'bg-gray-50', text: 'text-gray-400', dot: 'bg-gray-300', label: 'Pending' },
};

interface SegmentStatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

export function SegmentStatusBadge({ status, size = 'sm' }: SegmentStatusBadgeProps) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
}

export { STATUS_CONFIG };
