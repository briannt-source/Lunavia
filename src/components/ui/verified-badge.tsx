import React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  type?: "KYC" | "KYB";
  className?: string;
}

export function VerifiedBadge({ type = "KYC", className }: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        "bg-emerald-50 text-emerald-700 border border-emerald-200",
        className
      )}
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      {type} Verified
    </span>
  );
}








