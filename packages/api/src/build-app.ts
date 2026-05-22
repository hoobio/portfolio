import { existsSync } from 'node:fs';
import Fastify, { type FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import type { Portfolio, SbomSummary } from '@hoobi-portfolio/schemas';
import { portfolioRoutes } from './routes/portfolio.js';
import { sbomRoutes } from './routes/sbom.js';
import { healthRoutes } from './routes/health.js';
import { metaRoutes } from './routes/meta.js';

export interface BuildAppOptions {
  portfolio: Portfolio;
  sbomSummary: SbomSummary | undefined;
  sbomPath: string;
  webDistDir: string;
  dataDir: string;
  version: string;
  baseUrl: string;
  logger?: boolean;
}

export async function buildApp(opts: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: opts.logger ?? false }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Edge-friendly cache headers so Cloudflare can absorb most traffic.
  // The portfolio data is regenerated on container restart; 5-minute CDN
  // freshness is fine. Health is always live.
  app.addHook('onSend', async (request, reply, payload) => {
    if (reply.getHeader('Cache-Control')) return payload;
    const url = request.url;
    if (url === '/api/health') {
      reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (url.startsWith('/api/portfolio') || url.startsWith('/api/sbom')) {
      reply.header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    } else if (url === '/llms.txt' || url === '/robots.txt' || url === '/sitemap.xml') {
      reply.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    } else if (url.startsWith('/docs')) {
      reply.header('Cache-Control', 'public, max-age=60, s-maxage=300');
    }
    return payload;
  });

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Hoobi Portfolio API',
        description:
          'Living-resume API. Returns portfolio content sourced from YAML files in the repository, plus a CycloneDX SBOM summary.',
        version: opts.version,
        contact: opts.portfolio.profile.contact[0]?.value
          ? { name: opts.portfolio.profile.name, email: opts.portfolio.profile.contact[0].value }
          : { name: opts.portfolio.profile.name },
        license: { name: 'MIT' },
      },
      servers: [{ url: '/' }],
      tags: [
        { name: 'portfolio', description: 'Portfolio content endpoints' },
        { name: 'sbom', description: 'Software Bill of Materials' },
        { name: 'system', description: 'System endpoints' },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  });

  await app.register(
    async (api) => {
      await api.register(healthRoutes, { version: opts.version });
      await api.register(portfolioRoutes, { portfolio: opts.portfolio, dataDir: opts.dataDir });
      await api.register(sbomRoutes, { sbomPath: opts.sbomPath, summary: opts.sbomSummary });
    },
    { prefix: '/api' },
  );

  await app.register(metaRoutes, { portfolio: opts.portfolio, baseUrl: opts.baseUrl });

  if (existsSync(opts.webDistDir)) {
    await app.register(fastifyStatic, {
      root: opts.webDistDir,
      prefix: '/',
      wildcard: false,
    });
    app.setNotFoundHandler(async (request, reply) => {
      const accept = request.headers.accept ?? '';
      const url = request.url;
      const isApi = url.startsWith('/api') || url.startsWith('/docs');
      if (request.method === 'GET' && !isApi && accept.includes('text/html')) {
        return reply.sendFile('index.html');
      }
      return reply.code(404).send({ message: 'Not found' });
    });
  }

  return app;
}
