import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadSbom } from '../src/sbom-loader.js';

describe('loadSbom', () => {
  it('returns undefined when the file is missing', async () => {
    const result = await loadSbom('/path/that/does/not/exist.json');
    expect(result).toBeUndefined();
  });

  it('parses a CycloneDX document, normalising licenses', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'hoobi-portfolio-sbom-'));
    const sbomPath = join(dir, 'sbom.cdx.json');
    writeFileSync(
      sbomPath,
      JSON.stringify({
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
          {},
        ],
      }),
    );
    try {
      const result = await loadSbom(sbomPath);
      expect(result).toBeDefined();
      expect(result?.bomFormat).toBe('CycloneDX');
      expect(result?.specVersion).toBe('1.5');
      expect(result?.componentCount).toBe(5);
      expect(result?.components[0]?.licenses).toEqual(['MIT']);
      expect(result?.components[1]?.licenses).toEqual(['Apache-2.0 OR MIT']);
      expect(result?.components[2]?.licenses).toEqual(['BSD-3-Clause']);
      expect(result?.components[3]?.licenses).toEqual([]);
      expect(result?.components[4]?.name).toBe('unknown');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('defaults the bomFormat and specVersion when absent', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'hoobi-portfolio-sbom-'));
    const sbomPath = join(dir, 'sbom.cdx.json');
    writeFileSync(sbomPath, JSON.stringify({ components: [] }));
    try {
      const result = await loadSbom(sbomPath);
      expect(result?.bomFormat).toBe('CycloneDX');
      expect(result?.specVersion).toBe('unknown');
      expect(result?.componentCount).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
