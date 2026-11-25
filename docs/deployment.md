# Deployment, Environments and Releases — Astro

## 1. Hosting model

Static pages on the Vercel CDN; on-demand endpoints as Vercel Functions through `@astrojs/vercel` (only when the site
has them). Purely static sites deploy without an adapter. Do not add functions to a fully static project without a
reason.

## 2. Environments and variables

- Separate **Development**, **Preview** and **Production** values in Vercel ([conventions.md §10](./conventions.md)).
  Previews use test providers and are `noindex`; protect them with Vercel Deployment Protection when they show
  unreleased content. `vercel env pull` brings Development values into a local `.env`.

```dotenv
# .env.example
SITE_URL=                  # canonical origin; optional on Vercel (production domain detected)
LEAD_WEBHOOK_URL=          # server secret, only if the site has forms
LEAD_WEBHOOK_TOKEN=        # server secret, when the destination expects a bearer token
UPSTASH_REDIS_REST_URL=    # rate limiting
UPSTASH_REDIS_REST_TOKEN=
```

- Redis credentials: declare in `astro:env` the names the Redis store actually injects (a Vercel Marketplace store may
  provide `KV_REST_API_URL` / `KV_REST_API_TOKEN` instead) and pass them to `new Redis({ url, token })`;
  `Redis.fromEnv()` bypasses the schema.
- `site` comes from `SITE_URL` or `VERCEL_PROJECT_PRODUCTION_URL` ([Architecture §2](./architecture.md)); indexing
  depends on `VERCEL_ENV === 'production'`. Never guess production domains.

## 3. Pipeline

```text
Branch / pull request
  → bun install --frozen-lockfile
  → lint → format:check → typecheck → test → build → test:e2e (journeys touched)
  → Vercel Preview: responsive, accessibility, SEO and integration smoke checks (test providers)
  → merge to the release branch
  → Vercel Production → post-deploy verification and monitoring
```

- Bun installs and runs scripts; Node.js LTS (`engines.node`) runs the build and functions.
- `astro preview` serves only adapter-less builds. With the Vercel adapter, run endpoints locally with `astro dev`
  and use a Preview deployment for production-like checks; for an Astro project `vercel dev` only wraps `astro dev`.
- CMS-driven sites rebuild on publish through a Vercel Deploy Hook ([API integration §6](./api-integration.md)).

## 4. Release checklist

- [ ] Canonical domain, `site`, sitemap and robots correct; previews not indexed.
- [ ] Environment variables set per environment; no secrets in `PUBLIC_` variables.
- [ ] Forms tested on Preview against test providers; production provider confirmed after release.
- [ ] Security headers, CSP, HTTPS and redirects (including old URLs of a replaced site) verified.
- [ ] Core Web Vitals and JS budget within targets; error monitoring and logs reachable.
- [ ] Rollback path known (Vercel deployment history).

## 5. Operations

Monitor function errors, durations, rate-limit hits and provider failures. Configure regions deliberately when data
residency or latency matters; do not guess a universal region.

## References

- Vercel environment variables: https://vercel.com/docs/environment-variables
- Astro Vercel adapter: https://docs.astro.build/en/guides/integrations-guide/vercel/
