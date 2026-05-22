import type { Portfolio } from '@hoobi-portfolio/schemas';

// schema.org Person JSON-LD. Crawlers and AI summarisers both index this
// format more cleanly than plain HTML, so emitting it at runtime from the
// portfolio data keeps it in lockstep with the YAML source of truth.
export function buildPersonJsonLd(portfolio: Portfolio): Record<string, unknown> {
  const { profile } = portfolio;
  const sameAs = profile.contact
    .filter((c) => c.kind !== 'email')
    .map((c) => c.value);
  const email = profile.contact.find((c) => c.kind === 'email')?.value;

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    alternateName: profile.preferredName,
    jobTitle: profile.role,
    description: profile.seo.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location,
    },
    email,
    sameAs,
    knowsAbout: profile.seo.keywords,
    worksFor: portfolio.experience
      .filter((role) => role.current)
      .map((role) => ({
        '@type': 'Organization',
        name: role.company,
      })),
    alumniOf: portfolio.experience
      .filter((role) => !role.current)
      .map((role) => ({
        '@type': 'Organization',
        name: role.company,
      })),
  };
}

export function injectJsonLd(data: Record<string, unknown>, id = 'jsonld-person'): void {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}
