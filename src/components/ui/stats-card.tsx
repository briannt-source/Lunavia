import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: "up" | "down";
  trendValue?: string;
  description?: string;
  subtitle?: string;
  href?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  description,
  subtitle,
  href,
  className,
}: StatsCardProps) {
  const content = (
    <div
      className={cn(
        "bg-white rounded-lg border border-slate-200 p-6 shadow-sm transition-shadow",
        href ? "hover:shadow-md cursor-pointer" : "",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {trend && trendValue && (
            <div
              className={cn(
                "flex items-center mt-2 text-xs font-medium",
                trend === "up" ? "text-emerald-600" : "text-red-600"
              )}
            >
              {trend === "up" ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {trendValue}
            </div>
          )}
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="ml-4 p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}



