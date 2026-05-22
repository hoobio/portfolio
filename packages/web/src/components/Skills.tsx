import clsx from 'clsx';
import type { Portfolio } from '@hoobi-portfolio/schemas';
import { Section } from './Section.js';

const LEVEL_COLOUR: Record<string, string> = {
  deep: 'text-accent-blue border-accent-blue/40',
  working: 'text-accent-cyan border-accent-cyan/40',
  familiar: 'text-text-dim border-bg-elev-2',
};

export function Skills({ skills }: { skills: Portfolio['skills'] }) {
  return (
    <Section
      id="skills"
      title="skills"
      caption="Capability groups, by depth. Deep is years-in-anger; working is shipped with; familiar is enough to be useful."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {skills.map((g) => (
          <div key={g.id} className="rounded-lg border border-bg-elev-2 bg-bg-elev p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-base text-accent-yellow">
                <span className="text-text-mute">- </span>
                {g.title}
              </h3>
              <span
                className={clsx(
                  'rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-mono',
                  LEVEL_COLOUR[g.level] ?? '',
                )}
              >
                {g.level}
              </span>
            </div>
            <ul className="mt-2 flex flex-wrap gap-1 font-mono text-xs">
              {g.skills.map((s) => (
                <li
                  key={s}
                  className="rounded-sm bg-bg-elev-2 px-1.5 py-0.5 text-text-dim"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
