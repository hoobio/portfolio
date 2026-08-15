import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

export const config = {
  version: process.env['APP_VERSION'] ?? '0.1.0',
  commit: process.env['GIT_SHA'] ?? 'local',
  // Deterministic by default in CI (pass the release commit's timestamp);
  // falls back to "now" for local runs where cache-busting doesn't matter.
  generatedAt: process.env['BUILD_TIMESTAMP'] ?? new Date().toISOString(),
  dataDir: process.env['DATA_DIR'] ?? resolve(here, '../../../data'),
  // Both local files, written by earlier CI steps (syft SBOM scan, DT
  // findings pull) before the emitter runs. loadSbom() already prefers a
  // sidecar findings.json next to the SBOM path when no URL is given.
  sbomPath: process.env['SBOM_PATH'] ?? resolve(here, '../sbom/sbom.cdx.json'),
  apiOutDir: process.env['API_OUT_DIR'] ?? resolve(here, '../dist-api'),
  siteOutDir: process.env['SITE_OUT_DIR'] ?? resolve(here, '../dist-site'),
  publicBaseUrl: process.env['PUBLIC_BASE_URL'] ?? 'https://hoobi.dev',
  apiBaseUrl: process.env['API_BASE_URL'] ?? 'https://api.hoobi.dev/portfolio',
} as const;
