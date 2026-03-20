import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory rate limiter for API routes.
 * Uses a sliding window counter per IP address.
 *
 * In production, replace with Redis-based limiter (e.g., Upstash Ratelimit).
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store) {
    if (record.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit?: number;
  /** Window duration in seconds */
  windowSeconds?: number;
  /** Optional key prefix for different route groups */
  prefix?: string;
}

/**
 * Check rate limit for a request.
 * Returns null if allowed, or a NextResponse 429 if rate-limited.
 */
export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions = {}
): NextResponse | null {
  const {
    limit = 60,
    windowSeconds = 60,
    prefix = 'global',
  } = options;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';

  const key = `${prefix}:${ip}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  let record = store.get(key);

  if (!record || record.resetAt < now) {
    record = { count: 1, resetAt: now + windowMs };
    store.set(key, record);
    return null;
  }

  record.count++;

  if (record.count > limit) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(record.resetAt / 1000)),
        },
      }
    );
  }

  return null;
}

/**
 * Higher-order function to wrap an API route handler with rate limiting.
 *
 * Usage:
 * ```ts
 * import { withRateLimit } from '@/lib/rate-limit';
 *
 * export const POST = withRateLimit(
 *   async (req: NextRequest) => {
 *     // ... your handler
 *   },
 *   { limit: 10, windowSeconds: 60 }
 * );
 * ```
 */
export function withRateLimit(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options: RateLimitOptions = {}
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const rateLimitResponse = checkRateLimit(req, options);
    if (rateLimitResponse) return rateLimitResponse;
    return handler(req, ...args);
  };
}

// Pre-configured limiters for common use cases
export const AUTH_RATE_LIMIT: RateLimitOptions = {
  limit: 10,
  windowSeconds: 300, // 10 attempts per 5 minutes
  prefix: 'auth',
};

export const UPLOAD_RATE_LIMIT: RateLimitOptions = {
  limit: 20,
  windowSeconds: 60,
  prefix: 'upload',
};

export const API_RATE_LIMIT: RateLimitOptions = {
  limit: 100,
  windowSeconds: 60,
  prefix: 'api',
};
