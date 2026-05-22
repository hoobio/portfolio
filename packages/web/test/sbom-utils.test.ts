import { describe, expect, it } from 'vitest';
import { bucketByEcosystem, ecosystemFromPurl } from '../src/components/Sbom.js';
import type { SbomSummary } from '@hoobi-portfolio/schemas';

describe('ecosystemFromPurl', () => {
  it.each([
    ['pkg:npm/react@19', 'npm'],
    ['pkg:nuget/Newtonsoft.Json@13', 'nuget'],
    ['pkg:maven/com.foo/bar@1.0', 'maven'],
    ['pkg:pypi/requests@2.0', 'pypi'],
  ])('extracts ecosystem from %s', (purl, expected) => {
    expect(ecosystemFromPurl(purl)).toBe(expected);
  });

  it('returns "unknown" when purl is missing', () => {
    expect(ecosystemFromPurl(undefined)).toBe('unknown');
  });

  it('returns "unknown" for malformed purls', () => {
    expect(ecosystemFromPurl('not-a-purl')).toBe('unknown');
  });
});

describe('bucketByEcosystem', () => {
  it('groups components by ecosystem, sorted descending', () => {
    const sbom: SbomSummary = {
      bomFormat: 'CycloneDX',
      specVersion: '1.5',
      componentCount: 4,
      components: [
        { name: 'a', purl: 'pkg:npm/a', licenses: [] },
        { name: 'b', purl: 'pkg:npm/b', licenses: [] },
        { name: 'c', purl: 'pkg:nuget/c', licenses: [] },
        { name: 'd', licenses: [] },
      ],
    };
    const buckets = bucketByEcosystem(sbom);
    expect(buckets[0]?.name).toBe('npm');
    expect(buckets[0]?.count).toBe(2);
    expect(buckets.find((b) => b.name === 'nuget')?.count).toBe(1);
    expect(buckets.find((b) => b.name === 'unknown')?.count).toBe(1);
  });
});
