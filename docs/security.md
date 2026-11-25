# Security, Privacy and Reliability — Astro

> A static site has a small attack surface: its server endpoints, its third-party scripts and its secrets. Protect
> those three. Environment variable rules are in [conventions.md §10](./conventions.md).

## 1. Secrets

- Never put tokens, webhook URLs with secrets or API keys in `PUBLIC_` variables, client scripts, HTML, URLs or logs.
- Real values live in Vercel, separate for Development, Preview and Production; previews use test providers, never
  production CRMs.
- Use least-privilege provider credentials and rotate them when people or vendors change.

## 2. Server endpoints

Every on-demand endpoint (`src/pages/api/*`) applies, in this order (sample in
[API integration §4](./api-integration.md)):

1. **Origin check** — Astro `security.checkOrigin` (on by default; never disable it) rejects cross-site form posts.
2. **Content type** — accept only the formats the endpoint expects (`415` otherwise).
3. **Rate limit** — **Upstash Ratelimit** (`@upstash/ratelimit` + Redis from the Vercel Marketplace), keyed by client
   address and prefixed per endpoint; answer `429` with `Retry-After`. It fails open (allows and logs) when Redis is
   unreachable. An in-memory limiter is only a fallback while Redis is not configured, because serverless instances
   do not share memory.
4. **Body size** — read the body with a hard byte limit (`413` above it), even when `content-length` is missing.
5. **Spam** — honeypot field on every public form, checked before validation; a filled one gets the normal success
   response and never reaches the provider. Add **Cloudflare Turnstile** (verified server-side) when bots get
   through. Vercel Firewall rules are an additional edge layer, not a replacement.
6. **Validation** — Zod schema on every field; unknown fields are stripped and never forwarded.
7. **Provider call** — timeout, confirmed success, idempotency key where supported.
8. **Response** — shared `Result` shape / status codes; no stack traces or provider details.

## 3. Privacy and logging

- Collect only what the form needs. State purpose and retention in the privacy notice; collect consent where the
  jurisdiction requires it. Never fabricate consent.
- Never log names, e-mails, phones, message bodies, tokens, client addresses or full request bodies. Log safe
  categories (provider status, error code) and correlation IDs.
- Analytics and other third-party scripts that need consent load only after it is given.

## 4. Third-party scripts and headers

- Every third-party script needs a reason and an owner.
- **Content-Security-Policy:** enable `security.csp` in `astro.config.mjs` (stable since Astro 6). Astro hashes its
  own scripts and styles; list third-party script, style, image, font and connect origins in `directives`. Astro
  emits the policy as a `<meta>` tag, which browsers apply without `frame-ancestors` or reporting directives; with the
  Vercel adapter, `staticHeaders` sends it as a response header for prerendered pages instead. Enable it only for
  `astro build`: in `astro dev` it sends a policy without the build's hashes and blocks inline styles.
- Astro does not hash `is:inline` scripts. Keep the script in a constant, render it with
  `<script is:inline set:html={script} />` and add its hash with `Astro.csp?.insertScriptHash('sha256-…')`, computed
  from the same constant with `node:crypto`. Check the built pages for CSP violations: `astro dev` applies no policy.
- `vercel.json` `headers` add, on every route: `Content-Security-Policy: frame-ancestors 'none'` (or the allowed
  embedders), `Strict-Transport-Security` (production domain), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin` and a minimal `Permissions-Policy`.

## 5. Reliability

- Use timeouts and clear error paths for every provider call; show the visitor a fallback contact (e.g. phone).
- When losing a submission is unacceptable, persist it first (queue or provider with retries) and document it.
- Detect duplicates with idempotency keys or provider-side deduplication where business rules require it.

## 6. Release checklist

- [ ] No secrets in the repository, client bundle, HTML, URLs or logs.
- [ ] Endpoints enforce origin, content type, rate limit, body size, spam checks and validation.
- [ ] Provider success is confirmed before the visitor sees success.
- [ ] Security headers and CSP verified on the deployed preview.
- [ ] Privacy notice and consent match the data actually collected.

## References

- Astro `security` options: https://docs.astro.build/en/reference/configuration-reference/#security
- Upstash Ratelimit: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
