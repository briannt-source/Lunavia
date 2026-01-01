import * as React from "react"

export interface StatCardProps {
  label: React.ReactNode
  value: React.ReactNode
  subtitle?: React.ReactNode
  trend?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export default function StatCard({ label, value, subtitle, trend, icon, className }: StatCardProps) {
  return (
    <div className={`bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm ${className ?? ""}`}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-text-sec-light dark:text-text-sec-dark text-sm font-medium">{label}</p>
        {trend}
      </div>
      <p className="text-2xl font-bold text-text-main-light dark:text-text-main-dark tracking-tight">{value}</p>
      {subtitle}
    </div>
  )
}
