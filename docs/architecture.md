# Architecture — Astro Websites and Landing Pages

> **Scope:** landing pages, institutional websites, campaign pages, portfolios and content sites. Static-first, no
> user accounts, dashboards or per-user data, few integrations. Stack and library matrix:
> [conventions.md §2](./conventions.md).

## 1. Decision order

**Correctness and security** (including privacy and accessibility) → **simplicity** (KISS, YAGNI) →
**separation of concerns** at boundaries that matter → **explicit trade-offs** → **measured quality**.

Projects share engineering patterns, never a forced visual style. Do not read this standard as a requirement to
build a full enterprise Clean Architecture for a single-page site.

## 2. Rendering model and configuration

- Prerender public pages as HTML. Ship no client JavaScript unless a behavior requires it.
- Hydrate isolated islands only when native browser capabilities and small scripts are insufficient.
- Use on-demand server execution (`export const prerender = false`) only for form submissions, secure API calls or
  genuinely dynamic paths. Never switch every page to on-demand rendering because one endpoint exists.
- Keep secrets and external authorization entirely server-side.

```text
Browser
  ├── GET /, /services/        → prebuilt HTML/CSS/assets from the CDN
  └── POST /api/<resource>     → Vercel Function: limits, spam checks, Zod, provider adapter (confirmed success)
```

```js
// astro.config.mjs (illustrative — match the installed Astro and adapter versions)
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

// astro:env is not available in this file; loadEnv also reads .env files.
const { SITE_URL, VERCEL_PROJECT_PRODUCTION_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = SITE_URL || (VERCEL_PROJECT_PRODUCTION_URL ? `https://${VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
// In `astro dev`, staticHeaders sends a CSP without the build's hashes and blocks inline styles.
const isBuild = process.argv.includes('build');

export default defineConfig({
  site,
  trailingSlash: 'always',
  adapter: vercel({ staticHeaders: isBuild }), // only when the site has on-demand endpoints
  security: { checkOrigin: true, csp: true },
  integrations: site ? [sitemap()] : [],
  env: {
    schema: {
      LEAD_WEBHOOK_URL: envField.string({ context: 'server', access: 'secret', optional: true, url: true }),
      LEAD_WEBHOOK_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      VERCEL_ENV: envField.enum({
        context: 'server',
        access: 'public',
        values: ['development', 'preview', 'production'],
        optional: true,
      }),
    },
  },
  vite: { plugins: [tailwindcss()] },
});
```

- `site` comes from `SITE_URL` or Vercel's production domain; never guess a production domain. `VERCEL_ENV` drives
  indexing ([SEO and performance §1](./seo-and-performance.md)).
- Purely static sites deploy to Vercel without an adapter. CSP and headers: [Security §4](./security.md).

## 3. Project structure

This table is the shared folder vocabulary; create a directory only when there is a responsibility to place in it.
At the root: `astro.config.mjs`, `tsconfig.json` (strict, `"@/*"` → `"src/*"`), `package.json` / `bun.lock`,
`docs/` and `AGENTS.md` / `CLAUDE.md`. Import rules: [conventions.md §7](./conventions.md).

| Folder | Holds | Must not hold |
| --- | --- | --- |
| `src/pages/` | Routes, HTTP endpoints (`api/`), request/response wiring, page composition | Provider protocol details, business rules |
| `src/layouts/` | `BaseLayout`: document shell, metadata, fonts, skip link | Page-specific content |
| `src/components/ui/` | Generic, brand-neutral, accessible primitives | Client branding, copy, secrets, orchestration |
| `src/components/layout/` | Shells, header, footer, navigation | Page-specific content |
| `src/components/sections/` | Marketing page sections fed by props from `src/config` | API calls with secrets, reusable domain services |
| `src/features/<feature>/components/` | Feature UI and its enhancement scripts | Provider calls |
| `src/features/<feature>/schemas/` | Zod schemas for untrusted input, forms and params | Vendor SDK calls |
| `src/features/<feature>/hooks/`, `stores/` | React hooks and Zustand stores (islands) | Server-only code |
| `src/features/<feature>/application/` | Use cases and orchestration | HTTP responses, vendor HTTP details |
| `src/features/<feature>/domain/` | Types, pure rules, policies, contracts | Network calls, framework imports |
| `src/features/<feature>/integrations/` | Server-side adapters to third-party providers | Markup, presentation state |
| `src/features/<feature>/http/` | Request parsing, body limits and response mapping shared by endpoints | Business decisions |
| `src/features/<feature>/index.ts` | Public API of the feature (explicit named exports) | `export *` |
| `src/lib/` | Technical infrastructure shared by pages and islands: env, browser Axios instance (`api/`), `submit-form.ts`, `result.ts`, utilities | Server-only code |
| `src/config/` | Site identity, navigation, page content, routes | Secrets, logic |
| `src/content/` | Content collection entries (collections and loaders in `src/content.config.ts`) | Secrets |
| `src/assets/` | Images, brand SVGs, custom icons and local font files, processed by Astro | Files that must keep their URL |
| `src/scripts/` | Site-wide client enhancements (motion, analytics) | Server imports |
| `src/styles/` | `globals.css`, `tokens.css`, `typography.css` | Component-specific brand values |
| `src/server/` | Server-only code: the HTTP client factory (`http/`) and integrations shared by features (`integrations/`) | Anything a client script imports |
| `public/` | Files served unchanged: favicon, social preview image | Images and fonts Astro should process |
| `contracts/` | OpenAPI snapshot (when consuming) | Edited generated output |
| `tests/` | Integration, E2E, fakes, fixtures and setup ([conventions.md §11](./conventions.md)) | Production data or credentials |

Astro keeps plain pages and components: static pages and small islands gain nothing from view models.

**Small-site exception:** a page with a simple, non-sensitive interaction does not need `features/`, contracts or use
cases. Resist creating layers only because this document shows them.

## 4. Engineering principles

The required principles are in `AGENTS.md` §9; this section adds how to apply them.

### 4.1 Clean Code

- Name things for their purpose; avoid `Manager`, `Helper`, `Utils` when a specific name exists.
- Prefer composition and plain functions; classes only for genuinely stateful behavior.
- Avoid duplication, but do not abstract on the first repeated line.
- No non-null assertions or casts that hide uncertainty without a documented reason.
- Keep side effects and integration details at boundaries. Never swallow errors silently.

### 4.2 Practical SOLID

| Principle | Application | Avoid |
| --- | --- | --- |
| **S** | Endpoint parses/responds; use case applies rules; adapter talks to the provider | One endpoint mixing validation, credentials, mapping and markup |
| **O** | Add an adapter or variant when an extension point has proven value | Plugin systems before a second scenario exists |
| **L** | Implementations honor their contract and observable behavior | Subtype hierarchies for ordinary components |
| **I** | Small provider contracts (`submit(lead)`) | God interfaces every implementation must stub |
| **D** | Use cases depend on a purposeful contract, not the vendor client | Interfaces for every local function |

### 4.3 Choosing the abstraction level

| Scenario | Design |
| --- | --- |
| Static landing page, no forms | Pages, layouts, UI primitives, tokens |
| One simple form | Endpoint + schema + one focused provider adapter |
| Several forms sharing rules | Feature module with a testable use case |
| Several providers, retries, enrichment | Domain contract + injected adapters + use case + integration tests |
| Accounts, dashboards, user data | Out of scope for this standard |

### 4.4 Object Calisthenics as heuristics

Keep nesting shallow, prefer early returns, wrap primitives only when real invariants exist, avoid long coupled call
chains, use full English names, keep modules cohesive. Never degrade readability to satisfy a slogan; explain the
concrete improvement a rule brings.

## 5. Evolution

Review this standard when changing major framework versions, adding a server runtime or adopting a shared
design-system package; do not silently propagate breaking changes into existing projects.

## References

- Astro on-demand rendering: https://docs.astro.build/en/guides/on-demand-rendering/
- Astro Vercel adapter: https://docs.astro.build/en/guides/integrations-guide/vercel/
- Astro environment variables (`astro:env`): https://docs.astro.build/en/guides/environment-variables/
