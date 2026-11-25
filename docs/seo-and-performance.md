# SEO and Performance — Astro

> Websites live on search and on speed. Core Web Vitals, the JavaScript budget and the analytics events are
> canonical in [conventions.md §12](./conventions.md).

## 1. SEO checklist

- Unique `<title>` and meta description per indexable page; one `h1`; meaningful heading hierarchy.
- Absolute canonical URL from the configured `site` ([Architecture §2](./architecture.md)).
- Open Graph and Twitter metadata with a 1200×630 social image and alt text; `summary_large_image` when present.
- Correct `lang` per page; `hreflang` only for real localized variants.
- `@astrojs/sitemap` when `site` is known; exclude confirmation and preview pages.
- `robots.txt` (a prerendered endpoint) and `<meta name="robots">`: only the Vercel **production** build
  (`VERCEL_ENV === 'production'`) is indexable; previews, local builds and confirmation pages are `noindex`.
- Structured data only when it accurately describes real content.
- Descriptive English route segments and text alternatives for informative images.

## 2. Redirects and error pages

- A custom `src/pages/404.astro` in the site's layout, linking back to the main pages.
- A site that replaces an older one ships a 301/308 map for every indexed old URL: `redirects` in `astro.config.mjs`
  with the Vercel adapter (written as platform redirects), or `redirects` in `vercel.json` on adapter-less sites,
  where Astro would only emit meta-refresh pages.
- Redirects and canonicals follow the project's trailing-slash policy ([State and routing §2](./state-and-routing.md)).

## 3. Performance rules

- Optimize images with `astro:assets` (`<Image>`, `<Picture>`, `getImage`), specify dimensions, choose quality per
  image; never lazy-load the LCP element.
- Flatten decorative transparent images onto the page background when they always sit on it (much smaller files).
- Fonts through the Astro Fonts API, preloading only above-the-fold faces ([Design system §2](./design-system.md)).
- Ship JavaScript only for behavior: deferred module scripts, no hydration without need, scrutinize tag managers and
  pixels. Video: compressed, poster, no unnecessary autoplay.
- Reserve space for media and embeds (CLS); keep motion on `transform`/`opacity`.

## 4. Measurement and analytics

- Measure the built output (gzip of the `_astro/*.js` each page loads) against the budget when adding scripts or
  libraries, and real-user data (Vercel Speed Insights or the analytics provider) after launch.
- One analytics provider per project, loaded according to consent requirements; no duplicate conversions after
  redirects or retries.

## References

- Astro images: https://docs.astro.build/en/guides/images/
- Astro redirects: https://docs.astro.build/en/guides/routing/#redirects
