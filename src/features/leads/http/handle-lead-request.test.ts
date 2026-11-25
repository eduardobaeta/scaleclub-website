import { describe, expect, it } from 'vitest';
import type { Lead } from '../domain/lead';
import type { LeadGateway } from '../domain/lead-gateway';
import { newsletterSubscriptionSchema } from '../schemas/newsletter-subscription-schema';
import { handleLeadRequest, MAX_BODY_BYTES, type LeadRequestOptions } from './handle-lead-request';
import { createSlidingWindowRateLimiter } from './rate-limiter';

const ENDPOINT = 'https://site.example/api/newsletter-subscriptions';
const FORM_TYPE = 'application/x-www-form-urlencoded';

const acceptingGateway: LeadGateway = { async submit() {} };
const failingGateway: LeadGateway = {
  async submit() {
    throw new Error('Lead webhook responded with HTTP 502');
  },
};

function options(overrides: Partial<LeadRequestOptions<typeof newsletterSubscriptionSchema>> = {}) {
  const logged: string[] = [];
  const config: LeadRequestOptions<typeof newsletterSubscriptionSchema> = {
    schema: newsletterSubscriptionSchema,
    toLead: (data): Lead => ({ type: 'newsletter-subscription', data }),
    resolveGateway: () => acceptingGateway,
    successRedirect: '/thank-you/newsletter-subscription/',
    errorRedirect: '/form-error/',
    rateLimiter: createSlidingWindowRateLimiter({ limit: 100, windowMs: 60_000 }),
    logError: (message) => logged.push(message),
    ...overrides,
  };
  return { config, logged };
}

function formRequest(body: string, headers: Record<string, string> = {}) {
  return new Request(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': FORM_TYPE, ...headers },
    body,
  });
}

const jsonRequest = (body: string, headers: Record<string, string> = {}) =>
  formRequest(body, { accept: 'application/json', ...headers });

describe('handleLeadRequest', () => {
  it('answers JSON success to an enhanced submission', async () => {
    const response = await handleLeadRequest({ request: jsonRequest('email=reader%40example.com') }, options().config);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it('redirects a native submission to the success page', async () => {
    const response = await handleLeadRequest({ request: formRequest('email=reader%40example.com') }, options().config);

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/thank-you/newsletter-subscription/');
  });

  it('reports field errors for an enhanced submission', async () => {
    const response = await handleLeadRequest({ request: jsonRequest('email=invalid') }, options().config);

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      ok: false,
      error: { code: 'validation', fieldErrors: { email: [expect.any(String)] } },
    });
  });

  it('sends a native submission with invalid fields to the error page', async () => {
    const response = await handleLeadRequest({ request: formRequest('email=invalid') }, options().config);

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/form-error/');
  });

  it('returns 502 and logs only a safe reason when the provider fails', async () => {
    const { config, logged } = options({ resolveGateway: () => failingGateway });

    const response = await handleLeadRequest({ request: jsonRequest('email=reader%40example.com') }, config);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ ok: false, error: { code: 'unexpected' } });
    expect(logged).toEqual(['[leads] provider failure: Lead webhook responded with HTTP 502']);
    expect(logged.join()).not.toContain('reader@example.com');
  });

  it('returns 503 when no destination is configured', async () => {
    const { config, logged } = options({ resolveGateway: () => null });

    const response = await handleLeadRequest({ request: jsonRequest('email=reader%40example.com') }, config);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, error: { code: 'unavailable' } });
    expect(logged).toHaveLength(1);
  });

  it('checks the honeypot and the fields before reporting a missing destination', async () => {
    const { config } = options({ resolveGateway: () => null });

    const invalid = await handleLeadRequest({ request: jsonRequest('email=invalid') }, config);
    const spam = await handleLeadRequest({ request: jsonRequest('email=bot%40example.com&website=x') }, config);

    expect(invalid.status).toBe(422);
    expect(spam.status).toBe(200);
  });

  it('refuses unsupported content types', async () => {
    const request = jsonRequest('{"email":"reader@example.com"}', { 'content-type': 'application/json' });

    expect((await handleLeadRequest({ request }, options().config)).status).toBe(415);
  });

  it('answers 429 with Retry-After once a client exceeds the rate limit', async () => {
    const { config, logged } = options({ rateLimiter: createSlidingWindowRateLimiter({ limit: 1, windowMs: 60_000 }) });
    const send = (clientAddress: string) =>
      handleLeadRequest({ request: jsonRequest('email=reader%40example.com'), clientAddress }, config);

    expect((await send('203.0.113.7')).status).toBe(200);
    const limited = await send('203.0.113.7');

    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBe('60');
    expect(await limited.json()).toEqual({ ok: false, error: { code: 'rate-limited', retryAfterSeconds: 60 } });
    expect((await send('198.51.100.4')).status).toBe(200);
    expect(logged).toEqual(['[leads] rate limit exceeded']);
  });

  it('refuses bodies larger than the limit', async () => {
    const request = jsonRequest(`email=${'a'.repeat(MAX_BODY_BYTES)}`);

    expect((await handleLeadRequest({ request }, options().config)).status).toBe(413);
  });
});
