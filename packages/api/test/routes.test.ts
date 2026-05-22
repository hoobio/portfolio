import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/build-app.js';
import { portfolioFixture, sbomSummaryFixture } from './fixtures.js';

describe('API routes', () => {
  let app: FastifyInstance;
  let workDir: string;
  let sbomPath: string;
  let webDistDir: string;

  beforeAll(async () => {
    workDir = mkdtempSync(join(tmpdir(), 'hoobi-portfolio-api-'));
    sbomPath = join(workDir, 'sbom.cdx.json');
    writeFileSync(
      sbomPath,
      JSON.stringify({
        bomFormat: 'CycloneDX',
        specVersion: '1.5',
        components: sbomSummaryFixture.components,
      }),
    );
    webDistDir = join(workDir, 'web');
    mkdirSync(webDistDir, { recursive: true });
    writeFileSync(join(webDistDir, 'index.html'), '<html><body>app</body></html>');

    app = await buildApp({
      portfolio: portfolioFixture,
      sbomSummary: sbomSummaryFixture,
      sbomPath,
      webDistDir,
      version: '1.0.0-test',
      baseUrl: 'https://example.test',
    });
  });

  afterAll(async () => {
    await app.close();
    rmSync(workDir, { recursive: true, force: true });
  });

  it('GET /api/health returns ok', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/health' });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe('ok');
    expect(body.version).toBe('1.0.0-test');
  });

  it('GET /api/portfolio returns the full portfolio', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/portfolio' });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.profile.name).toBe(portfolioFixture.profile.name);
  });

  it.each([
    ['/api/portfolio/profile', 'name'],
    ['/api/portfolio/principles', 0],
    ['/api/portfolio/skills', 0],
    ['/api/portfolio/experience', 0],
    ['/api/portfolio/projects', 0],
    ['/api/portfolio/azure-resources', 0],
    ['/api/portfolio/themes', 0],
  ])('GET %s succeeds', async (url, key) => {
    const response = await app.inject({ method: 'GET', url });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    if (typeof key === 'string') {
      expect(body[key]).toBeDefined();
    } else {
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    }
  });

  it('GET /api/sbom returns the summary', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/sbom' });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.componentCount).toBe(2);
  });

  it('GET /api/sbom/raw returns the raw CycloneDX', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/sbom/raw' });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('cyclonedx');
  });

  it('GET /robots.txt has a Sitemap entry', async () => {
    const response = await app.inject({ method: 'GET', url: '/robots.txt' });
    expect(response.statusCode).toBe(200);
    expect(response.payload).toMatch(/Sitemap:/);
  });

  it('GET /sitemap.xml is XML with portfolio URL', async () => {
    const response = await app.inject({ method: 'GET', url: '/sitemap.xml' });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('xml');
    expect(response.payload).toContain('/api/portfolio');
  });

  it('GET /llms.txt advertises structured data', async () => {
    const response = await app.inject({ method: 'GET', url: '/llms.txt' });
    expect(response.statusCode).toBe(200);
    expect(response.payload).toContain('/api/portfolio');
    expect(response.payload).toContain('/api/sbom/raw');
  });

  it('GET / serves the SPA index.html', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
      headers: { accept: 'text/html' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.payload).toContain('app');
  });

  it('Unknown SPA path falls back to index.html for HTML accepts', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/some/client/route',
      headers: { accept: 'text/html' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.payload).toContain('app');
  });

  it('Unknown JSON path returns 404 JSON', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/does-not-exist',
      headers: { accept: 'application/json' },
    });
    expect(response.statusCode).toBe(404);
  });

  it('OpenAPI JSON is exposed via swagger UI route', async () => {
    const response = await app.inject({ method: 'GET', url: '/docs/json' });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.info.title).toMatch(/Hoobi Portfolio/);
  });
});

describe('SBOM route without summary', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await buildApp({
      portfolio: portfolioFixture,
      sbomSummary: undefined,
      sbomPath: '/non/existent/path.json',
      webDistDir: '/non/existent/dir',
      version: '1.0.0-test',
      baseUrl: '',
    });
  });
  afterAll(async () => {
    await app.close();
  });
  it('returns 404 for /api/sbom', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/sbom' });
    expect(response.statusCode).toBe(404);
  });
  it('returns 404 for /api/sbom/raw when the file is missing', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/sbom/raw' });
    expect(response.statusCode).toBe(404);
  });
});
