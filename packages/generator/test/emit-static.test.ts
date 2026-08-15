import { describe, expect, it, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  Profile,
  Principle,
  SkillGroup,
  Experience,
  Project,
  AzurePrinciple,
  Theme,
  Portfolio,
  SbomSummary,
} from '@hoobi-portfolio/schemas';
import { emitStatic } from '../src/emit-static.js';
import { SECTION_SLUGS, YAML_FILE_MAP } from '../src/sections.js';

const cleanup: string[] = [];

function makeDataDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'hoobi-emit-data-'));
  cleanup.push(dir);
  writeFileSync(
    join(dir, 'profile.yaml'),
    `name: Alex
role: Senior Platform Engineer
location: Melbourne
headline: H
summary: S
cloudFocus:
  primary: Azure
  primaryDescription: pd
contact:
  - kind: email
    value: a@b.com
    display: a@b.com
    primary: true
availability:
  status: open-to-conversations
  description: d
seo:
  description: sd
  keywords: [kw]
`,
  );
  writeFileSync(
    join(dir, 'principles.yaml'),
    `principles:
  - id: p
    title: P
    summary: s
    evidence: [e]
`,
  );
  writeFileSync(
    join(dir, 'skills.yaml'),
    `groups:
  - id: g
    title: G
    level: deep
    skills: [s]
`,
  );
  writeFileSync(
    join(dir, 'experience.yaml'),
    `experience:
  - id: r1
    title: T
    company: C
    location: L
    start: 2020-01
    end: present
    summary: s
`,
  );
  writeFileSync(
    join(dir, 'projects.yaml'),
    `projects:
  - id: p1
    title: P
    kind: open-source
    role: r
    status: active
    summary: s
`,
  );
  writeFileSync(
    join(dir, 'azure-resources.yaml'),
    `principles:
  - id: compute
    title: Compute
    description: d
    services:
      - name: AKS
        usage: u
`,
  );
  writeFileSync(
    join(dir, 'work-themes.yaml'),
    `themes:
  - id: t
    title: T
    description: d
    receipts: [r]
`,
  );
  return dir;
}

function makeOutDirs() {
  const apiOutDir = mkdtempSync(join(tmpdir(), 'hoobi-emit-api-'));
  const siteOutDir = mkdtempSync(join(tmpdir(), 'hoobi-emit-site-'));
  cleanup.push(apiOutDir, siteOutDir);
  return { apiOutDir, siteOutDir };
}

function baseConfig(overrides: Partial<Parameters<typeof emitStatic>[0]> = {}) {
  const { apiOutDir, siteOutDir } = makeOutDirs();
  return {
    version: 'test-1.0.0',
    commit: 'deadbeef',
    generatedAt: '2026-08-15T00:00:00.000Z',
    dataDir: makeDataDir(),
    sbomPath: join(tmpdir(), 'hoobi-emit-nonexistent-sbom.cdx.json'),
    apiOutDir,
    siteOutDir,
    publicBaseUrl: 'https://hoobi.test',
    apiBaseUrl: 'https://api.hoobi.test/portfolio',
    ...overrides,
  };
}

afterEach(() => {
  while (cleanup.length) {
    const dir = cleanup.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe('emitStatic', () => {
  it('writes the full API payload and re-validates against the schemas', async () => {
    const cfg = baseConfig();
    await emitStatic(cfg);

    const portfolioJson = JSON.parse(readFileSync(join(cfg.apiOutDir, 'portfolio.json'), 'utf8'));
    expect(() => Portfolio.parse(portfolioJson)).not.toThrow();

    const sectionSchemas: Record<string, { parse: (v: unknown) => unknown }> = {
      profile: Profile,
      principles: { parse: (v) => (v as unknown[]).map((x) => Principle.parse(x)) },
      skills: { parse: (v) => (v as unknown[]).map((x) => SkillGroup.parse(x)) },
      experience: { parse: (v) => (v as unknown[]).map((x) => Experience.parse(x)) },
      projects: { parse: (v) => (v as unknown[]).map((x) => Project.parse(x)) },
      'azure-resources': { parse: (v) => (v as unknown[]).map((x) => AzurePrinciple.parse(x)) },
      themes: { parse: (v) => (v as unknown[]).map((x) => Theme.parse(x)) },
    };

    for (const slug of SECTION_SLUGS) {
      const jsonPath = join(cfg.apiOutDir, 'portfolio', `${slug}.json`);
      expect(existsSync(jsonPath), `${jsonPath} should exist`).toBe(true);
      const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
      expect(() => sectionSchemas[slug]!.parse(data)).not.toThrow();

      const yamlPath = join(cfg.apiOutDir, 'portfolio', `${slug}.yaml`);
      expect(existsSync(yamlPath), `${yamlPath} should exist`).toBe(true);
      const expectedYaml = readFileSync(join(cfg.dataDir, YAML_FILE_MAP[slug]!), 'utf8');
      expect(readFileSync(yamlPath, 'utf8')).toBe(expectedYaml);
    }

    const version = JSON.parse(readFileSync(join(cfg.apiOutDir, 'version.json'), 'utf8'));
    expect(version).toEqual({ status: 'ok', version: 'test-1.0.0', generatedAt: cfg.generatedAt });
  });

  it('skips sbom.json / sbom.cdx.json when no SBOM is available', async () => {
    const cfg = baseConfig();
    await emitStatic(cfg);
    expect(existsSync(join(cfg.apiOutDir, 'sbom.json'))).toBe(false);
    expect(existsSync(join(cfg.apiOutDir, 'sbom.cdx.json'))).toBe(false);
  });

  it('writes sbom.json / sbom.cdx.json when an SBOM is present', async () => {
    const sbomDir = mkdtempSync(join(tmpdir(), 'hoobi-emit-sbom-'));
    cleanup.push(sbomDir);
    const sbomPath = join(sbomDir, 'sbom.cdx.json');
    const bom = {
      bomFormat: 'CycloneDX',
      specVersion: '1.5',
      components: [{ name: 'react', version: '19.0.0', type: 'library', purl: 'pkg:npm/react@19.0.0' }],
    };
    writeFileSync(sbomPath, JSON.stringify(bom));

    const cfg = baseConfig({ sbomPath });
    await emitStatic(cfg);

    const summary = JSON.parse(readFileSync(join(cfg.apiOutDir, 'sbom.json'), 'utf8'));
    expect(() => SbomSummary.parse(summary)).not.toThrow();
    expect(summary.componentCount).toBe(1);
    expect(JSON.parse(readFileSync(join(cfg.apiOutDir, 'sbom.cdx.json'), 'utf8'))).toEqual(bom);
  });

  it('writes site-root meta files that stay same-origin and reference the API cross-origin', async () => {
    const cfg = baseConfig();
    await emitStatic(cfg);

    const robots = readFileSync(join(cfg.siteOutDir, 'robots.txt'), 'utf8');
    expect(robots).toContain(`Sitemap: ${cfg.publicBaseUrl}/sitemap.xml`);

    const sitemap = readFileSync(join(cfg.siteOutDir, 'sitemap.xml'), 'utf8');
    expect(sitemap).not.toContain(new URL(cfg.apiBaseUrl).host);
    expect(sitemap).toContain(`${cfg.publicBaseUrl}/`);

    const llms = readFileSync(join(cfg.siteOutDir, 'llms.txt'), 'utf8');
    expect(llms).toContain(`${cfg.apiBaseUrl}/portfolio.json`);
    expect(llms).toContain(`${cfg.apiBaseUrl}/sbom.cdx.json`);

    expect(existsSync(join(cfg.siteOutDir, 'version.json'))).toBe(true);
  });

  it('writes a static Swagger UI whose openapi.json covers every emitted blob path', async () => {
    const cfg = baseConfig();
    await emitStatic(cfg);

    const docsDir = join(cfg.siteOutDir, 'docs');
    expect(existsSync(join(docsDir, 'index.html'))).toBe(true);
    expect(existsSync(join(docsDir, 'swagger-ui.css'))).toBe(true);
    expect(existsSync(join(docsDir, 'swagger-ui-bundle.js'))).toBe(true);
    expect(existsSync(join(docsDir, 'init.js'))).toBe(true);
    expect(readFileSync(join(docsDir, 'index.html'), 'utf8')).not.toContain('window.onload');

    const openapi = JSON.parse(readFileSync(join(docsDir, 'openapi.json'), 'utf8'));
    const paths = Object.keys(openapi.paths);
    expect(paths).toContain('/portfolio.json');
    expect(paths).toContain('/sbom.json');
    expect(paths).toContain('/sbom.cdx.json');
    expect(paths).toContain('/version.json');
    for (const slug of SECTION_SLUGS) {
      expect(paths).toContain(`/portfolio/${slug}.json`);
      expect(paths).toContain(`/portfolio/${slug}.yaml`);
    }
  });
});
