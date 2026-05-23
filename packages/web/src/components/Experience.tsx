import type { Portfolio } from '@hoobi-portfolio/schemas';
import { Section } from './Section.js';

function formatRange(start: string, end: string): string {
  return end === 'present' ? `${start} -> present` : `${start} -> ${end}`;
}

function parseYearMonth(value: string): [number, number] {
  const [y, m] = value.split('-');
  return [Number(y), Number(m)];
}

function formatDuration(start: string, end: string): string {
  const [sy, sm] = parseYearMonth(start);
  let ey: number;
  let em: number;
  if (end === 'present') {
    const now = new Date();
    ey = now.getFullYear();
    em = now.getMonth() + 1;
  } else {
    [ey, em] = parseYearMonth(end);
  }
  const totalMonths = Math.max(0, (ey - sy) * 12 + (em - sm));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`);
  if (months > 0) parts.push(`${months} month${months === 1 ? '' : 's'}`);
  if (parts.length === 0) return 'less than a month';
  return parts.join(', ');
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
                <span className="flex flex-col items-end font-mono text-xs text-text-mute">
                  <span>{formatRange(role.start, role.end)}</span>
                  <span className="text-text-dim">{formatDuration(role.start, role.end)}</span>
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
