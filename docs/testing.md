# Testing — Astro

> Test behavior that can break: validation, use cases, adapters, endpoints and visitor journeys. Scripts and test
> layout are in [conventions.md §4 and §11](./conventions.md).

## 1. Policy

- Add or update automated tests for nontrivial behavior and reproducible regressions.
- For static content or purely visual changes, do **not** fabricate unit tests; check the rendered page, keyboard
  behavior and responsiveness, and say so in the change summary.
- Test observable behavior, not private functions, CSS classes or large snapshots.
- Tests are deterministic and isolated; no real credentials, production providers, billable APIs or personal data.
- Mock at the right boundary: inject fakes into use cases; intercept HTTP in browser tests. Never mock the behavior
  under test.
- Descriptive English names (`rejects an invalid email`), Arrange–Act–Assert, small fixtures.

## 2. Stack

| Layer | Tool | Status |
| --- | --- | --- |
| Unit / application / adapter / endpoint | **Vitest** (`getViteConfig` from `astro/config`) | Default when testable logic exists |
| Browser / E2E | **Playwright Test** | Default for pages, navigation and forms |
| Accessibility | **`@axe-core/playwright`** plus manual screen-reader review | Default on key pages |
| HTTP mocking | **MSW** | When network-level mocking helps; fakes are often enough |
| Coverage | **`@vitest/coverage-v8`** | Installed; risk-based thresholds |
| Islands | React Testing Library | Only when React islands have logic |

## 3. What to test

| Responsibility | Minimum |
| --- | --- |
| Zod schemas | Valid, invalid and boundary input |
| Use cases | Success and failure paths with fake gateways |
| Provider adapters | Request mapping, confirmation, error status, timeout (MSW `msw/node` intercepting the real Axios requests; do not mock Axios itself) |
| Endpoints | Every status (`200`/`303`, `400`/`422`, `413`, `415`, `429`, `502`, `503`) in JSON and native mode, `Result` bodies, honeypot answered as success, safe logging |
| Rate limiter / stores / URL schemas / nuqs parsers | State transitions with a fake clock; fail-open when the store throws; parser defaults and invalid input |
| Pages | Smoke: one `h1`, metadata, canonical, `noindex` rules, skip link |
| Navigation and menus | Keyboard interaction, focus return, anchors |
| Forms | Required fields, success only after confirmation, server field errors with focus on the first invalid field, failure, without JavaScript |
| Motion | One test with motion enabled; the rest with `reducedMotion: 'reduce'` |

## 4. Playwright configuration notes

- `webServer` runs `astro dev --port <port> --ignore-lock` (Astro 7.1+). Astro locks one dev server per project and
  backgrounds it when it detects an AI agent; the flag lets the test server start beside a developer's own server
  and keeps it in the foreground.
- The webServer `env` sets a flag that `astro.config.mjs` reads to disable the dev toolbar
  (`devToolbar: { enabled: process.env.E2E_TEST !== 'true' }`), whose markup pollutes locators and axe results.
- Set a fixed `SITE_URL` for tests so canonical and social metadata can be asserted.
- Run desktop and phone projects; intercept form endpoints with `page.route` so no lead reaches a real provider.
- Exclude only documented decorative elements from axe (e.g. `[data-decorative]`), with the reason in the test.

## 5. Verification order

`lint` → `format:check` → `typecheck` → `test` → `build` → `test:e2e` → Vercel Preview check when endpoints or
providers changed. Report skipped or unavailable checks explicitly.

## References

- Astro testing: https://docs.astro.build/en/guides/testing/
- Playwright accessibility: https://playwright.dev/docs/accessibility-testing
