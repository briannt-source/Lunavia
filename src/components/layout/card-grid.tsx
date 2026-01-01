import * as React from "react"

export interface CardGridProps {
  children: React.ReactNode
  className?: string
}

export default function CardGrid({ children, className }: CardGridProps) {
  return <div className={className ?? "grid grid-cols-1 gap-5"}>{children}</div>
}
