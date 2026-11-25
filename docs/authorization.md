# Authorization — Astro

> Astro websites under this standard have **no user accounts**. This document makes that boundary explicit and lists
> the little access control a site still needs.

## 1. What this standard does not do

- No sign-in, sessions, user profiles, roles, organizations or per-user content.
- No database owned by the site.
- No "admin area" inside the website.

These are out of scope for this standard: do not add an auth library to an Astro site to work around this.

## 2. Access control that does exist

| Case | Rule |
| --- | --- |
| Form endpoints (`/api/*`) | Public by design. Protected by validation, size limits, rate limiting, honeypot/Turnstile and `checkOrigin` (see [Security §2](./security.md)). |
| Webhooks received by the site | Verify the provider signature on the raw body, reject stale or replayed events, process idempotently; failures answer `unauthenticated` (401). |
| CMS draft previews | Server-side preview token validated in an on-demand route; responses are `noindex` and never cached publicly. |
| Preview deployments | Vercel Deployment Protection when they show unreleased content; always `noindex`. |
| Internal tools (dashboards, editors) | Use the provider's own UI (CMS, spreadsheet, analytics); never build them into the site. |

Provider tokens follow the secret rules in [Security §1](./security.md).

## 3. Tests

Cover endpoint behavior for missing or invalid tokens and signatures (Vitest), and verify preview routes are not
indexed (Playwright).
