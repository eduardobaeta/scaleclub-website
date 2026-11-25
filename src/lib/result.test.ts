import { describe, expect, it } from 'vitest';
import { isAppError, isResult } from './result';

describe('isResult', () => {
  it.each([
    ['a success', { ok: true }],
    ['a success with data', { ok: true, data: { id: 1 } }],
    ['a failure', { ok: false, error: { code: 'unavailable' } }],
    ['a failure with field errors', { ok: false, error: { code: 'validation', fieldErrors: { email: ['Invalid'] } } }],
  ])('accepts %s', (_description, value) => {
    expect(isResult(value)).toBe(true);
  });

  it.each([
    ['null', null],
    ['an unrelated object', { status: 'success' }],
    ['a failure without error', { ok: false }],
    ['an unknown error code', { ok: false, error: { code: 'teapot' } }],
    ['malformed field errors', { ok: false, error: { code: 'validation', fieldErrors: { email: 'Invalid' } } }],
  ])('rejects %s', (_description, value) => {
    expect(isResult(value)).toBe(false);
  });
});

describe('isAppError', () => {
  it('recognizes errors by their shared code', () => {
    expect(isAppError({ code: 'timeout' })).toBe(true);
    expect(isAppError(new Error('timeout'))).toBe(false);
  });
});
