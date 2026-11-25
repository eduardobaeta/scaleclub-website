import { describe, expect, it } from 'vitest';
import type { Lead } from '../domain/lead';
import type { LeadGateway } from '../domain/lead-gateway';
import { newsletterSubscriptionSchema } from '../schemas/newsletter-subscription-schema';
import { HONEYPOT_FIELD, processLeadSubmission } from './process-lead-submission';

function createRecordingGateway(): LeadGateway & { submitted: Lead[] } {
  const submitted: Lead[] = [];
  return {
    submitted,
    async submit(lead) {
      submitted.push(lead);
    },
  };
}

const failingGateway: LeadGateway = {
  async submit() {
    throw new Error('Lead webhook responded with HTTP 500');
  },
};

const newsletterSubmission = (gateway: LeadGateway | null) => ({
  schema: newsletterSubscriptionSchema,
  toLead: (data: { email: string }): Lead => ({ type: 'newsletter-subscription', data }),
  resolveGateway: () => gateway,
});

describe('processLeadSubmission', () => {
  it('forwards a valid lead to the gateway', async () => {
    const gateway = createRecordingGateway();

    const result = await processLeadSubmission({ email: 'reader@example.com' }, newsletterSubmission(gateway));

    expect(result).toEqual({ status: 'accepted' });
    expect(gateway.submitted).toEqual([{ type: 'newsletter-subscription', data: { email: 'reader@example.com' } }]);
  });

  it('silently ignores submissions that fill the spam trap', async () => {
    const gateway = createRecordingGateway();

    const result = await processLeadSubmission(
      { email: 'reader@example.com', [HONEYPOT_FIELD]: 'https://spam.example' },
      newsletterSubmission(gateway),
    );

    expect(result).toEqual({ status: 'ignored' });
    expect(gateway.submitted).toEqual([]);
  });

  it('reports invalid fields without calling the gateway', async () => {
    const gateway = createRecordingGateway();

    const result = await processLeadSubmission({ email: 'not-an-email' }, newsletterSubmission(gateway));

    expect(result).toEqual({ status: 'invalid', fieldErrors: { email: [expect.any(String)] } });
    expect(gateway.submitted).toEqual([]);
  });

  it('returns a failure with a safe reason when the provider rejects the lead', async () => {
    const result = await processLeadSubmission({ email: 'reader@example.com' }, newsletterSubmission(failingGateway));

    expect(result).toEqual({ status: 'failed', reason: 'Lead webhook responded with HTTP 500' });
  });

  it('describes a normalized HTTP client error by its code only', async () => {
    const unavailableGateway: LeadGateway = {
      submit: () => Promise.reject({ code: 'unavailable' }),
    };

    const result = await processLeadSubmission(
      { email: 'reader@example.com' },
      newsletterSubmission(unavailableGateway),
    );

    expect(result).toEqual({ status: 'failed', reason: 'HTTP client error (unavailable)' });
  });

  it('reports an unconfigured destination only after the honeypot and validation pass', async () => {
    expect(await processLeadSubmission({ email: 'reader@example.com' }, newsletterSubmission(null))).toEqual({
      status: 'unavailable',
    });
    expect(await processLeadSubmission({ email: 'not-an-email' }, newsletterSubmission(null))).toMatchObject({
      status: 'invalid',
    });
    expect(
      await processLeadSubmission({ email: 'reader@example.com', [HONEYPOT_FIELD]: 'x' }, newsletterSubmission(null)),
    ).toEqual({ status: 'ignored' });
  });
});
