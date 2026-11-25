export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  attempt(key: string): Promise<RateLimitDecision>;
}

export interface RateLimitPolicy {
  limit: number;
  windowMs: number;
}

export const LEAD_RATE_LIMIT: RateLimitPolicy = { limit: 6, windowMs: 10 * 60 * 1000 };

export interface SlidingWindowOptions extends RateLimitPolicy {
  maxKeys?: number;
  now?: () => number;
}

const DEFAULT_MAX_KEYS = 10_000;

/**
 * Per-instance memory, so only a fallback until Upstash is configured:
 * serverless instances do not share it.
 */
export function createSlidingWindowRateLimiter({
  limit,
  windowMs,
  maxKeys = DEFAULT_MAX_KEYS,
  now = Date.now,
}: SlidingWindowOptions): RateLimiter {
  const attemptsByKey = new Map<string, number[]>();

  return {
    async attempt(key) {
      const currentTime = now();
      const recent = (attemptsByKey.get(key) ?? []).filter((time) => currentTime - time < windowMs);

      // Re-insert to keep the Map ordered by most recent activity.
      attemptsByKey.delete(key);

      if (recent.length >= limit) {
        attemptsByKey.set(key, recent);
        const oldest = recent[0] ?? currentTime;
        return { allowed: false, retryAfterSeconds: Math.ceil((oldest + windowMs - currentTime) / 1000) };
      }

      attemptsByKey.set(key, [...recent, currentTime]);
      evictLeastRecent(attemptsByKey, maxKeys);
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}

function evictLeastRecent(attemptsByKey: Map<string, number[]>, maxKeys: number): void {
  if (attemptsByKey.size <= maxKeys) return;
  const leastRecent = attemptsByKey.keys().next();
  if (!leastRecent.done) attemptsByKey.delete(leastRecent.value);
}
