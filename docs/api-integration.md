# API Integration, Forms and Providers — Astro

> HTTP, error, result and environment rules are in [conventions.md §8–10](./conventions.md); the endpoint protections
> and their order are in [Security §2](./security.md). This document applies them to forms and providers.

## 1. Integration-neutral architecture

Forms are optional. A destination can be a CRM, spreadsheet webhook, e-mail service, internal API or queue — **no
provider is built into the standard**; each project chooses its own.

```text
HTML form (static page, works without JavaScript)
  → POST /api/<resource>                              src/pages/api/  (prerender = false)
    → content type, rate limit, body size, honeypot   features/<f>/http/
    → Zod schema                                      features/<f>/schemas/
      → use case (only if meaningful rules exist)     features/<f>/application/
        → gateway contract (when justified)           features/<f>/domain/
          → provider adapter (Axios server instance)  features/<f>/integrations/
```

The simplest site calls one validated adapter without a gateway interface or use case
([Architecture §4.3](./architecture.md)); the layered version is the **scalable option**, not a minimum.

## 2. Provider adapters

- Adapters use an instance from `src/server/http/create-http-client.ts` ([conventions.md §8](./conventions.md)) and
  confirm success explicitly: status **and** body when the provider answers 200 on errors.
- Real providers differ in authentication, payload, idempotency and response contracts. Write the adapter for the
  actual provider and never assume a CRM accepts the illustrative shape below.

## 3. Contract, schema and adapter (illustrative)

```ts
// src/features/leads/domain/lead.ts and lead-gateway.ts
export interface Lead {
  name: string;
  email: string;
}

export interface LeadGateway {
  /** Resolves only after the provider confirmed the lead. */
  submit(lead: Lead): Promise<void>;
}
```

```ts
// src/features/leads/schemas/lead-schema.ts
import { z } from 'astro/zod';

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
});
```

```ts
// src/server/http/create-http-client.ts — shared by every server integration
import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios';
import { toAppError } from '@/lib/api/errors';

export function createHttpClient(config: CreateAxiosDefaults): AxiosInstance {
  const client = axios.create({ timeout: 8_000, ...config });
  client.interceptors.response.use(undefined, (error: unknown) => Promise.reject(toAppError(error)));
  return client;
}
```

```ts
// src/features/leads/integrations/webhook-lead-gateway.ts
import { createHttpClient } from '@/server/http/create-http-client';
import type { Lead } from '../domain/lead';
import type { LeadGateway } from '../domain/lead-gateway';

export function createWebhookLeadGateway(url: string, token?: string): LeadGateway {
  const client = createHttpClient({ headers: token ? { authorization: `Bearer ${token}` } : {} });
  return {
    async submit(lead: Lead): Promise<void> {
      await client.post(url, lead); // non-2xx rejects with a normalized AppError
    },
  };
}
```

## 4. Endpoint

The page only wires the feature: `src/pages/api/leads.ts` sets `export const prerender = false` and
`export const POST: APIRoute = (context) => handleLeadRequest(context, rateLimiter)`, importing from `@/features/leads`.

```ts
// src/features/leads/http/handle-lead-request.ts
import type { APIContext } from 'astro';
import { LEAD_WEBHOOK_TOKEN, LEAD_WEBHOOK_URL } from 'astro:env/server';
import { z } from 'astro/zod';
import { isAppError, type AppError, type Result } from '@/lib/result';
import { createWebhookLeadGateway } from '../integrations/webhook-lead-gateway';
import { leadSchema } from '../schemas/lead-schema';
import type { RateLimiter } from './rate-limiter';
import { readBodyWithinLimit } from './read-body-within-limit';

const MAX_BODY_BYTES = 16 * 1024;
const HONEYPOT_FIELD = 'website';

export async function handleLeadRequest({ request, clientAddress }: APIContext, rateLimiter: RateLimiter) {
  const wantsJson = request.headers.get('accept')?.includes('application/json') ?? false;
  const succeed = () =>
    wantsJson
      ? Response.json({ ok: true, data: undefined } satisfies Result)
      : new Response(null, { status: 303, headers: { location: '/thank-you/' } });
  const fail = (status: number, error: AppError, headers?: HeadersInit) =>
    wantsJson
      ? Response.json({ ok: false, error } satisfies Result, { status, headers })
      : new Response('Submission failed', { status, headers });

  if (!request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
    return fail(415, { code: 'validation' });
  }
  const { allowed, retryAfterSeconds } = await rateLimiter.attempt(clientAddress);
  if (!allowed) return fail(429, { code: 'rate-limited', retryAfterSeconds }, { 'retry-after': `${retryAfterSeconds}` });

  const body = await readBodyWithinLimit(request, MAX_BODY_BYTES);
  if (body === null) return fail(413, { code: 'validation' });

  const fields = Object.fromEntries(new URLSearchParams(body));
  if (fields[HONEYPOT_FIELD]) return succeed();

  const parsed = leadSchema.safeParse(fields);
  if (!parsed.success) {
    return fail(wantsJson ? 422 : 400, { code: 'validation', fieldErrors: z.flattenError(parsed.error).fieldErrors });
  }
  if (!LEAD_WEBHOOK_URL) return fail(503, { code: 'unavailable' });

  try {
    await createWebhookLeadGateway(LEAD_WEBHOOK_URL, LEAD_WEBHOOK_TOKEN).submit(parsed.data);
  } catch (error) {
    console.error('[leads] provider failure:', isAppError(error) ? error.code : 'unknown');
    return fail(502, { code: 'unexpected' });
  }
  return succeed();
}
```

```ts
// src/features/leads/http/read-body-within-limit.ts
export async function readBodyWithinLimit(request: Request, maxBytes: number): Promise<string | null> {
  if (Number(request.headers.get('content-length') ?? 0) > maxBytes) return null;
  if (!request.body) return '';

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  let receivedBytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return text + decoder.decode();
    receivedBytes += value.byteLength;
    if (receivedBytes > maxBytes) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
}
```

- **Response contract:** enhanced requests (`Accept: application/json`) always get JSON with the shared `Result`
  (200, 413, 415, 422 with `fieldErrors`, 429, 502, 503). Native posts get a **303** to the confirmation page on
  success, so a refresh does not repost, and a short plain-text status on failure (400 for invalid fields); a project
  may redirect native failures to a prerendered error page that offers a fallback contact instead.
- **Body limit:** `request.formData()` buffers everything and `content-length` may be missing, so the body is read
  as a stream with a hard byte limit; `MAX_BODY_BYTES` fits the form (16 kB covers a contact form).
- **Rate limit:** a `RateLimiter` contract (`attempt(key)` → `{ allowed, retryAfterSeconds }`) keyed by
  `clientAddress`. The Upstash adapter (`Ratelimit.slidingWindow`, a prefix per endpoint, `new Redis({ url, token })`
  with credentials from `astro:env`) **fails open** — it allows and logs the attempt when Redis is unreachable.
  Without Redis credentials (local development) an in-memory sliding window takes its place, never in production.
- **Honeypot:** checked before validation; a filled one gets the normal success response and never reaches the
  provider, so bots learn nothing. Schemas use `z.object`, which strips unknown fields: they are never forwarded.
- **Logs** carry a safe category (`[leads] provider failure: timeout`), never fields, payloads or client addresses.

## 5. Form markup and progressive enhancement

```astro
<form method="POST" action="/api/leads/" data-lead-form>
  <label for="lead-name">Name</label>
  <input id="lead-name" name="name" autocomplete="name" required />
  <label for="lead-email">Email</label>
  <input id="lead-email" name="email" type="email" autocomplete="email" required />
  <div class="sr-only" aria-hidden="true">
    <label>Website <input name="website" tabindex="-1" autocomplete="off" /></label>
  </div>
  <button type="submit">Submit</button>
  <p role="status" data-form-status></p>
</form>
```

- The honeypot wrapper is visually hidden with CSS, not with `hidden` or `display: none`, which many bots skip.
- `src/lib/submit-form.ts` posts `new URLSearchParams(new FormData(form))` with `Accept: application/json`: a raw
  `FormData` body would be `multipart/form-data` and get `415`. It returns the parsed `Result`, or a `network` error.
- The enhancement script (in `features/<f>/components/`) disables the submit button while sending and shows success
  **only** after `{ ok: true }`. On `validation` it sets `aria-invalid` on each field in `fieldErrors`, links the
  field's error text with `aria-describedby` and moves focus to the first invalid field; the `role="status"` region
  announces success and failure.
- Copy for every state comes from `src/config`, in the product language.

## 6. Other integrations

| Integration | Rule |
| --- | --- |
| CMS content | A content-layer loader in `src/content.config.ts` fetches at build time. |
| CMS publishing | The CMS publish webhook calls a Vercel Deploy Hook; its URL is a secret kept in the CMS. |
| CMS drafts | Only through a protected preview route ([Authorization §2](./authorization.md)). |
| CMS freshness | ISR (`isr` with `bypassToken` in the Vercel adapter) only when rebuild latency is unacceptable: it renders those pages on demand. |
| Analytics | One provider per project; events from [conventions.md §12](./conventions.md); consent where required; `generate_lead` once per confirmed submission. |
| Maps, video, embeds | Lazy-load, use privacy-friendly embed modes, reserve space to avoid layout shift. |
| Webhooks received | Rules in [Authorization §2](./authorization.md). |

## 7. OpenAPI

When a provider publishes a trustworthy OpenAPI spec, generate the SDK with **Hey API** (`@hey-api/openapi-ts`; its
`@hey-api/client-axios` plugin is bundled, no separate install) and configure it with the provider's server instance
(`client.setConfig({ axios })`). Keep the reviewed snapshot in `contracts/`; never edit generated output.

## 8. Astro Actions

Forms use endpoints. Calling an Astro Action from an HTML form requires an on-demand-rendered page, and Actions return
`{ data, error }` rather than `Result`. Use Actions only for JavaScript calls from islands, mapped to `Result` at the
call site, with the same validation and limits.
