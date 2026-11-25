# State and Routing — Astro

> Astro sites render content on the server or at build time, so most "state" is HTML. This document defines who owns
> the little client state a website has, with one owner per state.

## 1. One owner for each state

| State | Owner | Examples |
| --- | --- | --- |
| Page content | **Build/server rendering** (`src/config`, content collections, CMS loader) | Copy, lists, prices, FAQ |
| Shareable navigation state | **URL** (path, search params, hash) — read with Zod in scripts or **nuqs** in React islands | Filters on a blog index, selected tab, anchors |
| Local interaction | **Component script** or island `useState` | Menu open, accordion, carousel index |
| State shared between islands | **Zustand vanilla store** | Mobile menu toggled from two islands, consent banner |
| Form fields | **Native form** (+ progressive enhancement script) | Contact, newsletter |
| Remote data in an island | **TanStack Query** (only when an island really fetches) | Live availability widget |

Never copy the same value into two owners (e.g. a filter in both the URL and a store).

## 2. Routing

- File-based routes in `src/pages/`. Segments are English `kebab-case` (`/privacy-policy`, `/thank-you/[form]`);
  localized URL slugs are allowed only through Astro's i18n routing.
- Choose one trailing-slash policy per project (`trailingSlash` in `astro.config.mjs`) and keep redirects and
  canonicals consistent with it. The policy also applies to endpoints: with `'always'`, form actions end in `/`
  (`/api/leads/`).
- Dynamic routes generate their paths with `getStaticPaths` and typed props (`InferGetStaticPropsType`), not casts.
- Endpoints live under `src/pages/api/` and are the only on-demand routes by default.
- In-page anchors use English section ids that match the navigation config.

## 3. URL parameters

- Parse search params with a Zod schema (defaults + `.catch()` for invalid values) wherever they affect rendering.
- Static pages read them in a client script; on-demand pages read `Astro.url.searchParams` on the server.
- When a **React island** owns URL state (e.g. a filterable catalog), use **nuqs** with its plain React adapter
  (`nuqs/adapters/react`) wrapping the island, and parsers with defaults defined once in
  `src/features/<feature>/schemas/<screen>-search-params.ts`. Do not mix nuqs and hand-written `URLSearchParams` code
  for the same parameters.
- Never put personal data, tokens or secrets in URLs; they are logged and shared.

## 4. Islands and shared client state

- Default to zero islands. Add a React island only for meaningful interactive state that small scripts cannot handle.
- State shared across islands uses a `zustand/vanilla` store (`createStore`) exported from
  `src/features/<feature>/stores/<name>-store.ts`; React islands subscribe with `useStore` from `zustand`, plain
  scripts with `store.subscribe`.
- Keep stores small and serializable; persist only allowlisted, non-sensitive preferences.

## 5. Testing expectations

Unit-test URL schemas and store transitions with Vitest; cover deep links, anchors and back/forward navigation of
representative pages with Playwright.

## References

- Zustand vanilla stores: https://zustand.docs.pmnd.rs/apis/create-store
- nuqs adapters: https://nuqs.dev/docs/adapters
