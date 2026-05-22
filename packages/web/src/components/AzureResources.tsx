import type { Portfolio } from '@hoobi-portfolio/schemas';
import { Section } from './Section.js';

export function AzureResources({ principles }: { principles: Portfolio['azureResources'] }) {
  return (
    <Section
      id="azure"
      apiId="azure-resources"
      title="azure resources by principle"
      caption="Azure services grouped by the architectural intent they serve, not the product category."
    >
      <div className="space-y-6">
        {principles.map((p) => (
          <div key={p.id} className="rounded-lg border border-bg-elev-2 bg-bg-elev p-5">
            <h3 className="text-lg text-accent-cyan">
              <span className="text-text-mute">## </span>
              {p.title}
            </h3>
            <p className="mt-1 text-text-dim text-sm">{p.description}</p>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {p.services.map((s) => (
                <li
                  key={s.name}
                  className="rounded-md border border-bg-elev-2/60 bg-bg p-3"
                >
                  <div className="font-mono text-sm text-accent-yellow">{s.name}</div>
                  <div className="text-text text-sm">{s.usage}</div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
