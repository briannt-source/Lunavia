import React, { ReactNode } from 'react';

interface TooltipProps {
    content: string;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, children, position = 'top' }: TooltipProps) {
    // Simple CSS-only tooltip for stability without extra deps
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    return (
        <div className="group relative inline-flex">
            {children}
            <div className={`
        pointer-events-none absolute z-50 w-max max-w-xs rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-xl
        ${positionClasses[position]}
      `}>
                {content}
                {/* Arrow (optional, simple CSS triangle if needed, skipping for minimalism) */}
            </div>
        </div>
    );
}
