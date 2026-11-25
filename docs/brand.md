# Momentum Scale Club — brand tokens

Project-specific roles added to the shadcn vocabulary in `src/styles/tokens.css` ([Conventions §15](./conventions.md)).

| Token | Purpose |
| --- | --- |
| `soft-foreground` / `subtle-foreground` | Secondary and tertiary text on the dark surfaces (`subtle` meets WCAG AA at #8c8c8c) |
| `field` | Form field background |
| `panel` | Translucent form panel over imagery |
| `highlight-deep` | Deep orange used for tags, soft check marks and glows |
| `step-1` … `step-6` | The methodology progression, light to full orange (bars, hero badges, progress marks) |
| `shadow-glow`, `shadow-glow-sm` | Orange glow under panels and highlighted cards, derived from `primary` |
| `radius-panel`, `container-copy`, `container-lead` | Form panel radius and the reading widths of body and lead paragraphs |
| `fatorcard`, `prospera` | Brand surfaces of the client case cards and pages |
| `xl` breakpoint (1440px) | Fine-tuning at the widest container (company logos) |

Type roles (`type-*` in `src/styles/typography.css`) were measured from the Framer reference at 390, 810 and 1440 px.

Corners are continuous (Apple-style squircles) where `corner-shape` is supported: `globals.css` applies `corner-shape: squircle`, raises `--radius`, `--radius-2xl` and `--radius-3xl` to compensate for the tighter curve, and keeps `rounded-full` circles and pills round. Other browsers fall back to regular rounded corners.

The home hero background is the brand's `preto-laranja` gradient mesh (`Design system/scale-club-mesh.py`), ported to a WebGL shader in `src/scripts/motion/hero-mesh.ts` that breathes and gently moves away from the cursor. The static renders in `src/assets/images/hero-mesh-*.jpg` come from the same script and show without JavaScript, without WebGL or with reduced motion.
