import { createRequire } from 'node:module';
import { mkdir, readFile, rm, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { config as defaultConfig } from './config.js';
import { loadData } from './data-loader.js';
import { loadSbom } from './sbom-loader.js';
import { YAML_FILE_MAP, SECTION_SLUGS, getSection } from './sections.js';
import { renderRobots, renderSitemap, renderLlmsTxt } from './meta.js';
import { buildOpenApiDocument } from './openapi.js';

const require = createRequire(import.meta.url);

type EmitConfig = typeof defaultConfig;

async function writeJson(path: string, data: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function emitSwaggerUi(docsDir: string): Promise<void> {
  const swaggerUiDist = (require('swagger-ui-dist') as { absolutePath: () => string }).absolutePath();
  await Promise.all(
    ['swagger-ui.css', 'swagger-ui-bundle.js'].map((file) =>
      copyFile(join(swaggerUiDist, file), join(docsDir, file)),
    ),
  );
  // Init logic lives in its own file rather than an inline <script>, so the
  // CSP's script-src can stay 'self' with no 'unsafe-inline'.
  const initJs = `window.onload = () => {
  window.ui = SwaggerUIBundle({
    url: '/docs/openapi.json',
    dom_id: '#swagger-ui',
    presets: [SwaggerUIBundle.presets.apis],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: 'BaseLayout',
  });
};
`;
  await writeFile(join(docsDir, 'init.js'), initJs, 'utf8');

  // Absolute /docs/ paths, not relative - the browser URL for this page is
  // "/docs" with no trailing slash, which resolves "./foo" against "/" not
  // "/docs/".
  const html = `<!doctype html>
<html lang="en-AU">
  <head>
    <meta charset="UTF-8" />
    <title>Hoobi Portfolio API - Docs</title>
    <link rel="stylesheet" href="/docs/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/docs/swagger-ui-bundle.js"></script>
    <script src="/docs/init.js"></script>
  </body>
</html>
`;
  await writeFile(join(docsDir, 'index.html'), html, 'utf8');
}

export async function emitStatic(cfg: EmitConfig = defaultConfig): Promise<void> {
  const { portfolio } = await loadData(cfg.dataDir);
  const sbomSummary = await loadSbom(cfg.sbomPath);

  await rm(cfg.apiOutDir, { recursive: true, force: true });
  await rm(cfg.siteOutDir, { recursive: true, force: true });
  const apiPortfolioDir = join(cfg.apiOutDir, 'portfolio');
  const docsDir = join(cfg.siteOutDir, 'docs');
  await mkdir(apiPortfolioDir, { recursive: true });
  await mkdir(docsDir, { recursive: true });

  // --- API payload (published to blob storage) ---

  await writeJson(join(cfg.apiOutDir, 'portfolio.json'), portfolio);

  await Promise.all(
    SECTION_SLUGS.map(async (slug) => {
      await writeJson(join(apiPortfolioDir, `${slug}.json`), getSection(portfolio, slug));
      const yamlSource = join(cfg.dataDir, YAML_FILE_MAP[slug]!);
      await copyFile(yamlSource, join(apiPortfolioDir, `${slug}.yaml`));
    }),
  );

  if (sbomSummary) {
    await writeJson(join(cfg.apiOutDir, 'sbom.json'), sbomSummary);
  } else {
    console.warn('emit-static: no SBOM summary available, skipping sbom.json');
  }
  try {
    const raw = await readFile(cfg.sbomPath, 'utf8');
    await writeFile(join(cfg.apiOutDir, 'sbom.cdx.json'), raw, 'utf8');
  } catch {
    console.warn('emit-static: no raw SBOM file at', cfg.sbomPath, '- skipping sbom.cdx.json');
  }

  const versionPayload = { status: 'ok' as const, version: cfg.version, generatedAt: cfg.generatedAt };
  await writeJson(join(cfg.apiOutDir, 'version.json'), versionPayload);

  // --- Site-root files (merged into the SPA bundle) ---

  await writeJson(join(cfg.siteOutDir, 'version.json'), versionPayload);
  await writeFile(join(cfg.siteOutDir, 'robots.txt'), renderRobots(cfg.publicBaseUrl), 'utf8');
  await writeFile(join(cfg.siteOutDir, 'sitemap.xml'), renderSitemap(portfolio, cfg.publicBaseUrl), 'utf8');
  await writeFile(
    join(cfg.siteOutDir, 'llms.txt'),
    renderLlmsTxt(portfolio, cfg.publicBaseUrl, cfg.apiBaseUrl),
    'utf8',
  );

  const openapiDoc = buildOpenApiDocument({ version: cfg.version, apiBaseUrl: cfg.apiBaseUrl });
  await writeJson(join(docsDir, 'openapi.json'), openapiDoc);
  await emitSwaggerUi(docsDir);

  console.log(
    `emit-static: wrote API payload to ${cfg.apiOutDir} and site files to ${cfg.siteOutDir} (version ${cfg.version})`,
  );
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  await emitStatic();
}
