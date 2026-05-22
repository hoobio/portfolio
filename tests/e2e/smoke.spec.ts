import { expect, test } from '@playwright/test';

test.describe('portfolio smoke', () => {
  test('loads the hero with the role headline', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header').getByText('source')).toBeVisible();
    await expect(page.getByText('Senior Platform Engineer', { exact: false })).toBeVisible();
    await expect(page.getByText('PowerShell')).toBeVisible();
  });

  test('renders the principles section', async ({ page }) => {
    await page.goto('/#principles');
    await expect(page.getByRole('heading', { name: /principles/i })).toBeVisible();
    await expect(page.getByText(/Secure by default/i)).toBeVisible();
  });

  test('renders the experience timeline', async ({ page }) => {
    await page.goto('/#experience');
    await expect(page.getByRole('heading', { name: /experience/i })).toBeVisible();
    await expect(page.getByText('Senior Platform Engineer').first()).toBeVisible();
    await expect(page.getByText('Systems Administrator')).toBeVisible();
  });

  test('renders the SBOM page with the bubble chart', async ({ page }) => {
    await page.goto('/sbom');
    await expect(page.getByRole('heading', { name: /software bill of materials/i })).toBeVisible();
    await expect(page.locator('svg[aria-label="SBOM ecosystem bubble chart"]')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('Cache-Control is set on the portfolio API', async ({ request }) => {
    const response = await request.get('/api/portfolio');
    expect(response.status()).toBe(200);
    const cacheControl = response.headers()['cache-control'];
    expect(cacheControl).toMatch(/s-maxage/);
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
});
