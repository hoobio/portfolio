import { describe, expect, it } from 'vitest';
import {
  Availability,
  AzurePrinciple,
  AzureResources,
  AzureService,
  CloudFocus,
  CloudFocusEntry,
  Contact,
  ContactKind,
  Experience,
  ExperienceList,
  HealthResponse,
  Portfolio,
  Principle,
  Principles,
  Project,
  ProjectLink,
  Projects,
  Profile,
  SbomComponent,
  SbomSummary,
  SkillGroup,
  Skills,
  Theme,
  WorkThemes,
  isoDate,
  yyyymm,
} from '../src/index.js';

describe('helpers', () => {
  it('yyyymm accepts valid month strings', () => {
    expect(yyyymm.parse('2026-05')).toBe('2026-05');
  });
  it('yyyymm rejects invalid month strings', () => {
    expect(() => yyyymm.parse('2026-13')).toThrow();
    expect(() => yyyymm.parse('not-a-date')).toThrow();
  });
  it('isoDate accepts valid date strings', () => {
    expect(isoDate.parse('2026-05-22')).toBe('2026-05-22');
  });
  it('isoDate rejects non-date strings', () => {
    expect(() => isoDate.parse('2026-05')).toThrow();
  });
});

describe('ContactKind', () => {
  it.each(['email', 'github', 'linkedin', 'website', 'mastodon', 'bluesky'])(
    'accepts %s',
    (kind) => {
      expect(ContactKind.parse(kind)).toBe(kind);
    },
  );
  it('rejects unknown kinds', () => {
    expect(() => ContactKind.parse('telegram')).toThrow();
  });
});

describe('Contact', () => {
  it('parses with defaults', () => {
    const parsed = Contact.parse({ kind: 'email', value: 'a@b.com', display: 'a@b.com' });
    expect(parsed.primary).toBe(false);
  });
  it('respects primary flag', () => {
    const parsed = Contact.parse({
      kind: 'github',
      value: 'https://gh.com/x',
      display: 'gh',
      primary: true,
    });
    expect(parsed.primary).toBe(true);
  });
});

describe('CloudFocus', () => {
  it('parses with empty secondary array default', () => {
    const parsed = CloudFocus.parse({ primary: 'Azure', primaryDescription: 'Lots.' });
    expect(parsed.secondary).toEqual([]);
  });
  it('parses with secondary entries', () => {
    const entry = CloudFocusEntry.parse({ name: 'AWS', level: 'working', context: 'some' });
    expect(entry.name).toBe('AWS');
  });
  it('rejects invalid cloud focus level', () => {
    expect(() =>
      CloudFocusEntry.parse({ name: 'X', level: 'guru', context: 'no' }),
    ).toThrow();
  });
});

const profileFixture = () => ({
  name: 'Alex',
  role: 'Engineer',
  location: 'Melbourne',
  headline: 'h',
  summary: 's',
  cloudFocus: { primary: 'Azure', primaryDescription: 'p' },
  contact: [{ kind: 'email' as const, value: 'a@b.com', display: 'a@b.com', primary: true }],
  availability: { status: 'open-to-conversations' as const, description: 'd' },
  seo: { description: 'd' },
});

describe('Profile', () => {
  it('parses minimal profile', () => {
    const parsed = Profile.parse(profileFixture());
    expect(parsed.name).toBe('Alex');
    expect(parsed.seo.keywords).toEqual([]);
  });
  it('rejects empty contact array', () => {
    const fixture = profileFixture();
    fixture.contact = [];
    expect(() => Profile.parse(fixture)).toThrow();
  });
  it('accepts optional preferredName and pronouns', () => {
    const parsed = Profile.parse({ ...profileFixture(), preferredName: 'A', pronouns: 'he/him' });
    expect(parsed.preferredName).toBe('A');
  });
});

describe('Availability', () => {
  it.each([
    'open-to-conversations',
    'open-to-work',
    'open-to-consulting',
    'not-looking',
  ] as const)('accepts %s', (status) => {
    expect(Availability.parse({ status, description: 'x' }).status).toBe(status);
  });
});

describe('Principle and Principles', () => {
  it('parses a Principle with default evidence', () => {
    const p = Principle.parse({ id: 'a', title: 't', summary: 's' });
    expect(p.evidence).toEqual([]);
  });
  it('requires at least one principle in container', () => {
    expect(() => Principles.parse({ principles: [] })).toThrow();
  });
});

describe('SkillGroup and Skills', () => {
  it('parses with all levels', () => {
    for (const level of ['deep', 'working', 'familiar'] as const) {
      expect(
        SkillGroup.parse({ id: 'x', title: 't', level, skills: ['a'] }).level,
      ).toBe(level);
    }
  });
  it('requires at least one skill', () => {
    expect(() =>
      SkillGroup.parse({ id: 'x', title: 't', level: 'deep', skills: [] }),
    ).toThrow();
  });
  it('Skills container requires at least one group', () => {
    expect(() => Skills.parse({ groups: [] })).toThrow();
  });
});

describe('Experience', () => {
  const ex = {
    id: 'x',
    title: 't',
    company: 'c',
    location: 'l',
    start: '2020-01',
    end: 'present',
    summary: 's',
  };
  it('parses with `present` end and defaults', () => {
    const parsed = Experience.parse(ex);
    expect(parsed.end).toBe('present');
    expect(parsed.current).toBe(false);
    expect(parsed.highlights).toEqual([]);
  });
  it('parses with concrete end date', () => {
    expect(Experience.parse({ ...ex, end: '2024-12' }).end).toBe('2024-12');
  });
  it('rejects invalid end', () => {
    expect(() => Experience.parse({ ...ex, end: '2024' })).toThrow();
  });
  it('ExperienceList requires at least one entry', () => {
    expect(() => ExperienceList.parse({ experience: [] })).toThrow();
  });
});

describe('Project', () => {
  const proj = {
    id: 'p',
    title: 'T',
    kind: 'open-source' as const,
    role: 'maintainer',
    status: 'active' as const,
    summary: 'sum',
  };
  it('parses with defaults', () => {
    const parsed = Project.parse(proj);
    expect(parsed.highlights).toEqual([]);
    expect(parsed.tech).toEqual([]);
    expect(parsed.links).toEqual([]);
  });
  it('rejects bad URL in link', () => {
    expect(() => ProjectLink.parse({ kind: 'repo', url: 'not-a-url' })).toThrow();
  });
  it('accepts a real URL', () => {
    expect(ProjectLink.parse({ kind: 'repo', url: 'https://x.test' }).url).toBe(
      'https://x.test',
    );
  });
  it('Projects container requires entries', () => {
    expect(() => Projects.parse({ projects: [] })).toThrow();
  });
});

describe('AzureResources', () => {
  it('parses a complete structure', () => {
    const service = AzureService.parse({ name: 'AKS', usage: 'workloads' });
    expect(service.name).toBe('AKS');
    const principle = AzurePrinciple.parse({
      id: 'compute',
      title: 'Compute',
      description: 'd',
      services: [service],
    });
    expect(
      AzureResources.parse({ principles: [principle] }).principles[0]?.title,
    ).toBe('Compute');
  });
  it('rejects empty services array', () => {
    expect(() =>
      AzurePrinciple.parse({ id: 'x', title: 't', description: 'd', services: [] }),
    ).toThrow();
  });
});

describe('WorkThemes', () => {
  it('parses themes with receipts', () => {
    const t = Theme.parse({ id: 't', title: 'T', description: 'd', receipts: ['a'] });
    expect(t.receipts.length).toBe(1);
    expect(WorkThemes.parse({ themes: [t] }).themes.length).toBe(1);
  });
  it('rejects theme with no receipts', () => {
    expect(() =>
      Theme.parse({ id: 't', title: 'T', description: 'd', receipts: [] }),
    ).toThrow();
  });
});

describe('SbomSummary', () => {
  it('parses with components', () => {
    const c = SbomComponent.parse({ name: 'react' });
    expect(c.licenses).toEqual([]);
    expect(
      SbomSummary.parse({ bomFormat: 'CycloneDX', specVersion: '1.5', componentCount: 1, components: [c] })
        .componentCount,
    ).toBe(1);
  });
  it('rejects negative component counts', () => {
    expect(() =>
      SbomSummary.parse({
        bomFormat: 'CycloneDX',
        specVersion: '1.5',
        componentCount: -1,
        components: [],
      }),
    ).toThrow();
  });
});

describe('HealthResponse', () => {
  it('parses ok', () => {
    expect(HealthResponse.parse({ status: 'ok', uptimeSeconds: 1, version: '1.0' }).version).toBe(
      '1.0',
    );
  });
  it('rejects non-ok status', () => {
    expect(() =>
      HealthResponse.parse({ status: 'down', uptimeSeconds: 1, version: '1.0' }),
    ).toThrow();
  });
});

describe('Portfolio aggregate', () => {
  it('parses an end-to-end fixture', () => {
    const portfolio = Portfolio.parse({
      profile: profileFixture(),
      principles: [Principle.parse({ id: 'p', title: 'P', summary: 's' })],
      skills: [SkillGroup.parse({ id: 'g', title: 'G', level: 'deep', skills: ['s'] })],
      experience: [
        Experience.parse({
          id: 'r',
          title: 't',
          company: 'c',
          location: 'l',
          start: '2020-01',
          end: 'present',
          summary: 's',
        }),
      ],
      projects: [
        Project.parse({
          id: 'p1',
          title: 'P1',
          kind: 'open-source',
          role: 'r',
          status: 'active',
          summary: 's',
        }),
      ],
      azureResources: [
        AzurePrinciple.parse({
          id: 'a',
          title: 'A',
          description: 'd',
          services: [AzureService.parse({ name: 's', usage: 'u' })],
        }),
      ],
      themes: [Theme.parse({ id: 't', title: 'T', description: 'd', receipts: ['r'] })],
      generatedAt: new Date().toISOString(),
    });
    expect(portfolio.profile.name).toBe('Alex');
  });
});
