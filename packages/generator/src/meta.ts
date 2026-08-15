import type { Portfolio } from '@hoobi-portfolio/schemas';

// SEO + AI-scraping files. These are emitted to the site origin on purpose:
// crawlers and AI agents look at well-known paths like /robots.txt,
// /sitemap.xml and /llms.txt at the site root, not the API origin.

export function renderRobots(siteBaseUrl: string): string {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${siteBaseUrl}/sitemap.xml`, ''].join('\n');
}

export function renderSitemap(portfolio: Portfolio, siteBaseUrl: string): string {
  const lastmod = portfolio.generatedAt.split('T')[0];
  // Cross-origin URLs (api.hoobi.dev) are deliberately excluded: a sitemap
  // may only list URLs on the same host as the sitemap itself.
  const urls = [
    { loc: `${siteBaseUrl}/`, priority: '1.0' },
    { loc: `${siteBaseUrl}/sbom`, priority: '0.8' },
    { loc: `${siteBaseUrl}/docs`, priority: '0.5' },
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
  return body;
}

// llms.txt: a community convention for surfacing site content to LLMs in a
// structured, low-noise way. See https://llmstxt.org. Links here are
// absolute and cross-origin on purpose - this is prose, not a sitemap.
export function renderLlmsTxt(portfolio: Portfolio, siteBaseUrl: string, apiBaseUrl: string): string {
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
    `- [Full portfolio JSON](${apiBaseUrl}/portfolio.json)`,
    `- [OpenAPI specification](${siteBaseUrl}/docs/openapi.json)`,
    `- [Swagger UI](${siteBaseUrl}/docs)`,
    `- [CycloneDX SBOM](${apiBaseUrl}/sbom.cdx.json)`,
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
  return lines.join('\n');
}
