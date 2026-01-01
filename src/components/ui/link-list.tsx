import * as React from "react"

export interface LinkListProps {
  title: React.ReactNode
  children: React.ReactNode
  className?: string
}

export default function LinkList({ title, children, className }: LinkListProps) {
  return (
    <div className={`flex flex-col gap-3 ${className ?? ""}`}>
      <h4 className="text-white font-bold text-sm uppercase tracking-wider">{title}</h4>
      {children}
    </div>
  )
}
