import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { RateLimiter, RateLimitPolicy } from '../http/rate-limiter';

export interface SlidingWindowStore {
  limit(identifier: string): Promise<{ success: boolean; reset: number }>;
}

export interface UpstashRateLimiterOptions {
  url: string;
  token: string;
  prefix: string;
  policy: RateLimitPolicy;
}

export function createUpstashRateLimiter({ url, token, prefix, policy }: UpstashRateLimiterOptions): RateLimiter {
  const store = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(policy.limit, `${policy.windowMs} ms`),
    prefix,
  });
  return rateLimiterFromStore(store);
}

export interface StoreAdapterOptions {
  now?: () => number;
  logError?: (message: string) => void;
}

/** Fails open: a Redis outage must never block real visitors. */
export function rateLimiterFromStore(
  store: SlidingWindowStore,
  { now = Date.now, logError = console.error }: StoreAdapterOptions = {},
): RateLimiter {
  return {
    async attempt(key) {
      try {
        const { success, reset } = await store.limit(key);
        if (success) return { allowed: true, retryAfterSeconds: 0 };
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((reset - now()) / 1000)) };
      } catch {
        logError('[leads] rate limiter unavailable; attempt allowed');
        return { allowed: true, retryAfterSeconds: 0 };
      }
    },
  };
}
