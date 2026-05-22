import type { Portfolio } from '@hoobi-portfolio/schemas';
import { Section } from './Section.js';

export function Themes({ themes }: { themes: Portfolio['themes'] }) {
  return (
    <Section
      id="themes"
      title="recurring themes"
      caption="Higher-order patterns across the work. Each one comes with receipts."
    >
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-2 px-2 scroll-smooth">
        {themes.map((t) => (
          <article key={t.id} className="snap-start shrink-0 w-80 md:w-96 rounded-lg border border-bg-elev-2 bg-bg-elev p-5">
            <h3 className="text-lg text-accent-blue">{t.title}</h3>
            <p className="mt-2 text-text">{t.description}</p>
            <ul className="mt-3 ml-4 list-disc space-y-1 text-text-dim text-sm">
              {t.receipts.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  );
}
