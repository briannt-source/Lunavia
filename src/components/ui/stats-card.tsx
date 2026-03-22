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
        "relative bg-white rounded-xl border border-gray-100/80 p-6 animate-fade-in overflow-hidden group",
        "transition-all duration-300 ease-out",
        href ? "cursor-pointer" : "",
        className
      )}
      style={{
        boxShadow: 'var(--shadow-xs)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(46, 139, 192, 0.12)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'rgba(46, 139, 192, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(243, 244, 246, 0.8)';
      }}
    >
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2E8BC0] via-[#5BA4CF] to-[#2E8BC0] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 font-display">{value}</p>
          {trend && trendValue && (
            <div
              className={cn(
                "flex items-center mt-2 text-xs font-semibold",
                trend === "up" ? "text-emerald-600" : "text-red-600"
              )}
            >
              {trend === "up" ? (
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 mr-1" />
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
        <div className="ml-4 icon-badge">
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
