import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { Portfolio } from '@hoobi-portfolio/schemas';
import type { Portfolio as PortfolioType } from '@hoobi-portfolio/schemas';

// Map between the URL slug used on the site / API and the YAML file on disk.
// The UI's Section component uses these same slugs so the `json` / `yaml`
// links in each section header resolve here.
const YAML_FILE_MAP: Record<string, string> = {
  profile: 'profile.yaml',
  principles: 'principles.yaml',
  skills: 'skills.yaml',
  experience: 'experience.yaml',
  projects: 'projects.yaml',
  'azure-resources': 'azure-resources.yaml',
  themes: 'work-themes.yaml',
};

interface PortfolioRoutesOpts {
  portfolio: PortfolioType;
  dataDir: string;
}

export const portfolioRoutes: FastifyPluginAsyncZod<PortfolioRoutesOpts> = async (
  app,
  { portfolio, dataDir },
) => {
  app.get(
    '/portfolio',
    {
      schema: {
        summary: 'Full portfolio payload',
        description:
          'Returns the entire portfolio content - profile, principles, skills, experience, projects, Azure resource principles, and recurring engineering themes. Source of truth is the YAML files under `data/`.',
        tags: ['portfolio'],
        response: { 200: Portfolio },
      },
    },
    async () => portfolio,
  );

  app.get(
    '/portfolio/profile',
    {
      schema: {
        summary: 'Profile only',
        tags: ['portfolio'],
        response: { 200: Portfolio.shape.profile },
      },
    },
    async () => portfolio.profile,
  );

  app.get(
    '/portfolio/principles',
    {
      schema: {
        summary: 'Engineering principles',
        tags: ['portfolio'],
        response: { 200: Portfolio.shape.principles },
      },
    },
    async () => portfolio.principles,
  );

  app.get(
    '/portfolio/skills',
    {
      schema: {
        summary: 'Skill groups',
        tags: ['portfolio'],
        response: { 200: Portfolio.shape.skills },
      },
    },
    async () => portfolio.skills,
  );

  app.get(
    '/portfolio/experience',
    {
      schema: {
        summary: 'Role history',
        tags: ['portfolio'],
        response: { 200: Portfolio.shape.experience },
      },
    },
    async () => portfolio.experience,
  );

  app.get(
    '/portfolio/projects',
    {
      schema: {
        summary: 'Flagship and open-source projects',
        tags: ['portfolio'],
        response: { 200: Portfolio.shape.projects },
      },
    },
    async () => portfolio.projects,
  );

  app.get(
    '/portfolio/azure-resources',
    {
      schema: {
        summary: 'Azure services grouped by architectural principle',
        tags: ['portfolio'],
        response: { 200: Portfolio.shape.azureResources },
      },
    },
    async () => portfolio.azureResources,
  );

  app.get(
    '/portfolio/themes',
    {
      schema: {
        summary: 'Recurring engineering themes',
        tags: ['portfolio'],
        response: { 200: Portfolio.shape.themes },
      },
    },
    async () => portfolio.themes,
  );

  // Raw YAML passthrough so each section in the UI can link out to the
  // source file. We serve it as application/yaml and inline disposition.
  app.get<{ Params: { name: string } }>(
    '/portfolio/:name.yaml',
    {
      schema: {
        summary: 'Raw YAML source for a section',
        description:
          'Returns the YAML file in data/ that backs the given section. Useful for tooling and "view source" links from the UI.',
        tags: ['portfolio'],
      },
    },
    async (request, reply) => {
      const name = request.params.name;
      const filename = YAML_FILE_MAP[name];
      if (!filename) {
        return reply.code(404).send({ message: `Unknown section: ${name}` });
      }
      const raw = await readFile(join(dataDir, filename), 'utf8');
      return reply
        .type('application/yaml; charset=utf-8')
        .header('Content-Disposition', `inline; filename="${filename}"`)
        .send(raw);
    },
  );
};
