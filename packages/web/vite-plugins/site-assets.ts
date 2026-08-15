import type { Connect, Plugin } from 'vite';
import { cpSync, existsSync, readFileSync, statSync } from 'node:fs';
import { basename, join, extname } from 'node:path';

const MIME: Record<string, string> = {
  '.json': 'application/json',
  '.yaml': 'application/yaml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
};

const API_CACHE_CONTROL = 'public, max-age=60, s-maxage=300, stale-while-revalidate=600';
const NO_CACHE_CONTROL = 'no-cache, no-store, must-revalidate';

function serveFrom(
  root: string,
  resolve: (urlPath: string) => string | null,
  headers: (filePath: string) => Record<string, string>,
): Connect.NextHandleFunction {
  return (req, res, next) => {
    const urlPath = req.url?.split('?')[0];
    const rel = urlPath ? resolve(urlPath) : null;
    // null means "not this handler's namespace" - fall through to Vite.
    // A recognised-but-missing file must end the request here with a real
    // 404: falling through via next() lets Vite's SPA fallback serve
    // index.html with a 200, masking a genuinely absent blob (e.g. no SBOM
    // generated in this build) as if it existed.
    if (rel === null) return next();
    const filePath = join(root, rel);
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Not found');
      return;
    }
    res.setHeader('Content-Type', MIME[extname(filePath)] ?? 'application/octet-stream');
    for (const [key, value] of Object.entries(headers(filePath))) res.setHeader(key, value);
    res.end(readFileSync(filePath));
  };
}

const SITE_ROOT_FILES = new Set(['/robots.txt', '/sitemap.xml', '/llms.txt', '/version.json']);

// Serves the emitter's output (packages/generator/dist-{api,site}) locally so
// `vite dev` / `vite preview` mirror production without a server: /api/* maps
// to blob storage (Cache-Control included, matching upload-static-api), and
// the site-root files + /docs map to what gets merged into the SPA bundle at
// build time. See closeBundle for the merge itself.
export function siteAssets(opts: { apiDir: string; siteDir: string }): Plugin {
  let outDir = 'dist';

  const apiHandler = serveFrom(
    opts.apiDir,
    (url) => (url.startsWith('/api/') ? url.slice('/api/'.length) : null),
    (filePath) => ({
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': basename(filePath) === 'version.json' ? NO_CACHE_CONTROL : API_CACHE_CONTROL,
    }),
  );
  const siteHandler = serveFrom(
    opts.siteDir,
    (url) => {
      if (SITE_ROOT_FILES.has(url)) return url.slice(1);
      if (url === '/docs') return 'docs/index.html';
      if (url.startsWith('/docs/')) return url.slice(1);
      return null;
    },
    (filePath) => ({ 'Cache-Control': basename(filePath) === 'version.json' ? NO_CACHE_CONTROL : 'public, max-age=3600' }),
  );

  return {
    name: 'hoobi-site-assets',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    configureServer(server) {
      server.middlewares.use(apiHandler);
      server.middlewares.use(siteHandler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiHandler);
      server.middlewares.use(siteHandler);
    },
    closeBundle() {
      if (existsSync(opts.siteDir)) {
        cpSync(opts.siteDir, outDir, { recursive: true });
      }
    },
  };
}
