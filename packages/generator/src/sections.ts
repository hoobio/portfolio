import type { Portfolio } from '@hoobi-portfolio/schemas';

// Map between the URL slug used on the site / API and the YAML file on disk.
// The UI's Section component uses these same slugs so the `json` / `yaml`
// links in each section header resolve here.
export const YAML_FILE_MAP: Record<string, string> = {
  profile: 'profile.yaml',
  principles: 'principles.yaml',
  skills: 'skills.yaml',
  experience: 'experience.yaml',
  projects: 'projects.yaml',
  'azure-resources': 'azure-resources.yaml',
  themes: 'work-themes.yaml',
};

export const SECTION_SLUGS = Object.keys(YAML_FILE_MAP);

// Slug -> portfolio property accessor. Most slugs match the property name
// directly; azure-resources and themes don't (see YAML_FILE_MAP above).
const SECTION_ACCESSORS: Record<string, (portfolio: Portfolio) => unknown> = {
  profile: (p) => p.profile,
  principles: (p) => p.principles,
  skills: (p) => p.skills,
  experience: (p) => p.experience,
  projects: (p) => p.projects,
  'azure-resources': (p) => p.azureResources,
  themes: (p) => p.themes,
};

export function getSection(portfolio: Portfolio, slug: string): unknown {
  const accessor = SECTION_ACCESSORS[slug];
  if (!accessor) throw new Error(`Unknown section slug: ${slug}`);
  return accessor(portfolio);
}
