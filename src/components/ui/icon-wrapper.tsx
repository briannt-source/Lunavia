import * as React from "react"

export interface IconWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function IconWrapper({ children, className }: IconWrapperProps) {
  return (
    <span className={className ?? ""}>
      {children}
    </span>
  )
}
