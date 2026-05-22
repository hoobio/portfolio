import Fastify from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { existsSync } from 'node:fs';
import fastifyStatic from '@fastify/static';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { config } from './config.js';
import { loadData } from './data-loader.js';
import { loadSbom } from './sbom-loader.js';
import { portfolioRoutes } from './routes/portfolio.js';
import { sbomRoutes } from './routes/sbom.js';
import { healthRoutes } from './routes/health.js';
import { metaRoutes } from './routes/meta.js';

async function start() {
  const loggerOpts =
    process.env['NODE_ENV'] === 'production'
      ? { level: config.logLevel }
      : {
          level: config.logLevel,
          transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'HH:MM:ss.l' },
          },
        };
  const app = Fastify({ logger: loggerOpts }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

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

  const { portfolio } = await loadData(config.dataDir);
  const sbomSummary = await loadSbom(config.sbomPath);

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Hoobi Portfolio API',
        description:
          'Living-resume API. Returns portfolio content sourced from YAML files in the repository, plus a CycloneDX SBOM summary.',
        version: config.version,
        contact: portfolio.profile.contact[0]?.value
          ? { name: portfolio.profile.name, email: portfolio.profile.contact[0].value }
          : { name: portfolio.profile.name },
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
      await api.register(healthRoutes, { version: config.version });
      await api.register(portfolioRoutes, { portfolio });
      await api.register(sbomRoutes, { sbomPath: config.sbomPath, summary: sbomSummary });
    },
    { prefix: '/api' },
  );

  const baseUrl = process.env['PUBLIC_BASE_URL'] ?? '';
  await app.register(metaRoutes, { portfolio, baseUrl });

  if (existsSync(config.webDistDir)) {
    await app.register(fastifyStatic, {
      root: config.webDistDir,
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
  } else {
    app.log.info(
      `Web bundle not found at ${config.webDistDir}; serving API-only. Run 'pnpm --filter @hoobi-portfolio/web build' first.`,
    );
  }

  try {
    await app.listen({ host: config.host, port: config.port });
    app.log.info(`API ready. Swagger UI at http://${config.host}:${config.port}/docs`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

await start();
