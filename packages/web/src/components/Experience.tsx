import type { Portfolio } from '@hoobi-portfolio/schemas';
import { Section } from './Section.js';

function formatRange(start: string, end: string): string {
  return end === 'present' ? `${start} -> present` : `${start} -> ${end}`;
}

export function Experience({ experience }: { experience: Portfolio['experience'] }) {
  return (
    <Section id="experience" title="experience" caption="Timeline, most recent first.">
      <ol className="relative ml-3 border-l border-bg-elev-2">
        {experience.map((role) => (
          <li key={role.id} className="relative pl-6 pb-8 last:pb-0">
            <span
              aria-hidden
              className="absolute -left-[7px] top-1.5 size-3 rounded-full border border-accent-blue bg-bg"
            />
            <div className="rounded-lg border border-bg-elev-2 bg-bg-elev p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg text-accent-blue">{role.title}</h3>
                <span className="font-mono text-xs text-text-mute">
                  {formatRange(role.start, role.end)}
                </span>
              </div>
              <div className="font-mono text-sm text-accent-cyan">
                {role.company}{' '}
                <span className="text-text-mute">· {role.location}</span>
              </div>
              <p className="mt-2 text-text">{role.summary}</p>
              {role.highlights.length > 0 ? (
                <ul className="mt-3 ml-4 list-disc space-y-1 text-text">
                  {role.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              ) : null}
              {role.tech.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-1 font-mono text-xs">
                  {role.tech.map((t) => (
                    <li
                      key={t}
                      className="rounded-sm bg-bg-elev-2 px-1.5 py-0.5 text-text-dim"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
