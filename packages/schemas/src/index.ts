import { z } from 'zod';

const yyyymm = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/u, 'Expected YYYY-MM');

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, 'Expected YYYY-MM-DD');

const url = z.string().url();

export const ContactKind = z.enum(['email', 'github', 'linkedin', 'website', 'mastodon', 'bluesky']);

export const Contact = z
  .object({
    kind: ContactKind,
    value: z.string().min(1),
    display: z.string().min(1),
    primary: z.boolean().default(false),
  })
  .meta({ id: 'Contact' });

export const CloudFocusEntry = z
  .object({
    name: z.string(),
    level: z.enum(['primary', 'working', 'dabble', 'limited']),
    context: z.string(),
  })
  .meta({ id: 'CloudFocusEntry' });

export const CloudFocus = z
  .object({
    primary: z.string(),
    primaryDescription: z.string(),
    secondary: z.array(CloudFocusEntry).default([]),
  })
  .meta({ id: 'CloudFocus' });

export const Availability = z
  .object({
    status: z.enum([
      'open-to-conversations',
      'open-to-work',
      'open-to-consulting',
      'not-looking',
    ]),
    description: z.string(),
  })
  .meta({ id: 'Availability' });

export const Seo = z
  .object({
    description: z.string(),
    keywords: z.array(z.string()).default([]),
  })
  .meta({ id: 'Seo' });

export const Profile = z
  .object({
    name: z.string().min(1),
    preferredName: z.string().optional(),
    pronouns: z.string().optional(),
    role: z.string().min(1),
    location: z.string(),
    timezone: z.string().optional(),
    headline: z.string().min(1),
    tagline: z.string().optional(),
    summary: z.string().min(1),
    cloudFocus: CloudFocus,
    contact: z.array(Contact).min(1),
    availability: Availability,
    seo: Seo,
  })
  .meta({ id: 'Profile' });

export type Profile = z.infer<typeof Profile>;

export const Principle = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    summary: z.string().min(1),
    evidence: z.array(z.string()).default([]),
  })
  .meta({ id: 'Principle' });

export const Principles = z
  .object({
    principles: z.array(Principle).min(1),
  })
  .meta({ id: 'Principles' });

export type Principles = z.infer<typeof Principles>;

export const SkillLevel = z.enum(['deep', 'working', 'familiar']);

export const SkillGroup = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    level: SkillLevel,
    skills: z.array(z.string()).min(1),
  })
  .meta({ id: 'SkillGroup' });

export const Skills = z
  .object({
    groups: z.array(SkillGroup).min(1),
  })
  .meta({ id: 'Skills' });

export type Skills = z.infer<typeof Skills>;

export const WorkType = z.enum(['office', 'hybrid', 'remote']);

export const Experience = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    company: z.string().min(1),
    location: z.string(),
    workType: WorkType.optional(),
    start: yyyymm,
    end: z.union([yyyymm, z.literal('present')]),
    current: z.boolean().default(false),
    summary: z.string().min(1),
    highlights: z.array(z.string()).default([]),
    tech: z.array(z.string()).default([]),
  })
  .meta({ id: 'Experience' });

export const ExperienceList = z
  .object({
    experience: z.array(Experience).min(1),
  })
  .meta({ id: 'ExperienceList' });

export type ExperienceList = z.infer<typeof ExperienceList>;

export const ProjectKind = z.enum(['open-source', 'personal', 'work']);
export const ProjectStatus = z.enum(['active', 'shipped', 'in-design', 'archived']);
export const ProjectLinkKind = z.enum(['repo', 'website', 'docs', 'issue', 'store', 'demo']);

export const ProjectLink = z
  .object({
    kind: ProjectLinkKind,
    url,
  })
  .meta({ id: 'ProjectLink' });

export const Project = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    kind: ProjectKind,
    role: z.string(),
    status: ProjectStatus,
    start: yyyymm.optional(),
    summary: z.string().min(1),
    highlights: z.array(z.string()).default([]),
    tech: z.array(z.string()).default([]),
    links: z.array(ProjectLink).default([]),
  })
  .meta({ id: 'Project' });

export const Projects = z
  .object({
    projects: z.array(Project).min(1),
  })
  .meta({ id: 'Projects' });

export type Projects = z.infer<typeof Projects>;

export const AzureService = z
  .object({
    name: z.string().min(1),
    usage: z.string().min(1),
  })
  .meta({ id: 'AzureService' });

export const AzurePrinciple = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    services: z.array(AzureService).min(1),
  })
  .meta({ id: 'AzurePrinciple' });

export const AzureResources = z
  .object({
    principles: z.array(AzurePrinciple).min(1),
  })
  .meta({ id: 'AzureResources' });

export type AzureResources = z.infer<typeof AzureResources>;

export const Theme = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    receipts: z.array(z.string()).min(1),
  })
  .meta({ id: 'Theme' });

export const WorkThemes = z
  .object({
    themes: z.array(Theme).min(1),
  })
  .meta({ id: 'WorkThemes' });

export type WorkThemes = z.infer<typeof WorkThemes>;

// Aggregate response surfaced by `GET /api/portfolio`.
export const Portfolio = z
  .object({
    profile: Profile,
    principles: z.array(Principle),
    skills: z.array(SkillGroup),
    experience: z.array(Experience),
    projects: z.array(Project),
    azureResources: z.array(AzurePrinciple),
    themes: z.array(Theme),
    generatedAt: z.string(),
  })
  .meta({ id: 'Portfolio' });

export type Portfolio = z.infer<typeof Portfolio>;

// SBOM-related (CycloneDX subset, enough for the visualisation).
export const Severity = z.enum(['critical', 'high', 'medium', 'low', 'info', 'unassigned']);

export const ComponentVulnerability = z
  .object({
    id: z.string(),
    severity: Severity,
    cwe: z.string().optional(),
    title: z.string().optional(),
    url: z.string().optional(),
  })
  .meta({ id: 'ComponentVulnerability' });

export const SbomComponent = z
  .object({
    name: z.string(),
    version: z.string().optional(),
    type: z.string().optional(),
    purl: z.string().optional(),
    licenses: z.array(z.string()).default([]),
    vulnerabilities: z.array(ComponentVulnerability).default([]),
  })
  .meta({ id: 'SbomComponent' });

export const SeverityCounts = z
  .object({
    critical: z.number().int().nonnegative().default(0),
    high: z.number().int().nonnegative().default(0),
    medium: z.number().int().nonnegative().default(0),
    low: z.number().int().nonnegative().default(0),
    info: z.number().int().nonnegative().default(0),
    unassigned: z.number().int().nonnegative().default(0),
  })
  .meta({ id: 'SeverityCounts' });

export const VulnerabilityStatus = z
  .object({
    available: z.boolean(),
    source: z.string().optional(),
    projectUrl: z.string().optional(),
    lastScanned: z.string().optional(),
    counts: SeverityCounts,
    total: z.number().int().nonnegative(),
  })
  .meta({ id: 'VulnerabilityStatus' });

export const SbomSummary = z
  .object({
    serialNumber: z.string().optional(),
    bomFormat: z.string(),
    specVersion: z.string(),
    generatedAt: z.string().optional(),
    componentCount: z.number().int().nonnegative(),
    components: z.array(SbomComponent),
    vulnerabilities: VulnerabilityStatus,
  })
  .meta({ id: 'SbomSummary' });

export type SbomSummary = z.infer<typeof SbomSummary>;

export const HealthResponse = z
  .object({
    status: z.literal('ok'),
    uptimeSeconds: z.number().nonnegative(),
    version: z.string(),
  })
  .meta({ id: 'HealthResponse' });

export type HealthResponse = z.infer<typeof HealthResponse>;

// Re-export the iso date helpers in case downstream code wants them.
export { yyyymm, isoDate };
