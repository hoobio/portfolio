import { defineConfig, devices } from '@playwright/test';

// Two project configs:
// - `local`  : runs against `http://localhost:5173` (Vite dev). The
//              `test:e2e` script in root package.json spins up the API
//              and Vite via start-server-and-test before invoking.
// - `remote` : runs against a deployed URL set via PLAYWRIGHT_BASE_URL.
//              Used for production deployment tests after release.

const remoteBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'https://hoobi.io';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'local',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:8090',
      },
    },
    {
      name: 'remote',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: remoteBaseUrl,
      },
    },
  ],
});
