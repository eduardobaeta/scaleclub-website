import type { APIRoute } from 'astro';
import type { z } from 'astro/zod';
import type { AppErrorCode, Result } from '@/lib/result';
import { processLeadSubmission, type LeadSubmissionResult } from '../application/process-lead-submission';
import type { Lead } from '../domain/lead';
import type { LeadGateway } from '../domain/lead-gateway';
import type { RateLimiter } from './rate-limiter';

export const MAX_BODY_BYTES = 16 * 1024;
const FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded';
const UNKNOWN_CLIENT = 'unknown';

export interface LeadRequestOptions<Schema extends z.ZodType> {
  schema: Schema;
  toLead: (data: z.output<Schema>) => Lead;
  resolveGateway: () => LeadGateway | null;
  successRedirect: string;
  errorRedirect: string;
  rateLimiter: RateLimiter;
  /** Receives safe diagnostics only (never the submitted fields or client addresses). */
  logError?: (message: string) => void;
}

export interface LeadRequest {
  request: Request;
  clientAddress?: string;
}

/** Cross-site posts never reach this handler: Astro's `security.checkOrigin` rejects them first. */
export async function handleLeadRequest<Schema extends z.ZodType>(
  { request, clientAddress = UNKNOWN_CLIENT }: LeadRequest,
  {
    schema,
    toLead,
    resolveGateway,
    successRedirect,
    errorRedirect,
    rateLimiter,
    logError = console.error,
  }: LeadRequestOptions<Schema>,
): Promise<Response> {
  const reply = createReplier(request, successRedirect, errorRedirect);

  if (!request.headers.get('content-type')?.includes(FORM_CONTENT_TYPE)) return reply.failure(415, 'validation');

  const rateLimit = await rateLimiter.attempt(clientAddress);
  if (!rateLimit.allowed) {
    logError('[leads] rate limit exceeded');
    return reply.rateLimited(rateLimit.retryAfterSeconds);
  }

  const body = await readBodyWithinLimit(request, MAX_BODY_BYTES);
  if (body === null) return reply.failure(413, 'validation');

  const fields = Object.fromEntries(new URLSearchParams(body));
  const result = await processLeadSubmission(fields, { schema, toLead, resolveGateway });
  if (result.status === 'unavailable') logError('[leads] destination is not configured');
  if (result.status === 'failed') logError(`[leads] provider failure: ${result.reason}`);

  return reply.result(result);
}

export function createLeadRoute<Schema extends z.ZodType>(options: LeadRequestOptions<Schema>): APIRoute {
  return (context) =>
    handleLeadRequest({ request: context.request, clientAddress: readClientAddress(context) }, options);
}

/** `clientAddress` throws when the adapter cannot resolve it; fall back to a shared key. */
function readClientAddress(context: { clientAddress: string }): string {
  try {
    return context.clientAddress;
  } catch {
    return UNKNOWN_CLIENT;
  }
}

async function readBodyWithinLimit(request: Request, maxBytes: number): Promise<string | null> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > maxBytes) return null;
  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    receivedBytes += value.byteLength;
    if (receivedBytes > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  return new TextDecoder().decode(concatenate(chunks, receivedBytes));
}

function concatenate(chunks: Uint8Array[], totalBytes: number): Uint8Array {
  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

function createReplier(request: Request, successRedirect: string, errorRedirect: string) {
  const wantsJson = request.headers.get('accept')?.includes('application/json') ?? false;

  const json = (status: number, body: Result) => Response.json(body, { status });
  const redirect = (location: string) => new Response(null, { status: 303, headers: { location } });

  const failure = (status: number, code: AppErrorCode) =>
    wantsJson ? json(status, { ok: false, error: { code } }) : redirect(errorRedirect);

  const rateLimited = (retryAfterSeconds: number) => {
    const response = wantsJson
      ? json(429, { ok: false, error: { code: 'rate-limited', retryAfterSeconds } })
      : redirect(errorRedirect);
    response.headers.set('retry-after', String(retryAfterSeconds));
    return response;
  };

  const result = (outcome: LeadSubmissionResult): Response => {
    switch (outcome.status) {
      case 'accepted':
      case 'ignored':
        return wantsJson ? json(200, { ok: true, data: undefined }) : redirect(successRedirect);
      case 'invalid':
        return wantsJson
          ? json(422, { ok: false, error: { code: 'validation', fieldErrors: outcome.fieldErrors } })
          : redirect(errorRedirect);
      case 'unavailable':
        return failure(503, 'unavailable');
      case 'failed':
        return failure(502, 'unexpected');
    }
  };

  return { failure, rateLimited, result };
}
