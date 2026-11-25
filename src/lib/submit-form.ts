import { isResult, type Result } from '@/lib/result';

const TIMEOUT_MS = 15_000;

/** The one fetch-based client helper the standard allows: pages that ship no Axios stay light. */
export async function submitForm(form: HTMLFormElement): Promise<Result<unknown>> {
  const fields = new URLSearchParams();
  new FormData(form).forEach((value, key) => {
    if (typeof value === 'string') fields.append(key, value);
  });

  let response: Response;
  try {
    response = await fetch(form.action, {
      method: 'POST',
      headers: { accept: 'application/json' },
      body: fields,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError';
    return { ok: false, error: { code: timedOut ? 'timeout' : 'network' } };
  }

  const body: unknown = await response.json().catch(() => null);
  return isResult(body) ? body : { ok: false, error: { code: 'unexpected' } };
}
