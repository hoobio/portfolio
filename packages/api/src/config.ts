import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

export const config = {
  host: process.env['HOST'] ?? '0.0.0.0',
  port: Number(process.env['PORT'] ?? 8090),
  logLevel: process.env['LOG_LEVEL'] ?? 'info',
  version: process.env['APP_VERSION'] ?? '0.1.0',
  // Repo root is two levels up from packages/api/src in source, or
  // packages/api/dist in build, so resolve via env override when needed.
  dataDir: process.env['DATA_DIR'] ?? resolve(here, '../../../data'),
  publicDir: process.env['PUBLIC_DIR'] ?? resolve(here, '../public'),
  webDistDir: process.env['WEB_DIST_DIR'] ?? resolve(here, '../public/web'),
  sbomPath: process.env['SBOM_PATH'] ?? resolve(here, '../public/sbom.cdx.json'),
  findingsUrl: process.env['FINDINGS_URL'] ?? '',
} as const;
