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
    console.error('[DashboardError]', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-4">🔧</div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Error
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
          Something went wrong loading this page. Your data is safe.
        </p>
        {process.env.NODE_ENV === 'development' && error?.message && (
          <pre className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs text-left overflow-auto mb-4 max-h-32">
            {error.message}
          </pre>
        )}
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
