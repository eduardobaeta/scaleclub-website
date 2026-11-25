import { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } from 'astro:env/server';
import { createSlidingWindowRateLimiter, LEAD_RATE_LIMIT, type RateLimiter } from '../http/rate-limiter';
import { createUpstashRateLimiter } from './upstash-rate-limiter';

export function createConfiguredRateLimiter(endpoint: string): RateLimiter {
  if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
    return createUpstashRateLimiter({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
      prefix: `scaleclub:leads:${endpoint}`,
      policy: LEAD_RATE_LIMIT,
    });
  }
  return createSlidingWindowRateLimiter(LEAD_RATE_LIMIT);
}
