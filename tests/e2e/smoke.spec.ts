import { expect, test } from '@playwright/test';

// The API lives on a separate origin from the site now, so it can't ride
// Playwright's `baseURL`. Defaults match the local vite-preview setup;
// PDT (remote) passes API_BASE_URL explicitly.
// `||` not `??`: the test-pdt composite action passes API_BASE_URL='' for
// local runs, and an empty string must fall back to the preview server too.
const apiBase = process.env.API_BASE_URL || 'http://localhost:4173/api';

test.describe('portfolio smoke', () => {
  test('loads the hero with the role headline', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /View source on GitHub/i })).toBeVisible();
    await expect(page.getByText('Senior Platform Engineer', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('PowerShell').first()).toBeVisible();
  });

  test('renders the principles section', async ({ page }) => {
    await page.goto('/#principles');
    await expect(page.getByRole('heading', { name: /principles/i }).first()).toBeVisible();
    await expect(page.getByText(/Secure by default/i).first()).toBeVisible();
  });

  test('renders the experience timeline', async ({ page }) => {
    await page.goto('/#experience');
    await expect(page.getByRole('heading', { name: /experience/i }).first()).toBeVisible();
    await expect(page.getByText('Senior Platform Engineer').first()).toBeVisible();
    await expect(page.getByText('Systems Administrator')).toBeVisible();
  });

  test('renders the SBOM page', async ({ page }) => {
    // No SBOM is generated for local/UI-test builds (that's a separate CI
    // step) - tolerate either the real component table or the "no SBOM"
    // error state, matching tests/api/sbom.bru's 200-or-404 tolerance.
    await page.goto('/sbom');
    await expect(page.getByRole('heading', { name: /software bill of materials/i })).toBeVisible();
    await expect(
      page.getByText(/components/i).first().or(page.getByText(/No SBOM available/i)),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Swagger UI loads at /docs', async ({ page }) => {
    await page.goto('/docs');
    await expect(page.getByText(/Hoobi Portfolio API/i)).toBeVisible({ timeout: 10_000 });
  });

  test('llms.txt is served at root', async ({ request }) => {
    const response = await request.get('/llms.txt');
    expect(response.status()).toBe(200);
    expect(await response.text()).toMatch(/Alex Hill/i);
  });

  test('version.json is served at root', async ({ request }) => {
    const response = await request.get('/version.json');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.version).toEqual(expect.any(String));
  });

  test('Cache-Control is set on the portfolio API', async ({ request }) => {
    const response = await request.get(`${apiBase}/portfolio.json`);
    expect(response.status()).toBe(200);
    const cacheControl = response.headers()['cache-control'];
    expect(cacheControl).toMatch(/s-maxage/);
  });

  test('YAML view endpoint serves the source file', async ({ request }) => {
    const response = await request.get(`${apiBase}/portfolio/principles.yaml`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('yaml');
    expect(await response.text()).toMatch(/principles:/);
  });
});
