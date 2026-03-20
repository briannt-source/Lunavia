'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
          padding: '2rem',
        }}>
          <div style={{
            maxWidth: '480px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              An unexpected error occurred. Our team has been notified.
            </p>
            {process.env.NODE_ENV === 'development' && error?.message && (
              <pre style={{
                background: '#1e293b',
                padding: '1rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                textAlign: 'left',
                overflow: 'auto',
                marginBottom: '1.5rem',
                color: '#f87171',
              }}>
                {error.message}
              </pre>
            )}
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
