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
    label: "Đã duyệt",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PENDING: {
    label: "Đang chờ",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  REJECTED: {
    label: "Từ chối",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  NOT_SUBMITTED: {
    label: "Chưa nộp",
    className: "bg-slate-100 text-slate-600 border-slate-300",
  },
  DRAFT: {
    label: "Bản nháp",
    className: "bg-slate-100 text-slate-600 border-slate-300",
  },
  OPEN: {
    label: "Đang mở",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  CLOSED: {
    label: "Đã đóng",
    className: "bg-slate-100 text-slate-700 border-slate-300",
  },
  IN_PROGRESS: {
    label: "Đang diễn ra",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  ACCEPTED: {
    label: "Đã chấp nhận",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  AVAILABLE: {
    label: "Sẵn sàng",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  BUSY: {
    label: "Bận",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  ON_TOUR: {
    label: "Đang tour",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  IN_REVIEW: {
    label: "Đang xem xét",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  RESOLVED: {
    label: "Đã giải quyết",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  VERIFIED: {
    label: "Đã xác nhận",
    className: "bg-green-100 text-green-700 border-green-300",
  },
  INACTIVE: {
    label: "Không hoạt động",
    className: "bg-slate-100 text-slate-600 border-slate-300",
  },
  ACTIVE: {
    label: "Đang hoạt động",
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


