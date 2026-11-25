import type { z } from 'astro/zod';
import { isAppError } from '@/lib/result';
import type { Lead } from '../domain/lead';
import type { LeadGateway } from '../domain/lead-gateway';

export const HONEYPOT_FIELD = 'website';

export type FormFields = Record<string, string>;

export type LeadSubmissionResult =
  | { status: 'accepted' }
  /** Spam trap triggered: answer like a success so bots learn nothing. */
  | { status: 'ignored' }
  | { status: 'invalid'; fieldErrors: Record<string, string[]> }
  | { status: 'unavailable' }
  | { status: 'failed'; reason: string };

export interface LeadSubmission<Schema extends z.ZodType> {
  schema: Schema;
  toLead: (data: z.output<Schema>) => Lead;
  /** Returns `null` when the destination is not configured. */
  resolveGateway: () => LeadGateway | null;
}

/** Never throws: every outcome is returned for the HTTP boundary to map. */
export async function processLeadSubmission<Schema extends z.ZodType>(
  fields: FormFields,
  { schema, toLead, resolveGateway }: LeadSubmission<Schema>,
): Promise<LeadSubmissionResult> {
  if (fields[HONEYPOT_FIELD]) return { status: 'ignored' };

  const parsed = schema.safeParse(fields);
  if (!parsed.success) return { status: 'invalid', fieldErrors: fieldErrorsOf(parsed.error) };

  const gateway = resolveGateway();
  if (!gateway) return { status: 'unavailable' };

  try {
    await gateway.submit(toLead(parsed.data));
    return { status: 'accepted' };
  } catch (error) {
    return { status: 'failed', reason: describeFailure(error) };
  }
}

function fieldErrorsOf(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? '');
    if (field) (fieldErrors[field] ??= []).push(issue.message);
  }
  return fieldErrors;
}

/** Safe diagnostic for logs: never includes submitted fields. */
function describeFailure(error: unknown): string {
  if (isAppError(error)) return `HTTP client error (${error.code})`;
  if (error instanceof Error) return error.message;
  return 'Unknown provider error';
}
