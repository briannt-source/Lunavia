"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LogoIconProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export function LogoIcon({ className, size = "md" }: LogoIconProps) {
  const sizeClasses = {
    xs: "h-7 w-7",
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  return (
    <div className={cn(
      "relative rounded-xl bg-gradient-to-br from-[#0096C7] to-[#0077B6] flex items-center justify-center shadow-lg shadow-[#0077B6]/20",
      sizeClasses[size],
      className
    )}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full p-1.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Compass needle */}
        <path
          d="M50 18 L56 48 L50 55 L44 48 Z"
          fill="white"
          opacity="0.95"
        />
        <path
          d="M50 55 L56 48 L50 82 L44 48 Z"
          fill="white"
          opacity="0.5"
        />
        {/* Compass circle */}
        <circle
          cx="50"
          cy="50"
          r="28"
          stroke="white"
          strokeWidth="2"
          opacity="0.4"
          fill="none"
        />
        {/* Cardinal dots */}
        <circle cx="50" cy="20" r="2.5" fill="white" opacity="0.9" />
        <circle cx="80" cy="50" r="2" fill="white" opacity="0.6" />
        <circle cx="20" cy="50" r="2" fill="white" opacity="0.6" />
        {/* Wave accent */}
        <path
          d="M20 75 Q30 68 40 75 T60 75 T80 75"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M25 83 Q35 77 45 83 T65 83 T85 83"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
