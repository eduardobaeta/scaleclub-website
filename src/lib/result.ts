export const APP_ERROR_CODES = [
  'validation',
  'unauthenticated',
  'forbidden',
  'not-found',
  'conflict',
  'rate-limited',
  'unavailable',
  'timeout',
  'network',
  'unexpected',
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

export type AppError = {
  code: AppErrorCode;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  retryAfterSeconds?: number;
};

export type Result<T = void> = { ok: true; data: T } | { ok: false; error: AppError };

export function isAppError(value: unknown): value is AppError {
  if (typeof value !== 'object' || value === null || !('code' in value)) return false;
  if (!APP_ERROR_CODES.some((code) => code === value.code)) return false;
  return !('fieldErrors' in value) || value.fieldErrors === undefined || isFieldErrors(value.fieldErrors);
}

export function isResult(value: unknown): value is Result<unknown> {
  if (typeof value !== 'object' || value === null || !('ok' in value)) return false;
  if (value.ok === true) return true;
  return value.ok === false && 'error' in value && isAppError(value.error);
}

function isFieldErrors(value: unknown): value is Record<string, string[]> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  return Object.values(value).every(
    (messages) => Array.isArray(messages) && messages.every((message) => typeof message === 'string'),
  );
}
