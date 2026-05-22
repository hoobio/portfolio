import { readFile } from 'node:fs/promises';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { SbomSummary } from '@hoobi-portfolio/schemas';
import type { SbomSummary as SbomSummaryType } from '@hoobi-portfolio/schemas';

interface SbomRouteOptions {
  sbomPath: string;
  summary: SbomSummaryType | undefined;
}

export const sbomRoutes: FastifyPluginAsyncZod<SbomRouteOptions> = async (
  app,
  { sbomPath, summary },
) => {
  app.get(
    '/sbom',
    {
      schema: {
        summary: 'CycloneDX SBOM summary',
        description:
          'Parsed view of the CycloneDX SBOM emitted at build time. Useful for the SBOM visualisation in the UI. The raw CycloneDX document is available at `/api/sbom/raw`.',
        tags: ['sbom'],
        response: {
          200: SbomSummary,
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (_request, reply) => {
      if (!summary) {
        return reply.code(404).send({ message: 'No SBOM available. Run `pnpm sbom` first.' });
      }
      return summary;
    },
  );

  app.get(
    '/sbom/raw',
    {
      schema: {
        summary: 'Raw CycloneDX SBOM JSON document',
        description: 'The CycloneDX document as emitted by @cyclonedx/cyclonedx-npm.',
        tags: ['sbom'],
      },
    },
    async (_request, reply) => {
      try {
        const raw = await readFile(sbomPath, 'utf8');
        return reply.type('application/vnd.cyclonedx+json').send(raw);
      } catch {
        return reply.code(404).send({ message: 'No SBOM file at the configured path.' });
      }
    },
  );
};
