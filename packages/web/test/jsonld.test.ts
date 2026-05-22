import { describe, expect, it, beforeEach } from 'vitest';
import { buildPersonJsonLd, injectJsonLd } from '../src/lib/jsonld.js';
import { portfolioFixture } from './fixtures.js';

describe('buildPersonJsonLd', () => {
  it('builds a schema.org Person record', () => {
    const ld = buildPersonJsonLd(portfolioFixture);
    expect(ld['@type']).toBe('Person');
    expect(ld.name).toBe('Alex Hill');
    expect(ld.jobTitle).toBe('Senior Platform Engineer');
    expect(ld.email).toBe('a@b.com');
    expect(Array.isArray(ld.sameAs)).toBe(true);
    expect((ld.sameAs as string[]).length).toBe(2);
  });

  it('lists current employers under worksFor and prior under alumniOf', () => {
    const ld = buildPersonJsonLd(portfolioFixture);
    expect((ld.worksFor as Array<{ name: string }>).map((w) => w.name)).toContain('Nintex');
    expect((ld.alumniOf as Array<{ name: string }>).length).toBeGreaterThanOrEqual(1);
  });
});

describe('injectJsonLd', () => {
  beforeEach(() => {
    document.head.replaceChildren();
  });

  it('inserts a JSON-LD script tag', () => {
    injectJsonLd({ foo: 'bar' });
    const tag = document.getElementById('jsonld-person');
    expect(tag).not.toBeNull();
    expect(tag?.getAttribute('type')).toBe('application/ld+json');
    expect(tag?.textContent).toBe('{"foo":"bar"}');
  });

  it('replaces existing JSON-LD content on second call', () => {
    injectJsonLd({ a: 1 });
    injectJsonLd({ b: 2 });
    const tag = document.getElementById('jsonld-person');
    expect(tag?.textContent).toBe('{"b":2}');
    expect(document.querySelectorAll('#jsonld-person').length).toBe(1);
  });
});
