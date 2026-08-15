import { z } from 'zod';
import {
  Profile,
  Principle,
  SkillGroup,
  Experience,
  Project,
  AzurePrinciple,
  Theme,
  Portfolio,
  SbomSummary,
  SiteVersion,
} from '@hoobi-portfolio/schemas';
import { SECTION_SLUGS } from './sections.js';

// Route metadata used to no longer come from live Fastify route
// registration (@fastify/swagger derived it automatically). It's hand-kept
// here now; the *shapes* still come from zod, so the data contract itself
// stays single-sourced.
const SECTION_SCHEMAS: Record<string, z.ZodTypeAny> = {
  profile: Profile,
  principles: z.array(Principle),
  skills: z.array(SkillGroup),
  experience: z.array(Experience),
  projects: z.array(Project),
  'azure-resources': z.array(AzurePrinciple),
  themes: z.array(Theme),
};

// zod emits `$ref: "#/definitions/X"`, which resolves from the *document*
// root. OpenAPI 3.0 keeps shared schemas under `components.schemas`, so the
// pointers have to be repointed there or every ref dangles. `#/definitions/`
// only ever appears inside a $ref string, so rewriting the serialised form
// is both safe and depth-independent.
function repointRefs<T>(node: T): T {
  return JSON.parse(
    JSON.stringify(node).replaceAll('"#/definitions/', '"#/components/schemas/'),
  ) as T;
}

function fileResponse(description: string, contentType: string) {
  return {
    description,
    content: { [contentType]: { schema: { type: 'string' } } },
  };
}

export function buildOpenApiDocument(opts: { version: string; apiBaseUrl: string }) {
  // Shared sub-schemas hoisted out of each zod conversion. zod returns them
  // on a `definitions` key of the schema it converts; left in place they'd
  // sit uselessly under paths.*.content.schema.definitions, unreachable from
  // the refs that point at them.
  const schemas: Record<string, unknown> = {};

  function jsonSchema(schema: z.ZodTypeAny) {
    const { definitions, ...rest } = z.toJSONSchema(schema, { target: 'openapi-3.0' }) as Record<
      string,
      unknown
    > & { definitions?: Record<string, unknown> };
    for (const [name, definition] of Object.entries(definitions ?? {})) {
      schemas[name] = repointRefs(definition);
    }
    return repointRefs(rest);
  }

  function jsonResponse(description: string, schema: z.ZodTypeAny) {
    return {
      description,
      content: { 'application/json': { schema: jsonSchema(schema) } },
    };
  }

  const paths: Record<string, unknown> = {
    '/portfolio.json': {
      get: {
        summary: 'Full portfolio payload',
        description:
          'The entire portfolio content - profile, principles, skills, experience, projects, Azure resource principles, and recurring engineering themes. Pre-rendered at build time from the YAML files under `data/`.',
        tags: ['portfolio'],
        responses: { 200: jsonResponse('Full portfolio payload', Portfolio) },
      },
    },
    '/sbom.json': {
      get: {
        summary: 'CycloneDX SBOM summary',
        description:
          'Parsed view of the CycloneDX SBOM generated at build time. The raw CycloneDX document is available at `/sbom.cdx.json`.',
        tags: ['sbom'],
        responses: {
          200: jsonResponse('SBOM summary', SbomSummary),
          404: { description: 'No SBOM was generated for this build' },
        },
      },
    },
    '/sbom.cdx.json': {
      get: {
        summary: 'Raw CycloneDX SBOM document',
        description: 'The CycloneDX document as emitted by the source SBOM scan.',
        tags: ['sbom'],
        responses: {
          200: fileResponse('Raw CycloneDX document', 'application/vnd.cyclonedx+json'),
          404: { description: 'No SBOM was generated for this build' },
        },
      },
    },
    '/version.json': {
      get: {
        summary: 'Build freshness signal',
        description: 'Status, version and build timestamp. Intended for external uptime monitoring.',
        tags: ['system'],
        responses: { 200: jsonResponse('Build version', SiteVersion) },
      },
    },
  };

  for (const slug of SECTION_SLUGS) {
    const schema = SECTION_SCHEMAS[slug];
    if (schema) {
      paths[`/portfolio/${slug}.json`] = {
        get: {
          summary: `${slug} section`,
          tags: ['portfolio'],
          responses: { 200: jsonResponse(`${slug} section`, schema) },
        },
      };
    }
    paths[`/portfolio/${slug}.yaml`] = {
      get: {
        summary: `Raw YAML source for ${slug}`,
        description: 'The YAML file in data/ that backs this section, verbatim.',
        tags: ['portfolio'],
        responses: { 200: fileResponse('Raw YAML source', 'application/yaml') },
      },
    };
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'Hoobi Portfolio API',
      description:
        'Living-resume API. Every response is a static file, pre-rendered at build time from YAML in the repository and published to Azure Blob Storage - there is no server behind this API.',
      version: opts.version,
      license: { name: 'MIT' },
    },
    servers: [{ url: opts.apiBaseUrl, description: 'Static portfolio API (Azure Blob Storage)' }],
    tags: [
      { name: 'portfolio', description: 'Portfolio content' },
      { name: 'sbom', description: 'Software Bill of Materials' },
      { name: 'system', description: 'System endpoints' },
    ],
    paths,
    components: { schemas },
  };
}
