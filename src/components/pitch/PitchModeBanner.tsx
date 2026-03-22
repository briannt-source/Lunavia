'use client';

import { isPitchMode, DEMO_WATERMARK } from '@/lib/pitch-mode';

/**
 * Pitch Mode Banner
 * 
 * Displays a subtle watermark when in demo/pitch mode.
 * Only visible when PITCH_MODE is enabled.
 */
export default function PitchModeBanner() {
    if (!isPitchMode()) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-gradient-to-r from-[#5BA4CF] to-purple-600 px-4 py-2 text-center text-sm font-medium text-white shadow-lg">
            <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white"></span>
                <span>{DEMO_WATERMARK}</span>
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white"></span>
            </div>
        </div>
    );
}
