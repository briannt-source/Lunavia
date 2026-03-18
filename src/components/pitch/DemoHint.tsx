'use client';

import { useState, useEffect } from 'react';
import { isPitchMode } from '@/lib/pitch-mode';

interface Props {
    id: string; // Unique ID for localStorage
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'inline';
}

/**
 * Demo Hint
 * 
 * Dismissible contextual hint shown only in Pitch Mode.
 * Persists dismissal in localStorage.
 */
export default function DemoHint({ id, children, position = 'inline' }: Props) {
    const [dismissed, setDismissed] = useState(true); // Default hidden until we check
    const storageKey = `demo-hint-dismissed-${id}`;

    useEffect(() => {
        // Only show in pitch mode
        if (!isPitchMode()) {
            setDismissed(true);
            return;
        }

        // Check localStorage
        const wasDismissed = localStorage.getItem(storageKey) === 'true';
        setDismissed(wasDismissed);
    }, [storageKey]);

    const handleDismiss = () => {
        localStorage.setItem(storageKey, 'true');
        setDismissed(true);
    };

    if (dismissed) {
        return null;
    }

    const positionClasses = {
        top: 'mb-4',
        bottom: 'mt-4',
        inline: '',
    };

    return (
        <div className={`relative rounded-lg border border-indigo-200 bg-indigo-50 p-4 ${positionClasses[position]}`}>
            <button
                onClick={handleDismiss}
                className="absolute right-2 top-2 text-indigo-400 hover:text-indigo-600"
                aria-label="Dismiss hint"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        💡
                    </span>
                </div>
                <div className="flex-1 text-sm text-indigo-800">
                    {children}
                </div>
            </div>
        </div>
    );
}

/**
 * Common demo hints for reuse
 */
export const DEMO_HINTS = {
    TRUST_SYSTEM: 'Lunavia blocks unverified guides automatically to protect operators. Trust scores update based on tour completion, no-shows, and incidents.',
    LIFECYCLE: 'Tours follow a strict lifecycle: Published → Assigned → Check-in → In Progress → Completed → Payment → Closed',
    PAYMENT_FLOW: 'Guides request payment after tour completion. Operators confirm with receipt upload. No direct financial transactions on platform.',
    VERIFICATION: 'KYC for guides, KYB for operators. All users must verify before accessing core features.',
    GUIDE_MATCHING: 'Guides apply to published tours. Operators select based on trust score, availability, and past performance.',
} as const;
