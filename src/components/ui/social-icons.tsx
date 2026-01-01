import * as React from "react"

export interface SocialIconsProps {
  children: React.ReactNode
  className?: string
}

export default function SocialIcons({ children, className }: SocialIconsProps) {
  return <div className={`flex space-x-6 ${className ?? ""}`}>{children}</div>
}
