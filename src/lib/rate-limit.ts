/**
 * Rate Limiting — In-Memory Sliding Window
 *
 * MVP implementation using in-memory Map.
 * For production, replace with Redis-based implementation.
 *
 * PROTECTED ACTIONS:
 * - Signup: 5 / 10min per IP
 * - Login fail: 5 / 10min per IP
 * - Withdraw: 3 / 10min per user
 * - Verification submit: 5 / 1hr per user
 */

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
    keyPrefix: string;
}

interface RateLimitEntry {
    timestamps: number[];
}

// In-memory store (replace with Redis for production)
const store = new Map<string, RateLimitEntry>();

// Cleanup interval: every 5 minutes, remove expired entries
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpired(windowMs: number): void {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    for (const [key, entry] of store.entries()) {
        entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);
        if (entry.timestamps.length === 0) {
            store.delete(key);
        }
    }
}

// ============================================
// RATE LIMIT CONFIGS
// ============================================

export const RATE_LIMITS = {
    SIGNUP: {
        maxRequests: 5,
        windowMs: 10 * 60 * 1000, // 10 minutes
        keyPrefix: 'signup',
    },
    LOGIN_FAIL: {
        maxRequests: 5,
        windowMs: 10 * 60 * 1000, // 10 minutes
        keyPrefix: 'login_fail',
    },
    WITHDRAW: {
        maxRequests: 3,
        windowMs: 10 * 60 * 1000, // 10 minutes
        keyPrefix: 'withdraw',
    },
    VERIFICATION_SUBMIT: {
        maxRequests: 5,
        windowMs: 60 * 60 * 1000, // 1 hour
        keyPrefix: 'verification',
    },
} as const satisfies Record<string, RateLimitConfig>;

// ============================================
// CORE FUNCTIONS
// ============================================

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfterMs: number;
}

/**
 * Check and consume a rate limit token.
 *
 * @param config - The rate limit configuration
 * @param identifier - IP address or user ID
 * @returns Whether the request is allowed, remaining count, and retry-after
 */
export function checkRateLimit(
    config: RateLimitConfig,
    identifier: string
): RateLimitResult {
    const key = `${config.keyPrefix}:${identifier}`;
    const now = Date.now();

    cleanupExpired(config.windowMs);

    // Get or create entry
    let entry = store.get(key);
    if (!entry) {
        entry = { timestamps: [] };
        store.set(key, entry);
    }

    // Remove expired timestamps
    entry.timestamps = entry.timestamps.filter(t => now - t < config.windowMs);

    // Check limit
    if (entry.timestamps.length >= config.maxRequests) {
        const oldestInWindow = entry.timestamps[0];
        const retryAfterMs = config.windowMs - (now - oldestInWindow);

        return {
            allowed: false,
            remaining: 0,
            retryAfterMs: Math.max(0, retryAfterMs),
        };
    }

    // Consume token
    entry.timestamps.push(now);

    return {
        allowed: true,
        remaining: config.maxRequests - entry.timestamps.length,
        retryAfterMs: 0,
    };
}

/**
 * Helper to create a rate limit error response (for API routes).
 */
export function rateLimitResponse(result: RateLimitResult) {
    const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000);

    return {
        error: 'Too many requests. Please try again later.',
        retryAfterSeconds,
    };
}
