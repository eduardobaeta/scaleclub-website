import { isAxiosError } from 'axios';
import type { AppError, AppErrorCode } from '@/lib/result';

const CODES_BY_STATUS: Record<number, AppErrorCode> = {
  400: 'validation',
  401: 'unauthenticated',
  403: 'forbidden',
  404: 'not-found',
  409: 'conflict',
  422: 'validation',
  429: 'rate-limited',
};

export function toAppError(error: unknown): AppError {
  if (!isAxiosError(error)) return { code: 'unexpected' };
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return { code: 'timeout' };

  const status = error.response?.status;
  if (status === undefined) return { code: 'network' };

  const code = CODES_BY_STATUS[status] ?? (status >= 500 ? 'unavailable' : 'unexpected');
  const retryAfterSeconds = Number(error.response?.headers['retry-after']);
  return code === 'rate-limited' && retryAfterSeconds > 0 ? { code, retryAfterSeconds } : { code };
}
