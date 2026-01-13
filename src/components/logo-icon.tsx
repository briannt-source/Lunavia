"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LogoIconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LogoIcon({ className, size = "md" }: LogoIconProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn(
      "relative rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg",
      sizeClasses[size],
      className
    )}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full p-2"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* S Letter */}
        <path
          d="M25 30 Q30 25 35 25 Q40 25 40 30 Q40 35 35 35 Q30 35 30 40 Q30 45 35 45 Q40 45 40 50 Q40 55 35 55 Q30 55 25 50"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Y Letter */}
        <path
          d="M55 25 L65 40 L65 50 Q65 55 60 55 Q55 55 55 50 L55 40 Z M60 40 L70 25"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Waves */}
        <path
          d="M15 70 Q25 65 35 70 T55 70 T75 70"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        <path
          d="M20 80 Q30 75 40 80 T60 80 T80 80"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}












