// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

const { SITE_URL, VERCEL_PROJECT_PRODUCTION_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// In `astro dev`, staticHeaders sends a CSP without the build's hashes and blocks inline styles.
const isBuild = process.argv.includes('build');

const site = SITE_URL || (VERCEL_PROJECT_PRODUCTION_URL ? `https://${VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

export default defineConfig({
  site,
  trailingSlash: 'always',

  adapter: vercel({ staticHeaders: isBuild }),
  security: {
    checkOrigin: true,
    // frame-ancestors and the other security headers are sent by vercel.json on every response.
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        'frame-src https://www.youtube-nocookie.com',
        "font-src 'self'",
        "connect-src 'self'",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
      ],
    },
  },
  // The Archivo files the Framer build used, so metrics and line breaks match.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Archivo',
      cssVariable: '--font-brand',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/archivo-400.woff2'], weight: 400, style: 'normal' },
          { src: ['./src/assets/fonts/archivo-500.woff2'], weight: 500, style: 'normal' },
          { src: ['./src/assets/fonts/archivo-600.woff2'], weight: 600, style: 'normal' },
          { src: ['./src/assets/fonts/archivo-700.woff2'], weight: 700, style: 'normal' },
        ],
      },
    },
  ],
  integrations: site
    ? [sitemap({ filter: (page) => !page.includes('/thank-you/') && !page.includes('/form-error/') })]
    : [],
  env: {
    schema: {
      UPSTASH_REDIS_REST_URL: envField.string({ context: 'server', access: 'secret', optional: true, url: true }),
      UPSTASH_REDIS_REST_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      ATTIO_API_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      ATTIO_DEAL_OWNER_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      BREVO_API_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      BREVO_EBOOK_LIST_ID: envField.number({ context: 'server', access: 'secret', optional: true, int: true }),
      BREVO_NEWSLETTER_LIST_ID: envField.number({ context: 'server', access: 'secret', optional: true, int: true }),
      BREVO_EBOOK_TEMPLATE_ID: envField.number({ context: 'server', access: 'secret', optional: true, int: true }),
      VERCEL_ENV: envField.enum({
        context: 'server',
        access: 'public',
        values: ['development', 'preview', 'production'],
        optional: true,
      }),
    },
  },
  // The toolbar injects its own markup (headings, landmarks) that E2E tests would see.
  // No Markdown code blocks: skip Shiki, whose inline styles a strict CSP would block.
  markdown: { syntaxHighlight: false },
  devToolbar: { enabled: process.env.E2E_TEST !== 'true' },
  vite: {
    plugins: [tailwindcss()],
  },
});
