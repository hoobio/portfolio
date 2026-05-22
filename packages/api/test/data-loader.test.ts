import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadData } from '../src/data-loader.js';

function makeDataDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'hoobi-portfolio-data-'));
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

describe('loadData', () => {
  it('loads and aggregates the full portfolio', async () => {
    const dir = makeDataDir();
    try {
      const { portfolio, profileKeywords } = await loadData(dir);
      expect(portfolio.profile.name).toBe('Alex');
      expect(portfolio.principles).toHaveLength(1);
      expect(portfolio.skills).toHaveLength(1);
      expect(portfolio.experience).toHaveLength(1);
      expect(portfolio.projects).toHaveLength(1);
      expect(portfolio.azureResources).toHaveLength(1);
      expect(portfolio.themes).toHaveLength(1);
      expect(profileKeywords).toEqual(['kw']);
      expect(portfolio.generatedAt).toMatch(/T/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('throws when YAML fails schema validation', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'hoobi-portfolio-bad-'));
    writeFileSync(join(dir, 'profile.yaml'), 'name: Alex\n');
    try {
      await expect(loadData(dir)).rejects.toBeTruthy();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
