import { defineConfig, devices } from '@playwright/test';

// Two project configs:
// - `local`  : runs against `http://localhost:4173` (vite preview, serving
//              the real production build). The `test:e2e` script in root
//              package.json builds and spins up preview via
//              start-server-and-test before invoking.
// - `remote` : runs against a deployed URL set via PLAYWRIGHT_BASE_URL.
//              Used for production deployment tests after release.
//
// The API now lives on a separate origin (api.hoobi.dev), so it can't be
// `baseURL` for both site and API requests - tests/e2e/smoke.spec.ts reads
// API_BASE_URL directly via process.env for the handful of requests that
// hit it.

const remoteBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'https://hoobi.dev';

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
        baseURL: 'http://localhost:4173',
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
