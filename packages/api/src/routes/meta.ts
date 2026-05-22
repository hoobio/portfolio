import type { FastifyPluginAsync } from 'fastify';
import type { Portfolio as PortfolioType } from '@hoobi-portfolio/schemas';

interface MetaOptions {
  portfolio: PortfolioType;
  baseUrl: string;
}

// SEO + AI-scraping endpoints. These live outside /api on purpose:
// crawlers and AI agents look at well-known paths like /robots.txt,
// /sitemap.xml and /llms.txt at the site root.
export const metaRoutes: FastifyPluginAsync<MetaOptions> = async (app, { portfolio, baseUrl }) => {
  app.get('/robots.txt', async (_request, reply) => {
    const body = [
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
      '',
    ].join('\n');
    return reply.type('text/plain').send(body);
  });

  app.get('/sitemap.xml', async (_request, reply) => {
    const lastmod = portfolio.generatedAt.split('T')[0];
    const urls = [
      { loc: `${baseUrl}/`, priority: '1.0' },
      { loc: `${baseUrl}/docs`, priority: '0.5' },
      { loc: `${baseUrl}/api/portfolio`, priority: '0.7' },
    ];
    const body =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map(
          ({ loc, priority }) =>
            `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><priority>${priority}</priority></url>`,
        )
        .join('\n') +
      `\n</urlset>\n`;
    return reply.type('application/xml').send(body);
  });

  // llms.txt: a community convention for surfacing site content to LLMs in a
  // structured, low-noise way. See https://llmstxt.org.
  app.get('/llms.txt', async (_request, reply) => {
    const { profile } = portfolio;
    const lines: string[] = [
      `# ${profile.name}`,
      '',
      `> ${profile.headline}`,
      '',
      profile.summary,
      '',
      '## Structured data',
      '',
      `- [Full portfolio JSON](${baseUrl}/api/portfolio)`,
      `- [OpenAPI specification](${baseUrl}/docs/json)`,
      `- [Swagger UI](${baseUrl}/docs)`,
      `- [CycloneDX SBOM](${baseUrl}/api/sbom/raw)`,
      '',
      '## Capability summary',
      '',
      ...portfolio.principles.map((principle) => `- **${principle.title}.** ${principle.summary}`),
      '',
      '## Contact',
      '',
      ...profile.contact.map((contact) => `- ${contact.kind}: ${contact.value}`),
      '',
    ];
    return reply.type('text/plain').send(lines.join('\n'));
  });
};
