import * as React from "react"

export interface TableProps {
  className?: string
  children: React.ReactNode
}

export default function Table({ className, children }: TableProps) {
  return (
    <div className={className ?? ""}>
      <table className="w-full text-sm text-left">{children}</table>
    </div>
  )
}
