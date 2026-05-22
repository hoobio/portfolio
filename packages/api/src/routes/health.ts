import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HealthResponse } from '@hoobi-portfolio/schemas';

interface HealthOptions {
  version: string;
}

export const healthRoutes: FastifyPluginAsyncZod<HealthOptions> = async (app, { version }) => {
  const startedAt = Date.now();
  app.get(
    '/health',
    {
      schema: {
        summary: 'Liveness probe',
        tags: ['system'],
        response: { 200: HealthResponse },
      },
    },
    async () => ({
      status: 'ok' as const,
      uptimeSeconds: (Date.now() - startedAt) / 1000,
      version,
    }),
  );
};
