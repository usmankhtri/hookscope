/**
 * Sliding window in-memory rate limiter per endpoint token and client IP.
 */

interface RateBucket {
  count: number;
  resetAt: number;
}

export class MemoryRateLimiter {
  private buckets = new Map<string, RateBucket>();
  private readonly defaultWindowMs = 60 * 1000; // 1 minute
  private readonly defaultLimit = 120; // 120 requests per minute

  constructor(private limit: number = 120, private windowMs: number = 60 * 1000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  isRateLimited(key: string, customLimit?: number): { limited: boolean; current: number; limit: number; retryAfterSeconds: number } {
    const now = Date.now();
    const effectiveLimit = customLimit ?? this.limit;
    let bucket = this.buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      bucket = {
        count: 1,
        resetAt: now + this.windowMs,
      };
      this.buckets.set(key, bucket);
      return { limited: false, current: 1, limit: effectiveLimit, retryAfterSeconds: 0 };
    }

    bucket.count++;

    if (bucket.count > effectiveLimit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      return { limited: true, current: bucket.count, limit: effectiveLimit, retryAfterSeconds };
    }

    return { limited: false, current: bucket.count, limit: effectiveLimit, retryAfterSeconds: 0 };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, bucket] of this.buckets.entries()) {
      if (now >= bucket.resetAt) {
        this.buckets.delete(key);
      }
    }
  }
}

export const globalRateLimiter = new MemoryRateLimiter(
  parseInt(process.env.RATE_LIMIT_PER_MINUTE || '120', 10),
  60 * 1000
);
