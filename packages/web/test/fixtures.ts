import type { Portfolio, SbomSummary } from '@hoobi-portfolio/schemas';

export const portfolioFixture: Portfolio = {
  profile: {
    name: 'Alex Hill',
    preferredName: 'Alex',
    pronouns: 'he/him',
    role: 'Senior Platform Engineer',
    location: 'Melbourne',
    headline: 'Speed and security are not at odds.',
    summary: 'Senior Platform Engineer based in Melbourne.',
    cloudFocus: {
      primary: 'Azure',
      primaryDescription: 'Azure primary.',
      secondary: [{ name: 'AWS', level: 'working', context: 'regulated workloads' }],
    },
    contact: [
      { kind: 'email', value: 'a@b.com', display: 'a@b.com', primary: true },
      { kind: 'github', value: 'https://github.com/hoobio', display: 'github.com/hoobio', primary: false },
      { kind: 'linkedin', value: 'https://linkedin.com/in/x', display: 'linkedin', primary: false },
    ],
    availability: { status: 'open-to-conversations', description: 'Open to chats.' },
    seo: { description: 'sd', keywords: ['platform', 'azure'] },
  },
  principles: [
    { id: 'sbd', title: 'Secure by default', summary: 'Security is a property of the platform.', evidence: ['ev1', 'ev2'] },
    { id: 'speed', title: 'Speed is quality', summary: 'Faster when guard rails do work for you.', evidence: [] },
  ],
  skills: [
    { id: 'platform', title: 'Platform Engineering', level: 'deep', skills: ['Kubernetes', 'Helm'] },
    { id: 'lang', title: 'Languages', level: 'working', skills: ['TypeScript', '.NET'] },
  ],
  experience: [
    {
      id: 'r1',
      title: 'Senior Platform Engineer',
      company: 'Nintex',
      location: 'Melbourne',
      start: '2024-01',
      end: 'present',
      current: true,
      summary: 'Current role.',
      highlights: ['Did X', 'Shipped Y'],
      tech: ['Azure', 'Kubernetes'],
    },
    {
      id: 'r2',
      title: 'Platform Engineer',
      company: 'Nintex',
      location: 'Melbourne',
      start: '2021-01',
      end: '2024-01',
      current: false,
      summary: 'Prior role.',
      highlights: [],
      tech: [],
    },
  ],
  projects: [
    {
      id: 'pr1',
      title: 'Command Palette Bitwarden',
      kind: 'open-source',
      role: 'maintainer',
      status: 'active',
      summary: 'Bitwarden for Command Palette.',
      highlights: ['.NET 10', 'Signed MSI'],
      tech: ['.NET 10', 'WinUI 3', 'WiX 5'],
      links: [{ kind: 'repo', url: 'https://github.com/hoobio/command-palette-bitwarden' }],
    },
  ],
  azureResources: [
    {
      id: 'compute',
      title: 'Compute',
      description: 'Where things run.',
      services: [
        { name: 'AKS', usage: 'Primary platform' },
        { name: 'Container Apps', usage: 'Lightweight hosting' },
      ],
    },
  ],
  themes: [
    {
      id: 'identity',
      title: 'Identity modernisation',
      description: 'Replacing static credentials.',
      receipts: ['PAT migration', 'OIDC federation'],
    },
  ],
  generatedAt: '2026-05-22T12:00:00.000Z',
};

export const sbomFixture: SbomSummary = {
  bomFormat: 'CycloneDX',
  specVersion: '1.5',
  generatedAt: '2026-05-22T00:00:00Z',
  componentCount: 3,
  components: [
    { name: 'react', version: '19.0.0', type: 'library', purl: 'pkg:npm/react@19.0.0', licenses: ['MIT'], vulnerabilities: [] },
    { name: 'zod', version: '4.0.0', type: 'library', purl: 'pkg:npm/zod@4.0.0', licenses: [], vulnerabilities: [] },
    { name: 'fastify', version: '5.0.0', type: 'library', purl: 'pkg:npm/fastify@5.0.0', licenses: ['MIT'], vulnerabilities: [] },
  ],
  vulnerabilities: {
    available: false,
    counts: { critical: 0, high: 0, medium: 0, low: 0, info: 0, unassigned: 0 },
    total: 0,
  },
};
