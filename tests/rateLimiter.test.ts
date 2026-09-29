import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRateLimiter } from '../src/engine/security/rateLimiter';

describe('MemoryRateLimiter Security Unit Tests', () => {
  let limiter: MemoryRateLimiter;

  beforeEach(() => {
    limiter = new MemoryRateLimiter(5, 1000); // 5 requests per 1000ms window
  });

  it('allows requests within the limit', () => {
    for (let i = 1; i <= 5; i++) {
      const res = limiter.isRateLimited('test-client-1');
      expect(res.limited).toBe(false);
      expect(res.current).toBe(i);
      expect(res.retryAfterSeconds).toBe(0);
    }
  });

  it('rejects requests that exceed the limit with retryAfterSeconds', () => {
    for (let i = 1; i <= 5; i++) {
      limiter.isRateLimited('test-client-2');
    }

    const res = limiter.isRateLimited('test-client-2');
    expect(res.limited).toBe(true);
    expect(res.current).toBe(6);
    expect(res.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('tracks different keys independently', () => {
    for (let i = 1; i <= 5; i++) {
      limiter.isRateLimited('client-a');
    }
    expect(limiter.isRateLimited('client-a').limited).toBe(true);

    // Client B should still be allowed
    const resB = limiter.isRateLimited('client-b');
    expect(resB.limited).toBe(false);
    expect(resB.current).toBe(1);
  });

  it('supports custom limits per call', () => {
    const res1 = limiter.isRateLimited('vip-client', 2);
    expect(res1.limited).toBe(false);
    const res2 = limiter.isRateLimited('vip-client', 2);
    expect(res2.limited).toBe(false);
    const res3 = limiter.isRateLimited('vip-client', 2);
    expect(res3.limited).toBe(true);
  });
});
