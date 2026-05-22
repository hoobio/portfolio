import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  /** API slug if different from the section id (e.g. "azure" → "azure-resources"). */
  apiId?: string;
  title: string;
  caption?: string;
  children: ReactNode;
}

export function Section({ id, apiId, title, caption, children }: SectionProps) {
  const slug = apiId ?? id;
  const jsonUrl = `/api/portfolio/${slug}`;
  const yamlUrl = `/api/portfolio/${slug}.yaml`;
  return (
    <section id={id} className="pt-8 md:pt-12 scroll-mt-16">
      <header className="mb-6 font-mono">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-text-mute text-sm">
          <div>
            <span className="text-accent-red">$</span> cat ./{slug}.yaml
          </div>
          <div className="flex gap-2 text-xs">
            <a
              href={jsonUrl}
              target="_blank"
              rel="noreferrer"
              className="text-text-mute hover:text-accent-blue"
              aria-label={`View ${slug} JSON`}
            >
              json
            </a>
            <span className="text-text-mute">·</span>
            <a
              href={yamlUrl}
              target="_blank"
              rel="noreferrer"
              className="text-text-mute hover:text-accent-blue"
              aria-label={`View ${slug} YAML`}
            >
              yaml
            </a>
          </div>
        </div>
        <h2 className="mt-1 text-2xl md:text-3xl text-accent-blue">
          <span className="text-text-mute"># </span>
          {title}
        </h2>
        {caption ? <p className="mt-1 text-text-dim">{caption}</p> : null}
      </header>
      {children}
    </section>
  );
}
