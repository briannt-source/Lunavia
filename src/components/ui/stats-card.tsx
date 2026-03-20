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
        "bg-white rounded-xl border border-gray-100 p-6 animate-fade-in",
        "transition-all duration-200",
        href ? "cursor-pointer" : "",
        className
      )}
      style={{
        boxShadow: 'var(--shadow-xs)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
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
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="ml-4 p-3 rounded-xl trust-gradient">
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
