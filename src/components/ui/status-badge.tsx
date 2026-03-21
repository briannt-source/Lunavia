import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  APPROVED: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  NOT_SUBMITTED: {
    label: "Not Submitted",
    className: "bg-slate-100 text-slate-600 border-slate-300",
  },
  DRAFT: {
    label: "Draft",
    className: "bg-slate-100 text-slate-600 border-slate-300",
  },
  OPEN: {
    label: "Open",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  CLOSED: {
    label: "Closed",
    className: "bg-slate-100 text-slate-700 border-slate-300",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  AVAILABLE: {
    label: "Available",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  BUSY: {
    label: "Busy",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  ON_TOUR: {
    label: "On Tour",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  IN_REVIEW: {
    label: "Under Review",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  VERIFIED: {
    label: "Confirmed",
    className: "bg-green-100 text-green-700 border-green-300",
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-slate-100 text-slate-600 border-slate-300",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-700 border-green-300",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-slate-100 text-slate-600 border-slate-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}


