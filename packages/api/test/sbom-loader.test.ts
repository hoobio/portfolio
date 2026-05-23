import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadSbom } from '../src/sbom-loader.js';

function withTempSbom(
  bom: unknown,
  body: (path: string) => Promise<void> | void,
): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), 'hoobi-portfolio-sbom-'));
  const sbomPath = join(dir, 'sbom.cdx.json');
  writeFileSync(sbomPath, JSON.stringify(bom));
  return Promise.resolve(body(sbomPath)).finally(() => {
    rmSync(dir, { recursive: true, force: true });
  });
}

describe('loadSbom', () => {
  it('returns undefined when the file is missing', async () => {
    const result = await loadSbom('/path/that/does/not/exist.json');
    expect(result).toBeUndefined();
  });

  it('parses a CycloneDX document, normalising licenses', async () => {
    await withTempSbom(
      {
        bomFormat: 'CycloneDX',
        specVersion: '1.5',
        serialNumber: 'urn:uuid:1',
        metadata: { timestamp: '2026-05-22T00:00:00Z' },
        components: [
          {
            name: 'react',
            version: '19.0.0',
            type: 'library',
            purl: 'pkg:npm/react@19.0.0',
            licenses: [{ license: { id: 'MIT' } }],
          },
          {
            name: 'expr-pkg',
            version: '1.0.0',
            purl: 'pkg:npm/expr-pkg@1.0.0',
            licenses: [{ expression: 'Apache-2.0 OR MIT' }],
          },
          {
            name: 'named',
            version: '1.0.0',
            licenses: [{ license: { name: 'BSD-3-Clause' } }],
          },
          {
            name: 'nolicense',
            licenses: [{}],
          },
        ],
      },
      async (sbomPath) => {
        const result = await loadSbom(sbomPath);
        expect(result).toBeDefined();
        expect(result?.bomFormat).toBe('CycloneDX');
        expect(result?.specVersion).toBe('1.5');
        expect(result?.componentCount).toBe(4);
        expect(result?.components.find((c) => c.name === 'react')?.licenses).toEqual(['MIT']);
        expect(result?.components.find((c) => c.name === 'expr-pkg')?.licenses).toEqual([
          'Apache-2.0 OR MIT',
        ]);
        expect(result?.components.find((c) => c.name === 'named')?.licenses).toEqual([
          'BSD-3-Clause',
        ]);
        expect(result?.components.find((c) => c.name === 'nolicense')?.licenses).toEqual([]);
      },
    );
  });

  it('defaults the bomFormat and specVersion when absent', async () => {
    await withTempSbom({ components: [] }, async (sbomPath) => {
      const result = await loadSbom(sbomPath);
      expect(result?.bomFormat).toBe('CycloneDX');
      expect(result?.specVersion).toBe('unknown');
      expect(result?.componentCount).toBe(0);
    });
  });

  it('filters file-type entries and local composite-action refs', async () => {
    await withTempSbom(
      {
        components: [
          { name: 'react', version: '19.0.0', type: 'library', purl: 'pkg:npm/react@19.0.0' },
          { name: '/app/.github/workflows/ci.yml', type: 'file' },
          { name: './operations/pipelines/install-deps', type: 'library' },
          { name: './.github/workflows/test.yml', type: 'library' },
        ],
      },
      async (sbomPath) => {
        const result = await loadSbom(sbomPath);
        expect(result?.componentCount).toBe(1);
        expect(result?.components[0]?.name).toBe('react');
      },
    );
  });

  it('dedupes components by purl and merges licenses + vulnerabilities', async () => {
    await withTempSbom(
      {
        components: [
          {
            name: 'react',
            version: '19.0.0',
            type: 'library',
            purl: 'pkg:npm/react@19.0.0',
            licenses: [{ license: { id: 'MIT' } }],
          },
          {
            name: 'react',
            version: '19.0.0',
            type: 'library',
            purl: 'pkg:npm/react@19.0.0',
            licenses: [{ license: { id: 'BSD-3-Clause' } }],
          },
        ],
      },
      async (sbomPath) => {
        const result = await loadSbom(sbomPath);
        expect(result?.componentCount).toBe(1);
        expect(result?.components[0]?.licenses.sort()).toEqual(['BSD-3-Clause', 'MIT']);
      },
    );
  });

  it('sorts components alphabetically by name', async () => {
    await withTempSbom(
      {
        components: [
          { name: 'zed', version: '1', purl: 'pkg:npm/zed@1' },
          { name: 'alpha', version: '1', purl: 'pkg:npm/alpha@1' },
          { name: 'middle', version: '1', purl: 'pkg:npm/middle@1' },
        ],
      },
      async (sbomPath) => {
        const result = await loadSbom(sbomPath);
        expect(result?.components.map((c) => c.name)).toEqual(['alpha', 'middle', 'zed']);
      },
    );
  });
});
