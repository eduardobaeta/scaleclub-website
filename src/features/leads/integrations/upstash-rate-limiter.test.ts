import { describe, expect, it } from 'vitest';
import { rateLimiterFromStore, type SlidingWindowStore } from './upstash-rate-limiter';

const NOW = 1_000_000;
const store = (result: { success: boolean; reset: number }): SlidingWindowStore => ({ limit: async () => result });

describe('rateLimiterFromStore', () => {
  it('allows an attempt the store accepts', async () => {
    const limiter = rateLimiterFromStore(store({ success: true, reset: NOW + 60_000 }), { now: () => NOW });

    expect(await limiter.attempt('203.0.113.7')).toEqual({ allowed: true, retryAfterSeconds: 0 });
  });

  it('blocks a rejected attempt until the window resets', async () => {
    const limiter = rateLimiterFromStore(store({ success: false, reset: NOW + 42_500 }), { now: () => NOW });

    expect(await limiter.attempt('203.0.113.7')).toEqual({ allowed: false, retryAfterSeconds: 43 });
  });

  it('fails open and logs when the store is unreachable', async () => {
    const logged: string[] = [];
    const unreachable: SlidingWindowStore = { limit: () => Promise.reject(new Error('fetch failed')) };
    const limiter = rateLimiterFromStore(unreachable, { logError: (message) => logged.push(message) });

    expect(await limiter.attempt('203.0.113.7')).toEqual({ allowed: true, retryAfterSeconds: 0 });
    expect(logged).toEqual(['[leads] rate limiter unavailable; attempt allowed']);
  });
});
