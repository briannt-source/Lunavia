import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  // If no icon, render simple version (for compatibility)
  if (!Icon) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex-1">
          {typeof title === "string" ? (
            <div className="font-medium">{title}</div>
          ) : (
            title
          )}
          {description && (
            <p className="text-sm text-slate-600 mt-1">
              {typeof description === "string" ? description : description}
            </p>
          )}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    );
  }

  // Full version with icon
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <div className="rounded-full bg-slate-100 p-4 mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      {typeof title === "string" ? (
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      ) : (
        <div className="text-lg font-semibold text-slate-900 mb-2">{title}</div>
      )}
      {description && (
        <div className="text-sm text-slate-600 text-center max-w-md mb-6">
          {typeof description === "string" ? description : description}
        </div>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;








