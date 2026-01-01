import * as React from "react"

export interface CheckListItemProps {
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export default function CheckListItem({ icon, children, className }: CheckListItemProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      {icon ? <span>{icon}</span> : null}
      {children}
    </div>
  )
}
