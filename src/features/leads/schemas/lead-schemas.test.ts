import { describe, expect, it } from 'vitest';
import { ebookRequestSchema } from './ebook-request-schema';
import { mentoringApplicationSchema } from './mentoring-application-schema';
import { meetingRequestSchema } from './meeting-request-schema';

describe('lead schemas', () => {
  it('accepts a meeting request without WhatsApp and normalizes the phone when present', () => {
    expect(meetingRequestSchema.parse({ name: 'Ana', email: 'Ana@Example.com', whatsapp: '', consent: 'on' })).toEqual({
      name: 'Ana',
      email: 'ana@example.com',
      whatsapp: undefined,
      consent: 'on',
    });
    expect(
      meetingRequestSchema.parse({ name: 'Ana', email: 'ana@example.com', whatsapp: '(11) 99999-9999', consent: 'on' })
        .whatsapp,
    ).toBe('11999999999');
  });

  it('requires WhatsApp, company, role and consent in the mentoring application', () => {
    const result = mentoringApplicationSchema.safeParse({ name: 'Ana', email: 'ana@example.com' });

    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(['whatsapp', 'company', 'role', 'consent']);
  });

  it('accepts only the listed team sizes', () => {
    const base = { name: 'Ana', email: 'a@b.co', whatsapp: '11999999999', company: 'X', role: 'Sócia', consent: 'on' };

    expect(mentoringApplicationSchema.safeParse({ ...base, teamSize: '5-20' }).success).toBe(true);
    expect(mentoringApplicationSchema.safeParse({ ...base, teamSize: '1000' }).success).toBe(false);
  });

  it('requires consent for the ebook and keeps Instagram optional', () => {
    expect(ebookRequestSchema.safeParse({ name: 'Ana', email: 'ana@example.com', consent: 'on' }).success).toBe(true);
    expect(ebookRequestSchema.safeParse({ name: 'Ana', email: 'ana@example.com' }).success).toBe(false);
  });
});
