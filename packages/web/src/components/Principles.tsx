import type { Portfolio } from '@hoobi-portfolio/schemas';
import { Section } from './Section.js';

export function Principles({ principles }: { principles: Portfolio['principles'] }) {
  return (
    <Section
      id="principles"
      title="principles"
      caption="The load-bearing ideas behind everything else on this site."
    >
      <ul className="grid gap-4 md:grid-cols-2">
        {principles.map((p) => (
          <li
            key={p.id}
            className="group rounded-lg border border-bg-elev-2 bg-bg-elev p-5 transition-colors hover:border-accent-blue/40"
          >
            <h3 className="text-lg text-accent-cyan">
              <span className="text-text-mute">## </span>
              {p.title}
            </h3>
            {p.subtitle ? (
              <p className="mt-1 text-sm text-text-dim font-mono">{p.subtitle}</p>
            ) : null}
            <p className="mt-2 text-text">{p.summary}</p>
            {p.evidence.length > 0 ? (
              <details className="mt-3 font-mono text-sm">
                <summary className="cursor-pointer text-text-dim hover:text-accent-blue">
                  evidence ({p.evidence.length})
                </summary>
                <ul className="mt-2 ml-4 list-disc text-text-dim">
                  {p.evidence.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </details>
            ) : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}
