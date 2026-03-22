import React from 'react';

interface VerificationBadgeProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function VerificationBadge({ className = '', size = 'md' }: VerificationBadgeProps) {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    return (
        <div className={`inline-flex items-center justify-center text-lunavia-primary ${className}`} title="Identity Verified">
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className={sizeClasses[size]}
                aria-label="Verified"
            >
                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.114-1.32.314C14.79 2.665 13.518 2 12 2s-2.79.665-3.452 1.816c-.4-.2-.85-.314-1.32-.314-2.108 0-3.818 1.788-3.818 3.998 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.998 3.818 3.998.47 0 .92-.114 1.32-.314C9.21 21.335 10.482 22 12 22s2.79-.665 3.452-1.816c.4.2.85.314 1.32.314 2.108 0 3.818-1.788 3.818-3.998 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zM9.7 16l-3.2-3.3 1.4-1.42 1.8 1.9 5.2-5.9 1.4 1.5-6.6 7.22z" />
            </svg>
        </div>
    );
}
