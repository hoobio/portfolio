import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { Portfolio } from '@hoobi-portfolio/schemas';
import type { Portfolio as PortfolioType } from '@hoobi-portfolio/schemas';

export const portfolioRoutes: FastifyPluginAsyncZod<{ portfolio: PortfolioType }> = async (
  app,
  { portfolio },
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
};
