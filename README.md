# Momentum Scale Club · Website

Site of the Momentum Scale Club mentoring, built with Astro on the company standard (`AGENTS.md` and `docs/`).

## Getting started

```sh
bun install
bun run dev        # http://localhost:4321
bun run verify     # lint, format, typecheck, unit tests and build
bun run test:e2e   # Playwright (first run: bunx playwright install chromium)
```

## Where things live

- Copy, navigation and prices: `src/config/`
- Case studies: `src/content/cases/*.md`
- Brand tokens and decisions: `src/styles/` and `docs/brand.md`

Form leads go to Attio (CRM) and Brevo (e-mail): see `docs/integrations/leads.md` and `.env.example`.
