# Design System — Astro

> Engineering foundation for a site's visual layer. Each project owns its identity (palette, fonts, imagery, layout,
> motion); the standard owns the structure. Token vocabulary, Tailwind wiring, icons and motion rules are in
> [conventions.md §15–17](./conventions.md).

## 1. Token layers

1. **Foundation:** raw palette, font families, spacing, radii, container width, breakpoints, easing and durations.
2. **Semantic:** the shadcn vocabulary — `background`, `foreground`, `card`, `primary`, `secondary`, `muted`,
   `accent`, `destructive`, `border`, `input`, `ring`, `radius`… plus documented brand roles when nothing fits.
3. **Component:** variants, sizes and states derived from semantic tokens (in the component or as `@utility`).

```css
/* src/styles/tokens.css — values are placeholders; every project sets its own */
:root {
  --background: #ffffff;
  --foreground: #111111;
  --muted: #f2f2f2;
  --muted-foreground: #6e6e6e;
  --primary: #111111;
  --primary-foreground: #ffffff;
  --border: #e5e5e5;
  --ring: #111111;
  --radius: 0.5rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --radius-lg: var(--radius);
}
```

## 2. Typography and fonts

- Define a type scale as presets in `src/styles/typography.css` using `@utility type-<role>` (`type-display`,
  `type-heading-lg`, `type-body`, `type-eyebrow`…), each stepping at the project breakpoints.
- Responsive sizes use either the presets or `clamp()` with deliberate min/max values; keep line length readable.
- Fonts go through the **Astro Fonts API** (top-level `fonts` in `astro.config.mjs`, stable since Astro 6):
  `fontProviders.local()` for files in `src/assets/fonts/` or `fontProviders.fontsource()`, with only the used
  weights. Map the family's CSS variable in `@theme inline` (`--font-sans: var(--font-brand)`).
- `BaseLayout` renders `<Font cssVariable="--font-brand" />` from `astro:assets`; add `preload` only for faces used
  above the fold. Astro generates the `@font-face` rules and metric-adjusted fallbacks that limit layout shift.

## 3. Components

Every primitive has a clear purpose and stable typed API, real `<button>`/`<a>` semantics, states (hover,
focus-visible, disabled, loading, success, error) and no brand values. Sections receive copy and media through props
from `src/config`. Folder roles are in [Architecture §3](./architecture.md).

Gotchas:

- Astro renders duplicated attributes instead of overriding them — resolve attributes like `type` before spreading
  props.
- Since Astro 7, `compressHTML` defaults to `'jsx'`: whitespace between inline elements disappears, so add `{' '}`
  where words must stay apart.

## 4. Layout

- Mobile-first; a consistent content container (`container-*` utility) with full-bleed sections when the art
  direction calls for it; a shared grid utility when the design uses one.
- Avoid fixed heights on content containers; reserve space for media to prevent layout shift.

## 5. Motion

- **GSAP** (ScrollTrigger, SplitText) for choreography; reveal behavior configured through data attributes so markup
  stays declarative.
- **Lenis** (opt-in config flag) is driven from GSAP's ticker so ScrollTrigger reads the smoothed position, and
  pauses while overlays are open.
- `prefers-reduced-motion: reduce` disables Lenis and non-essential motion. Content hidden for a reveal must stay
  visible when JavaScript does not run (gate hiding behind a `.js` class).
- No scroll-jacking, no motion that hides core content from assistive technology.

## 6. Accessibility checklist

- Semantic landmarks, one `h1`, ordered headings, native form controls with labels.
- Keyboard navigation, visible focus, skip link, correct accessible names and error feedback.
- WCAG 2.2 AA contrast for text; decorative elements marked as such; adequate touch targets.
- No essential content only available through motion.

## 7. Process for new patterns

Solve a real need with existing primitives first; define states and accessibility before visuals; add tokens instead
of literals; document reusable components; avoid a cross-project component library until reuse is proven.

## References

- Astro fonts: https://docs.astro.build/en/guides/fonts/
- Tailwind CSS 4 theme variables: https://tailwindcss.com/docs/theme
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
