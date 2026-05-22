import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import {
  AzureResources,
  ExperienceList,
  Portfolio,
  Principles,
  Profile,
  Projects,
  Skills,
  WorkThemes,
} from '@hoobi-portfolio/schemas';

async function loadYaml<T>(path: string, schema: { parse: (input: unknown) => T }): Promise<T> {
  const raw = await readFile(path, 'utf8');
  const parsed: unknown = parseYaml(raw);
  return schema.parse(parsed);
}

export interface LoadedData {
  portfolio: Portfolio;
  profileKeywords: string[];
}

export async function loadData(dataDir: string): Promise<LoadedData> {
  const [profileData, principles, skills, experience, projects, azureResources, themes] =
    await Promise.all([
      loadYaml(join(dataDir, 'profile.yaml'), Profile),
      loadYaml(join(dataDir, 'principles.yaml'), Principles),
      loadYaml(join(dataDir, 'skills.yaml'), Skills),
      loadYaml(join(dataDir, 'experience.yaml'), ExperienceList),
      loadYaml(join(dataDir, 'projects.yaml'), Projects),
      loadYaml(join(dataDir, 'azure-resources.yaml'), AzureResources),
      loadYaml(join(dataDir, 'work-themes.yaml'), WorkThemes),
    ]);

  const portfolio = Portfolio.parse({
    profile: profileData,
    principles: principles.principles,
    skills: skills.groups,
    experience: experience.experience,
    projects: projects.projects,
    azureResources: azureResources.principles,
    themes: themes.themes,
    generatedAt: new Date().toISOString(),
  });

  return {
    portfolio,
    profileKeywords: profileData.seo.keywords,
  };
}
