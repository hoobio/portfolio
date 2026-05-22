import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { SbomSummary } from '@hoobi-portfolio/schemas';
import type {
  SbomSummary as SbomSummaryType,
  ComponentVulnerability,
} from '@hoobi-portfolio/schemas';

interface CycloneDxLicense {
  license?: { id?: string; name?: string };
  expression?: string;
}

interface CycloneDxComponent {
  name?: string;
  version?: string;
  type?: string;
  purl?: string;
  licenses?: CycloneDxLicense[];
  'bom-ref'?: string;
}

interface CycloneDxRating {
  severity?: string;
  source?: { name?: string };
}

interface CycloneDxVulnerability {
  id?: string;
  source?: { name?: string; url?: string };
  ratings?: CycloneDxRating[];
  cwes?: number[];
  description?: string;
  affects?: Array<{ ref?: string }>;
  advisories?: Array<{ url?: string }>;
}

interface CycloneDxBom {
  bomFormat?: string;
  specVersion?: string;
  serialNumber?: string;
  metadata?: { timestamp?: string };
  components?: CycloneDxComponent[];
  vulnerabilities?: CycloneDxVulnerability[];
}

// Sidecar findings document produced by the deploy pipeline after uploading
// the SBOM to Dependency-Track. Structure deliberately matches a subset of
// DT's /api/v1/finding/project/{uuid} response.
interface Findings {
  source?: string;
  projectUrl?: string;
  lastScanned?: string;
  findings?: Array<{
    component?: { name?: string; version?: string; purl?: string };
    vulnerability?: {
      vulnId?: string;
      source?: string;
      severity?: string;
      title?: string;
      cweId?: string;
      url?: string;
    };
  }>;
}

function normaliseLicense(license: CycloneDxLicense): string | undefined {
  if (license.expression) return license.expression;
  if (license.license?.id) return license.license.id;
  if (license.license?.name) return license.license.name;
  return undefined;
}

function normaliseSeverity(value: string | undefined): ComponentVulnerability['severity'] {
  const lower = (value ?? '').toLowerCase();
  switch (lower) {
    case 'critical':
    case 'high':
    case 'medium':
    case 'low':
    case 'info':
      return lower;
    default:
      return 'unassigned';
  }
}

async function readJson<T>(path: string): Promise<T | undefined> {
  try {
    const raw = await readFile(path, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export async function loadSbom(path: string): Promise<SbomSummaryType | undefined> {
  const bom = await readJson<CycloneDxBom>(path);
  if (!bom) return undefined;

  const sidecarPath = join(dirname(path), 'findings.json');
  const findings = await readJson<Findings>(sidecarPath);

  // Index vulnerabilities by component (purl or name@version) for later merge.
  const vulnsByKey = new Map<string, ComponentVulnerability[]>();

  // 1) From CycloneDX vulnerabilities block (if the SBOM carries them inline).
  for (const v of bom.vulnerabilities ?? []) {
    const id = v.id ?? 'UNKNOWN';
    const severity = normaliseSeverity(v.ratings?.[0]?.severity);
    const url = v.advisories?.[0]?.url ?? v.source?.url;
    const entry: ComponentVulnerability = {
      id,
      severity,
      title: v.description,
      url,
    };
    for (const a of v.affects ?? []) {
      if (!a.ref) continue;
      const list = vulnsByKey.get(a.ref) ?? [];
      list.push(entry);
      vulnsByKey.set(a.ref, list);
    }
  }

  // 2) From the DT findings sidecar.
  for (const f of findings?.findings ?? []) {
    const c = f.component ?? {};
    const v = f.vulnerability ?? {};
    if (!c.purl && !(c.name && c.version)) continue;
    const key = c.purl ?? `${c.name}@${c.version}`;
    const entry: ComponentVulnerability = {
      id: v.vulnId ?? 'UNKNOWN',
      severity: normaliseSeverity(v.severity),
      title: v.title,
      cwe: v.cweId,
      url: v.url,
    };
    const list = vulnsByKey.get(key) ?? [];
    list.push(entry);
    vulnsByKey.set(key, list);
  }

  const components = (bom.components ?? []).map((component) => {
    const purl = component.purl;
    const fallback = `${component.name ?? 'unknown'}@${component.version ?? '0'}`;
    const vulns = vulnsByKey.get(purl ?? '') ?? vulnsByKey.get(fallback) ?? [];
    return {
      name: component.name ?? 'unknown',
      version: component.version,
      type: component.type,
      purl,
      licenses: (component.licenses ?? [])
        .map(normaliseLicense)
        .filter((v): v is string => Boolean(v)),
      vulnerabilities: vulns,
    };
  });

  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    unassigned: 0,
  };
  let total = 0;
  for (const c of components) {
    for (const v of c.vulnerabilities) {
      counts[v.severity] += 1;
      total += 1;
    }
  }

  const hasAnyVulnSource = Boolean(findings) || (bom.vulnerabilities?.length ?? 0) > 0;

  return SbomSummary.parse({
    serialNumber: bom.serialNumber,
    bomFormat: bom.bomFormat ?? 'CycloneDX',
    specVersion: bom.specVersion ?? 'unknown',
    generatedAt: bom.metadata?.timestamp,
    componentCount: components.length,
    components,
    vulnerabilities: {
      available: hasAnyVulnSource,
      source: findings?.source,
      projectUrl: findings?.projectUrl,
      lastScanned: findings?.lastScanned,
      counts,
      total,
    },
  });
}
