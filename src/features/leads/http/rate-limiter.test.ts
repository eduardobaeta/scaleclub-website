import { describe, expect, it } from 'vitest';
import { createSlidingWindowRateLimiter } from './rate-limiter';

function createClock(start = 0) {
  let time = start;
  return { now: () => time, advance: (ms: number) => (time += ms) };
}

describe('createSlidingWindowRateLimiter', () => {
  it('allows attempts up to the limit and blocks the next one', async () => {
    const clock = createClock();
    const limiter = createSlidingWindowRateLimiter({ limit: 2, windowMs: 60_000, now: clock.now });

    expect((await limiter.attempt('client')).allowed).toBe(true);
    expect((await limiter.attempt('client')).allowed).toBe(true);
    expect(await limiter.attempt('client')).toEqual({ allowed: false, retryAfterSeconds: 60 });
  });

  it('allows again once the oldest attempt leaves the window', async () => {
    const clock = createClock();
    const limiter = createSlidingWindowRateLimiter({ limit: 2, windowMs: 60_000, now: clock.now });
    await limiter.attempt('client');
    clock.advance(30_000);
    await limiter.attempt('client');

    expect(await limiter.attempt('client')).toEqual({ allowed: false, retryAfterSeconds: 30 });
    clock.advance(30_000);
    expect((await limiter.attempt('client')).allowed).toBe(true);
  });

  it('counts each key separately', async () => {
    const limiter = createSlidingWindowRateLimiter({ limit: 1, windowMs: 60_000, now: createClock().now });

    expect((await limiter.attempt('first')).allowed).toBe(true);
    expect((await limiter.attempt('second')).allowed).toBe(true);
    expect((await limiter.attempt('first')).allowed).toBe(false);
  });

  it('forgets the least recent key when the key limit is reached', async () => {
    const limiter = createSlidingWindowRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2, now: createClock().now });
    await limiter.attempt('first');
    await limiter.attempt('second');
    await limiter.attempt('third');

    expect((await limiter.attempt('first')).allowed).toBe(true);
    expect((await limiter.attempt('third')).allowed).toBe(false);
  });
});
