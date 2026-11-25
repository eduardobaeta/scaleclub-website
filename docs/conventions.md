# Engineering Conventions — Astro

> The rules every project of this standard follows: baseline, libraries, tooling, naming, source layout, HTTP,
> errors, configuration, tests and delivery. The other documents in `docs/` apply them per area and link here.

## 1. Baseline

- **TypeScript `strict`**, **Zod** (`astro/zod`) for runtime validation, **English** for code.
- Versions are pinned in `package.json` and `bun.lock`, never in the standard.

## 2. Library matrix

`When needed` = the only approved choice once the need exists.

| Concern | Standard |
| --- | --- |
| UI components | `.astro` components; React islands via `@astrojs/react` with shadcn/ui (when needed) |
| Styling | Tailwind CSS 4 through `@tailwindcss/vite` (§15) |
| Icons | Lucide: `@lucide/astro` in `.astro` files, `lucide-react` in islands (§16) |
| Fonts | Astro Fonts API (§16) |
| Forms and validation | Native HTML forms + progressive enhancement; Zod (`astro/zod`) |
| Routing and URL state | File-based `src/pages`; `URLSearchParams` + Zod in scripts; nuqs (React adapter) in islands (when needed) |
| Client state | Zustand vanilla store across islands; TanStack Query for remote data in an island (when needed) |
| HTTP | Axios on the server (when the site has integrations) and in islands; `submit-form.ts` for form enhancement (§8) |
| OpenAPI | Hey API: `@hey-api/openapi-ts` with its bundled `@hey-api/client-axios` plugin (when needed) |
| Dates | `Intl` |
| Motion | CSS first; GSAP (+ ScrollTrigger, SplitText); Lenis smooth scrolling opt-in (§17) |
| Abuse protection | Upstash Ratelimit on form endpoints; honeypot; Cloudflare Turnstile (when needed) |
| SEO | `@astrojs/sitemap` |
| Operations | Vercel logs and Speed Insights; Sentry (`@sentry/astro`, when needed) |
| Tests | Vitest; Playwright + `@axe-core/playwright`; MSW and React Testing Library (when needed) |
| Internationalization | Decided per project |

Do not add a second library for a concern listed here (no fetch-based client next to Axios apart from the form
helper, no Framer Motion next to GSAP, no second icon set) unless the listed library cannot meet a concrete need;
explain it in the pull request.

## 3. Package manager and runtime

- **Bun** installs dependencies and runs scripts: `bun install`, `bun run <script>`, `bunx <tool>`. Commit `bun.lock`;
  CI uses `bun install --frozen-lockfile`. Declare `"packageManager": "bun@<version>"` in `package.json`.
- **Node.js LTS** runs the dev server, builds and Vercel Functions. Pin it with `.nvmrc` and `engines.node`; Vercel
  reads `engines.node` (or the project setting) and installs with Bun when it finds `bun.lock`.
- Tests run through `bun run test`. Never use `bun test` (Bun's own runner).

## 4. Scripts

| Script | Command |
| --- | --- |
| `dev` / `build` | `astro dev` / `astro build` |
| `preview` | `astro preview`, adapter-less sites only; with the Vercel adapter use a Preview deployment ([Deployment §3](./deployment.md)) |
| `lint` | `eslint .` |
| `format` / `format:check` | `prettier --write .` / `prettier --check .` |
| `typecheck` | `astro check` |
| `test` | `vitest run` (unit and integration tests, never E2E) |
| `test:watch` / `test:coverage` | `vitest` / `vitest run --coverage` |
| `test:e2e` | `playwright test` |
| `verify` | lint → format:check → typecheck → test → build |

`api:generate` generates an SDK from a provider OpenAPI contract when the site consumes one. Only run scripts that
exist in `package.json`.

## 5. Linting, formatting and editor settings

- **ESLint flat config** (`eslint.config.js`) with `typescript-eslint`, `eslint-config-prettier` and
  `eslint-plugin-astro`. The import boundaries of section 7 are `no-restricted-imports` errors from the first commit.
- **Prettier** (`prettier.config.mjs`): `printWidth: 120`, `singleQuote: true`, `semi: true`, `trailingComma: 'all'`;
  plugins `prettier-plugin-astro` and `prettier-plugin-tailwindcss` (always last), with
  `tailwindStylesheet: './src/styles/globals.css'` so class sorting knows the project's theme and utilities.
- `.editorconfig`: UTF-8, LF, 2-space indentation, final newline.
- Formatting is never argued in review: `format:check` runs in CI.

## 6. Naming

| Item | Convention | Examples |
| --- | --- | --- |
| Files, directories, identifiers, tests, configuration | **English** | — |
| Components (`.astro`, `.tsx`) | `PascalCase` | `SiteHeader.astro`, `LeadForm.astro` |
| Every other module, directory and URL segment | `kebab-case` | `lead-schema.ts`, `features/visit-requests/`, `/privacy-policy` |
| Functions, variables / types, interfaces and contracts | `camelCase` / `PascalCase`, no `I` prefix | `submitLead`, `LeadGateway` |
| True constants, environment variables | `UPPER_SNAKE_CASE` | `MAX_BODY_BYTES`, `LEAD_WEBHOOK_URL` |
| Unit, component and integration tests / E2E tests | `<module>.test.ts(x)` / `<journey>.spec.ts` | `lead-schema.test.ts`, `contact-form.spec.ts` |
| Documents | `kebab-case.md`; `AGENTS.md`, `CLAUDE.md`, `README.md` keep their names | `docs/design-system.md`, `docs/integrations/payment-provider.md` |

Framework-required names stay as the framework defines them (`index.astro`, `[slug].astro`, `astro.config.mjs`,
`AGENTS.md`, `CLAUDE.md`, `README.md`). Generated files are never renamed or edited.

### Comments

Code must read on its own: clear names, small functions and precise types do the explaining. Write a comment or a
doc comment (summary) **only where it is truly necessary** — a non-obvious reason or constraint, a workaround for a
library or platform quirk, a security or privacy decision, or an external contract the code cannot express. Never
restate what the code does, describe props or parameters whose names and types already say it, add decorative
section dividers or reference documents for decoration. If code seems to need a comment to explain *what* it does,
simplify the code instead.

## 7. Source layout

- Path alias **`@/*` → `src/*`**. Use it for imports across folders; relative imports only inside the same
  feature or component folder.
- Folder vocabulary and responsibilities: [Architecture §3](./architecture.md). Create a folder only when it has
  content.

Import boundaries, linted from the first commit (section 5):

- Code outside a feature imports it only through its `index.ts` — never deep paths.
- `components/ui/`, `components/layout/`, `lib/` and `server/` never import from `features/`.
- `domain/` imports no Astro, Axios or provider modules.
- Client scripts never import `@/server/*` or `astro:env/server`.
- Public APIs use explicit named exports (no `export *`).

## 8. HTTP and integrations

**Axios is the HTTP client**, on the server and in islands: one way to configure interceptors, one error
normalization.

- **Server → provider:** Axios instances built by one factory, `src/server/http/create-http-client.ts` (timeout, error
  normalization into `AppError`, safe logging, no default retries) — one instance per provider origin. Server HTTP
  modules are imported only by endpoints, frontmatter and integrations.
- **Island → API:** one central Axios instance in `src/lib/api/axios.ts`.
- **Exception — form enhancement:** scripts that post a form to the site's own endpoint use the single `fetch`-based
  helper `src/lib/submit-form.ts`, so a page does not ship an HTTP library for one request. The exception holds only
  while the page ships no Axios: when an island on the same page already loads the Axios instance, that page's forms
  post through it too (never ship both). Either way the result is the shared `Result`. No other `fetch` calls in
  client code.
- **OpenAPI:** when a provider publishes a trustworthy contract, generate the SDK with **Hey API**
  ([API integration §7](./api-integration.md)); keep the reviewed snapshot in `contracts/`.
- Every adapter confirms success explicitly, normalizes errors, keeps secrets and payloads out of logs and never
  retries non-idempotent requests automatically; send idempotency keys when the provider supports them.

## 9. Errors and results

| `AppErrorCode` | HTTP | Meaning |
| --- | --- | --- |
| `validation` | 400 / 413 / 415 / 422 | Input rejected (including an oversized body or unsupported content type); may carry `fieldErrors` |
| `unauthenticated` | 401 | Missing or invalid preview token or webhook signature |
| `forbidden` | 403 | Valid credential, but not allowed |
| `not-found` | 404 | Missing, or hidden to avoid disclosure |
| `conflict` | 409 | State or version conflict |
| `rate-limited` | 429 | Too many requests; `Retry-After` header, may carry `retryAfterSeconds` |
| `unavailable` | 503 | Dependency or configuration missing |
| `timeout` / `network` | — | Client-side transport failures (including offline devices) |
| `unexpected` | 500 / 502 | Anything else, 502 when the provider fails (never expose internals) |

Endpoints and the form helper use the shared types in `src/lib/result.ts`:

```ts
export type AppError = {
  code: AppErrorCode;
  message?: string; // safe, user-facing
  fieldErrors?: Record<string, string[]>;
  retryAfterSeconds?: number;
};

export type Result<T = void> = { ok: true; data: T } | { ok: false; error: AppError };
```

Error codes are stable identifiers; display copy comes from `src/config`, in the product language.

## 10. Environment variables

- Declare every variable in the `astro:env` schema in `astro.config.mjs` ([Architecture §2](./architecture.md));
  credentials use `context: 'server', access: 'secret'`.
- `PUBLIC_` variables are **always public**; secrets never use them.
- `.env.example` lists every variable with placeholders only; real values live in Vercel per environment
  (Development / Preview / Production).

## 11. Tests layout

```text
src/**/<module>.test.ts(x)   unit and component tests, next to the code
tests/integration/           integration tests (endpoints, MSW)
tests/e2e/                   Playwright specs (`<journey>.spec.ts`)
tests/fixtures/              factories and synthetic data
tests/setup/                 test runner setup, MSW server and handlers
```

Coverage is always installed (`@vitest/coverage-v8`); thresholds are risk-based, never a global 100%.

## 12. Quality targets

- **Core Web Vitals (p75):** LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- **Accessibility:** WCAG 2.2 AA.
- **JavaScript budget (gzip, motion code included):** ≤ 60 kB per page without hydrated React islands; ≤ 130 kB on
  pages that hydrate one. Raise only for a measured reason.
- Analytics events: `page_view`, `cta_click`, `form_start`, `generate_lead` (only after confirmed submission),
  `contact_click`. Never send personal data as event properties.

## 13. Git and delivery

- Code, comments, commit messages, PR descriptions and documentation are written in **English**. User-facing copy
  follows the product language.
- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`…), optional scope
  (`feat(leads): …`). Branches: `<type>/<short-kebab-description>`.
- CI gates on every PR, in order: `lint` → `format:check` → `typecheck` → `test` → `build`; `test:e2e` on PRs that
  touch user journeys and before releases. Dependabot keeps dependencies and GitHub Actions updated.
- Credentials never enter git: `.env*` (except `.env.example`).
- Every PR states what changed, which checks ran and any remaining risk (the Definition of Done in `AGENTS.md`);
  deviations from this standard are explained there.
- **AI agents** never commit, push or open pull requests without a direct request from the user, and never add
  themselves as author or co-author of a commit (no `Co-Authored-By` trailers) or attribute themselves in commit
  messages or PR descriptions.

## 14. Documentation set

Every repository has `AGENTS.md` and an identical `CLAUDE.md`, plus `docs/` with: `conventions.md` (this file),
`architecture.md`, `state-and-routing.md`, `api-integration.md`, `authorization.md`, `security.md`,
`design-system.md`, `seo-and-performance.md`, `testing.md` and `deployment.md`. Project-specific documentation
(brand, content, integrations) is added next to them.

## 15. Design tokens

All components use the **shadcn/ui semantic vocabulary**:

`background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`,
`primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`,
`accent-foreground`, `destructive`, `border`, `input`, `ring`, `radius`, plus `chart-1…5` and `sidebar-*` when used.
Add `success`, `warning`, `info` (with `-foreground`) only when the product needs them. Brand-specific roles are
allowed when no semantic role fits; name them by purpose (e.g. `highlight`), never by color, and document them.

- Tailwind runs through `@tailwindcss/vite` in `vite.plugins` (`bunx astro add tailwind`), never the deprecated
  `@astrojs/tailwind` integration.
- `src/styles/tokens.css` defines raw values as unprefixed CSS variables (`--background`) in `:root` (and `.dark`
  when dark mode exists), mapped with `@theme inline` (`--color-background: var(--background)`).
- `src/styles/globals.css` starts with `@import 'tailwindcss';`, imports the tokens and the base layer and, with dark
  mode, declares `@custom-variant dark (&:where(.dark, .dark *));`. `src/styles/typography.css` holds type presets as
  `@utility type-<role>`.
- Breakpoints, container width and spacing come from the Tailwind theme; custom values are added to the theme,
  never repeated as arbitrary values across components.
- Components reference semantic tokens only — no hex values or brand names inside shared components.

## 16. UI building blocks

- `.astro` components in `src/components/ui/` are owned by the project; React islands may use shadcn/ui.
- **Lucide** is the only icon set: `@lucide/astro` in `.astro` files, `lucide-react` in islands. Brand marks and
  custom icons live as SVG files in `src/assets/`, used as Astro SVG components. Decorative icons are hidden from
  assistive technology; icon-only buttons have an accessible name.
- Fonts go through the Astro Fonts API, load only used weights and preload only above-the-fold faces
  ([Design system §2](./design-system.md)).

## 17. Motion

- CSS transitions first; **GSAP** is the only JavaScript animation library (ScrollTrigger, SplitText).
  Animate transform and opacity.
- **Lenis** smooth scrolling is opt-in per project through a config flag.
- `prefers-reduced-motion` disables non-essential motion; content stays readable without animation and without
  JavaScript. Motion code counts towards the JavaScript budget (section 12).
