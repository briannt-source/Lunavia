interface StatusBadgeProps {
  status: string;
  config?: Record<string, { bg: string; text: string; label: string; dot?: string }>;
  className?: string;
}

const defaultStatusConfig: Record<string, { bg: string; text: string; label: string; dot?: string }> = {
  // General Tour/Request Status
  OPEN: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Open', dot: 'bg-blue-500' },
  PUBLISHED: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Published', dot: 'bg-blue-500' },
  OFFERED: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Offered', dot: 'bg-yellow-500' },
  ASSIGNED: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Assigned', dot: 'bg-indigo-500' },
  READY: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Ready', dot: 'bg-emerald-500' },
  IN_PROGRESS: { bg: 'bg-green-100', text: 'text-green-700', label: 'In Progress', dot: 'bg-green-500 animate-pulse' },
  COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Completed' },
  CLOSED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Closed' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },

  // Availability/Admin Status (Image 4/5)
  HIGH_AVAILABILITY: { bg: 'bg-green-50', text: 'text-green-700', label: 'High Availability', dot: 'bg-green-500' },
  LIMITED: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Limited', dot: 'bg-amber-500' },
  CRITICAL_NEED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Critical Need', dot: 'bg-red-500' },
  PENDING_REVIEW: { bg: 'bg-gray-50', text: 'text-gray-500', label: 'Pending Review', dot: 'bg-gray-400' },
};

export default function StatusBadge({
  status,
  config = defaultStatusConfig,
  className = ''
}: StatusBadgeProps) {
  const cfg = config[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text} ${className}`}>
      {cfg.dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}
          aria-hidden="true"
        />
      )}
      {cfg.label}
    </span>
  );
}


