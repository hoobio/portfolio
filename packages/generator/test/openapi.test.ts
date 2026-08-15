import { describe, expect, it } from 'vitest';
import { buildOpenApiDocument } from '../src/openapi.js';

const doc = buildOpenApiDocument({ version: '1.2.3', apiBaseUrl: 'https://api.example.test/x' });

function collectRefs(node: unknown, found: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const item of node) collectRefs(item, found);
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === '$ref' && typeof value === 'string') found.push(value);
      else collectRefs(value, found);
    }
  }
  return found;
}

function resolve(doc: unknown, pointer: string): unknown {
  return pointer
    .replace(/^#\//, '')
    .split('/')
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === 'object'
          ? (node as Record<string, unknown>)[part.replace(/~1/g, '/').replace(/~0/g, '~')]
          : undefined,
      doc,
    );
}

describe('openapi document', () => {
  it('emits refs at all (guards the walker against silently passing)', () => {
    expect(collectRefs(doc).length).toBeGreaterThan(0);
  });

  // Regression: zod returns shared sub-schemas on a `definitions` key of the
  // converted schema and points $refs at #/definitions/X, which resolves from
  // the document root. Embedding that object under paths.*.content.schema
  // without hoisting stranded every ref, and Swagger UI rendered
  // "Could not resolve pointer: /definitions/Profile does not exist".
  it('resolves every $ref against the document', () => {
    const unresolved = collectRefs(doc).filter((ref) => resolve(doc, ref) === undefined);
    expect(unresolved).toEqual([]);
  });

  it('points refs at components.schemas, never at definitions', () => {
    expect(collectRefs(doc).filter((ref) => ref.startsWith('#/definitions/'))).toEqual([]);
    expect(JSON.stringify(doc)).not.toContain('"definitions"');
  });

  it('registers the hoisted schemas under components', () => {
    const components = (doc as { components: { schemas: Record<string, unknown> } }).components;
    expect(Object.keys(components.schemas).length).toBeGreaterThan(0);
    expect(components.schemas).toHaveProperty('Profile');
  });
});
