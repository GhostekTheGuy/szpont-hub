/**
 * In-memory sliding window rate limiter.
 * Each instance tracks a separate action (register, upload, etc.).
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    entry.timestamps = entry.timestamps.filter((t: number) => now - t < 600_000);
    if (entry.timestamps.length === 0) store.delete(key);
  });
}, 300_000);

interface RateLimitConfig {
  /** Max requests in the window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterSeconds: number | null;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= config.limit) {
    const oldest = entry.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  entry.timestamps.push(now);
  return {
    success: true,
    remaining: config.limit - entry.timestamps.length,
    retryAfterSeconds: null,
  };
}

/**
 * Extract a client identifier from the request.
 * Uses X-Forwarded-For (behind proxy) or falls back to a generic key.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const real = request.headers.get('x-real-ip');
  if (real) return real;

  return 'unknown';
}
