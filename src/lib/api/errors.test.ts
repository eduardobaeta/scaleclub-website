import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { toAppError } from './errors';

function responseError(status: number, headers: Record<string, string> = {}): AxiosError {
  const response = { status, headers: new AxiosHeaders(headers) } as AxiosResponse; // test fixture: only the read fields
  return new AxiosError(`HTTP ${status}`, AxiosError.ERR_BAD_RESPONSE, undefined, undefined, response);
}

describe('toAppError', () => {
  it.each([
    [400, 'validation'],
    [401, 'unauthenticated'],
    [403, 'forbidden'],
    [404, 'not-found'],
    [409, 'conflict'],
    [422, 'validation'],
    [500, 'unavailable'],
    [503, 'unavailable'],
    [418, 'unexpected'],
  ])('maps HTTP %i to %s', (status, code) => {
    expect(toAppError(responseError(status))).toEqual({ code });
  });

  it('keeps Retry-After on rate limiting', () => {
    expect(toAppError(responseError(429, { 'retry-after': '30' }))).toEqual({
      code: 'rate-limited',
      retryAfterSeconds: 30,
    });
  });

  it('distinguishes timeouts from network failures', () => {
    expect(toAppError(new AxiosError('timeout', AxiosError.ECONNABORTED))).toEqual({ code: 'timeout' });
    expect(toAppError(new AxiosError('offline', AxiosError.ERR_NETWORK))).toEqual({ code: 'network' });
  });

  it('treats anything else as unexpected', () => {
    expect(toAppError(new Error('boom'))).toEqual({ code: 'unexpected' });
  });
});
