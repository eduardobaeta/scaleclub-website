import { defineConfig, devices } from '@playwright/test';

const PORT = 4332;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // --ignore-lock: run alongside a developer's own `astro dev` and stay in the foreground.
    command: `bun run astro dev --port ${PORT} --ignore-lock`,
    url: BASE_URL,
    // A fixed origin makes canonical and social metadata testable; blank provider tokens keep tests off the real CRM.
    env: { E2E_TEST: 'true', SITE_URL: 'https://site.example', ATTIO_API_TOKEN: '', BREVO_API_TOKEN: '' },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
