import clsx from 'clsx';
import type { Portfolio } from '@hoobi-portfolio/schemas';
import { Section } from './Section.js';

const KIND_COLOUR: Record<string, string> = {
  'open-source': 'text-accent-green',
  personal: 'text-accent-yellow',
  work: 'text-accent-purple',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'active',
  shipped: 'shipped',
  'in-design': 'in-design',
  archived: 'archived',
};

export function Projects({ projects }: { projects: Portfolio['projects'] }) {
  return (
    <Section
      id="projects"
      title="projects"
      caption="Open-source maintainership, personal projects, and architectural work I'm allowed to talk about."
    >
      <ul className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <li
            key={p.id}
            className="rounded-lg border border-bg-elev-2 bg-bg-elev p-5 flex flex-col"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg text-accent-blue">{p.title}</h3>
              <span className={clsx('font-mono text-xs', KIND_COLOUR[p.kind])}>{p.kind}</span>
            </div>
            <div className="font-mono text-xs text-text-mute">
              {p.role} · {STATUS_LABEL[p.status]}
            </div>
            <p className="mt-2 text-text flex-1">{p.summary}</p>
            {p.highlights.length > 0 ? (
              <ul className="mt-3 ml-4 list-disc space-y-1 text-text text-sm">
                {p.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <ul className="flex flex-wrap gap-1 font-mono text-xs">
                {p.tech.slice(0, 6).map((t) => (
                  <li
                    key={t}
                    className="rounded-sm bg-bg-elev-2 px-1.5 py-0.5 text-text-dim"
                  >
                    {t}
                  </li>
                ))}
              </ul>
              {p.links.length > 0 ? (
                <ul className="flex gap-3 font-mono text-xs">
                  {p.links.map((l) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noreferrer">
                        {l.kind}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
