import { describe, expect, it } from 'vitest';
import { newsletterSubscriptionSchema } from './newsletter-subscription-schema';

describe('newsletterSubscriptionSchema', () => {
  it('accepts a valid e-mail and normalizes it', () => {
    const result = newsletterSubscriptionSchema.safeParse({ email: '  Reader@Example.com ' });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe('reader@example.com');
  });

  it.each(['', 'reader', 'reader@', `${'a'.repeat(250)}@example.com`])('rejects %j', (email) => {
    expect(newsletterSubscriptionSchema.safeParse({ email }).success).toBe(false);
  });
});
