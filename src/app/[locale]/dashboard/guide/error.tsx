'use client';

import { useEffect } from 'react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Dashboard Error]', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
                <p className="text-sm text-gray-500">
                    {error.message || 'An unexpected error occurred. Please try again.'}
                </p>
                {error.digest && (
                    <p className="text-xs text-gray-400 font-mono">Error ID: {error.digest}</p>
                )}
                <div className="flex gap-3 justify-center pt-2">
                    <button
                        onClick={reset}
                        className="px-5 py-2.5 bg-lunavia-primary hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition active:scale-[0.98]"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
