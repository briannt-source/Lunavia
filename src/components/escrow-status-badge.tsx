"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, Lock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type EscrowStatus = "PENDING" | "LOCKED" | "RELEASED" | "REFUNDED" | "CANCELLED";

interface EscrowStatusBadgeProps {
  status: EscrowStatus;
  className?: string;
}

export function EscrowStatusBadge({ status, className }: EscrowStatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      label: "Pending Lock",
      variant: "secondary" as const,
      icon: Shield,
      color: "bg-gray-100 text-gray-800",
    },
    LOCKED: {
      label: "Locked",
      variant: "default" as const,
      icon: Lock,
      color: "bg-blue-100 text-blue-800",
    },
    RELEASED: {
      label: "Released",
      variant: "default" as const,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-800",
    },
    REFUNDED: {
      label: "Refunded",
      variant: "outline" as const,
      icon: XCircle,
      color: "bg-orange-100 text-orange-800",
    },
    CANCELLED: {
      label: "Cancelled",
      variant: "destructive" as const,
      icon: AlertCircle,
      color: "bg-red-100 text-red-800",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.color} ${className || ""}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

