import type { Portfolio, SbomSummary } from '@hoobi-portfolio/schemas';

export const portfolioFixture: Portfolio = {
  profile: {
    name: 'Alex Hill',
    role: 'Senior Platform Engineer',
    location: 'Melbourne',
    headline: 'h',
    summary: 's',
    cloudFocus: { primary: 'Azure', primaryDescription: 'p', secondary: [] },
    contact: [{ kind: 'email', value: 'a@b.com', display: 'a@b.com', primary: true }],
    availability: { status: 'open-to-conversations', description: 'd' },
    seo: { description: 'sd', keywords: ['kw'] },
  },
  principles: [{ id: 'p', title: 'P', summary: 'ps', evidence: ['e'] }],
  skills: [{ id: 'g', title: 'G', level: 'deep', skills: ['s'] }],
  experience: [
    {
      id: 'r1',
      title: 'Engineer',
      company: 'Co',
      location: 'l',
      start: '2020-01',
      end: 'present',
      current: true,
      summary: 's',
      highlights: ['h'],
      tech: ['t'],
    },
  ],
  projects: [
    {
      id: 'pr1',
      title: 'Pr',
      kind: 'open-source',
      role: 'maintainer',
      status: 'active',
      summary: 's',
      highlights: [],
      tech: [],
      links: [],
    },
  ],
  azureResources: [
    {
      id: 'compute',
      title: 'Compute',
      description: 'd',
      services: [{ name: 'AKS', usage: 'u' }],
    },
  ],
  themes: [{ id: 't', title: 'T', description: 'd', receipts: ['r'] }],
  generatedAt: '2026-05-22T00:00:00.000Z',
};

export const sbomSummaryFixture: SbomSummary = {
  bomFormat: 'CycloneDX',
  specVersion: '1.5',
  generatedAt: '2026-05-22T00:00:00Z',
  componentCount: 2,
  components: [
    { name: 'react', version: '19.0.0', type: 'library', purl: 'pkg:npm/react@19.0.0', licenses: ['MIT'], vulnerabilities: [] },
    { name: 'zod', version: '4.0.0', type: 'library', purl: 'pkg:npm/zod@4.0.0', licenses: [], vulnerabilities: [] },
  ],
  vulnerabilities: {
    available: false,
    counts: { critical: 0, high: 0, medium: 0, low: 0, info: 0, unassigned: 0 },
    total: 0,
  },
};
