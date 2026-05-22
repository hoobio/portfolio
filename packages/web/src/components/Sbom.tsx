import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import * as d3 from 'd3';
import type { SbomSummary } from '@hoobi-portfolio/schemas';
import { Section } from './Section.js';
import { api } from '../api.js';

interface EcosystemBucket {
  name: string;
  count: number;
  components: SbomSummary['components'];
}

export function ecosystemFromPurl(purl: string | undefined): string {
  if (!purl) return 'unknown';
  const match = /^pkg:([^/]+)\//u.exec(purl);
  return match?.[1] ?? 'unknown';
}

export function bucketByEcosystem(sbom: SbomSummary): EcosystemBucket[] {
  const map = new Map<string, EcosystemBucket>();
  for (const c of sbom.components) {
    const eco = ecosystemFromPurl(c.purl);
    const existing = map.get(eco) ?? { name: eco, count: 0, components: [] };
    existing.count += 1;
    existing.components.push(c);
    map.set(eco, existing);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

const ECO_COLOUR = d3
  .scaleOrdinal<string, string>()
  .range([
    '#73D0FF',
    '#95E6CB',
    '#FFD580',
    '#FFA759',
    '#F28779',
    '#D4BFFF',
    '#BAE67E',
    '#707A8C',
  ]);

const SEVERITY_COLOUR: Record<string, string> = {
  critical: 'text-accent-red border-accent-red/60 bg-accent-red/10',
  high: 'text-accent-orange border-accent-orange/60 bg-accent-orange/10',
  medium: 'text-accent-yellow border-accent-yellow/60 bg-accent-yellow/10',
  low: 'text-accent-cyan border-accent-cyan/60 bg-accent-cyan/10',
  info: 'text-text-dim border-bg-elev-2 bg-bg-elev',
  unassigned: 'text-text-mute border-bg-elev-2 bg-bg-elev',
};

export function Sbom({ embedded = false }: { embedded?: boolean } = {}) {
  const [sbom, setSbom] = useState<SbomSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    api
      .sbom()
      .then(setSbom)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  const buckets = useMemo(() => (sbom ? bucketByEcosystem(sbom) : []), [sbom]);

  const filteredComponents = useMemo(() => {
    if (!sbom) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return sbom.components;
    return sbom.components.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.version?.toLowerCase().includes(q) ?? false) ||
        (c.purl?.toLowerCase().includes(q) ?? false),
    );
  }, [sbom, filter]);

  useEffect(() => {
    if (!sbom || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 640;
    const height = 280;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    svg.selectAll('*').remove();

    type PackDatum = { children?: EcosystemBucket[] };
    const hierarchy = d3
      .hierarchy<PackDatum>({ children: buckets })
      .sum((d) => (d as unknown as EcosystemBucket).count ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const pack = d3.pack<PackDatum>().size([width - 20, height - 20]).padding(8);
    const root = pack(hierarchy);
    const g = svg.append('g').attr('transform', 'translate(10,10)');
    const leaves = root.leaves();
    const node = g
      .selectAll<SVGGElement, d3.HierarchyCircularNode<PackDatum>>('g')
      .data(leaves)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    node
      .append('circle')
      .attr('r', (d) => d.r)
      .attr('fill', (d) => ECO_COLOUR((d.data as unknown as EcosystemBucket).name))
      .attr('fill-opacity', 0.18)
      .attr('stroke', (d) => ECO_COLOUR((d.data as unknown as EcosystemBucket).name))
      .attr('stroke-width', 1.2);

    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('fill', (d) => ECO_COLOUR((d.data as unknown as EcosystemBucket).name))
      .style('font-family', 'DankMono, ui-monospace, monospace')
      .style('font-size', (d) => `${Math.max(10, d.r / 4)}px`)
      .text((d) => (d.data as unknown as EcosystemBucket).name);

    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.1em')
      .attr('fill', '#CBCCC6')
      .style('font-family', 'DankMono, ui-monospace, monospace')
      .style('font-size', (d) => `${Math.max(9, d.r / 5)}px`)
      .text((d) => `${(d.data as unknown as EcosystemBucket).count}`);
  }, [sbom, buckets]);

  const body =
    error ? (
      <p className="text-accent-red font-mono">No SBOM available: {error}</p>
    ) : !sbom ? (
      <p className="text-text-dim font-mono">
        <span className="prompt">loading sbom</span>
        <span className="blink">_</span>
      </p>
    ) : null;

  const rendered = sbom ? (
    <div className="space-y-4">
          <SbomHeader sbom={sbom} />
          <VulnerabilityCard sbom={sbom} />
          {buckets.length > 1 ? (
            <div className="rounded-lg border border-bg-elev-2 bg-bg-elev p-5">
              <svg
                ref={svgRef}
                className="w-full"
                role="img"
                aria-label="SBOM ecosystem bubble chart"
              />
              <div className="mt-3 grid gap-2 md:grid-cols-3 font-mono text-xs">
                {buckets.map((b) => (
                  <div key={b.name} className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-block size-2 rounded-full"
                      style={{ background: ECO_COLOUR(b.name) }}
                    />
                    <span className="text-text">{b.name}</span>
                    <span className="text-text-dim ml-auto">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <ComponentTable
            components={filteredComponents}
            total={sbom.componentCount}
            filter={filter}
            onFilterChange={setFilter}
          />
        </div>
  ) : null;

  if (embedded) {
    return <div id="sbom" className="scroll-mt-16">{body ?? rendered}</div>;
  }

  return (
    <Section
      id="sbom"
      title="sbom"
      caption="Full CycloneDX bill of materials for this site, plus vulnerability findings from Dependency-Track when the pipeline has uploaded them."
    >
      {body ?? rendered}
    </Section>
  );
}

function SbomHeader({ sbom }: { sbom: SbomSummary }) {
  return (
    <div className="rounded-lg border border-bg-elev-2 bg-bg-elev p-4 font-mono text-sm flex flex-wrap items-baseline justify-between gap-3">
      <div>
        <span className="text-text-mute"># </span>
        <span className="text-accent-blue">{sbom.bomFormat}</span>
        <span className="text-text-mute"> · spec </span>
        <span className="text-accent-cyan">{sbom.specVersion}</span>
        {sbom.generatedAt ? (
          <>
            <span className="text-text-mute"> · generated </span>
            <span className="text-text-dim">{sbom.generatedAt.split('T')[0]}</span>
          </>
        ) : null}
      </div>
      <div className="text-text-dim text-xs">
        <a href="/api/sbom/raw" target="_blank" rel="noreferrer" className="mr-3">
          raw .cdx.json
        </a>
        <a href="/api/sbom" target="_blank" rel="noreferrer">
          parsed JSON
        </a>
      </div>
    </div>
  );
}

function VulnerabilityCard({ sbom }: { sbom: SbomSummary }) {
  const { vulnerabilities } = sbom;
  if (!vulnerabilities.available) {
    return (
      <div className="rounded-lg border border-bg-elev-2 bg-bg-elev p-5 font-mono text-sm">
        <h3 className="text-accent-yellow">
          <span className="text-text-mute">## </span>vulnerabilities
        </h3>
        <p className="mt-2 text-text-dim">
          No vulnerability scan available yet. The deploy pipeline uploads this SBOM to
          Dependency-Track and writes a findings sidecar that the next build serves from
          <code className="mx-1 text-accent-cyan">/api/sbom</code>.
        </p>
      </div>
    );
  }

  const cells: Array<{ key: keyof typeof vulnerabilities.counts; label: string }> = [
    { key: 'critical', label: 'critical' },
    { key: 'high', label: 'high' },
    { key: 'medium', label: 'medium' },
    { key: 'low', label: 'low' },
    { key: 'info', label: 'info' },
    { key: 'unassigned', label: 'unassigned' },
  ];

  return (
    <div className="rounded-lg border border-bg-elev-2 bg-bg-elev p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-mono text-sm text-accent-yellow">
          <span className="text-text-mute">## </span>vulnerabilities
        </h3>
        <div className="font-mono text-xs text-text-dim">
          {vulnerabilities.total === 0 ? (
            <span className="text-accent-green">no findings</span>
          ) : (
            <span>
              {vulnerabilities.total} finding{vulnerabilities.total === 1 ? '' : 's'}
            </span>
          )}
          {vulnerabilities.lastScanned ? (
            <span className="text-text-mute"> · {vulnerabilities.lastScanned.split('T')[0]}</span>
          ) : null}
          {vulnerabilities.projectUrl ? (
            <>
              <span className="text-text-mute"> · </span>
              <a href={vulnerabilities.projectUrl} target="_blank" rel="noreferrer">
                open in {vulnerabilities.source ?? 'tracker'}
              </a>
            </>
          ) : null}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-6 font-mono text-xs">
        {cells.map((cell) => {
          const count = vulnerabilities.counts[cell.key];
          return (
            <div
              key={cell.key}
              className={clsx(
                'rounded-md border px-3 py-2 flex items-baseline justify-between',
                SEVERITY_COLOUR[cell.key],
              )}
            >
              <span className="uppercase tracking-wide text-[10px]">{cell.label}</span>
              <span className="text-lg font-bold tabular-nums">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ComponentTableProps {
  components: SbomSummary['components'];
  total: number;
  filter: string;
  onFilterChange: (value: string) => void;
}

function ComponentTable({ components, total, filter, onFilterChange }: ComponentTableProps) {
  return (
    <div className="rounded-lg border border-bg-elev-2 bg-bg-elev">
      <div className="flex flex-wrap items-baseline justify-between gap-2 p-4 border-b border-bg-elev-2/60">
        <h3 className="font-mono text-sm text-accent-yellow">
          <span className="text-text-mute">## </span>components
          <span className="text-text-mute"> ({components.length}/{total})</span>
        </h3>
        <label className="font-mono text-xs text-text-dim flex items-center gap-2">
          <span className="text-text-mute">filter:</span>
          <input
            type="search"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            placeholder="name, version, purl..."
            className="bg-bg-elev-2 border border-bg-elev-2 rounded px-2 py-1 text-text outline-none focus:border-accent-blue/60 w-44"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-xs">
          <thead className="text-text-mute uppercase">
            <tr>
              <th className="text-left px-4 py-2">name</th>
              <th className="text-left px-4 py-2">version</th>
              <th className="text-left px-4 py-2">type</th>
              <th className="text-left px-4 py-2">licence</th>
              <th className="text-left px-4 py-2">vulns</th>
            </tr>
          </thead>
          <tbody>
            {components.map((c) => {
              const eco = ecosystemFromPurl(c.purl);
              const worstSeverity = worstVulnSeverity(c.vulnerabilities);
              return (
                <tr key={`${c.name}@${c.version ?? 'unknown'}`} className="border-t border-bg-elev-2/40">
                  <td className="px-4 py-1.5">
                    <span className="text-text">{c.name}</span>
                    {c.purl ? (
                      <span className="ml-2 text-text-mute">
                        <span
                          aria-hidden
                          className="inline-block size-1.5 mr-1 rounded-full align-middle"
                          style={{ background: ECO_COLOUR(eco) }}
                        />
                        {eco}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-1.5 text-text-dim">{c.version ?? '-'}</td>
                  <td className="px-4 py-1.5 text-text-dim">{c.type ?? '-'}</td>
                  <td className="px-4 py-1.5 text-text-dim">
                    {c.licenses.length ? c.licenses.join(', ') : '-'}
                  </td>
                  <td className="px-4 py-1.5">
                    {worstSeverity ? (
                      <span
                        className={clsx(
                          'inline-block rounded-sm border px-1.5 py-0.5 text-[10px] uppercase',
                          SEVERITY_COLOUR[worstSeverity],
                        )}
                      >
                        {worstSeverity} ({c.vulnerabilities.length})
                      </span>
                    ) : (
                      <span className="text-accent-green">clean</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {components.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-text-dim">
                  No components match the filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const SEVERITY_ORDER: Array<SbomSummary['components'][number]['vulnerabilities'][number]['severity']> = [
  'critical',
  'high',
  'medium',
  'low',
  'info',
  'unassigned',
];

function worstVulnSeverity(
  vulns: SbomSummary['components'][number]['vulnerabilities'],
): SbomSummary['components'][number]['vulnerabilities'][number]['severity'] | undefined {
  if (!vulns.length) return undefined;
  for (const s of SEVERITY_ORDER) {
    if (vulns.some((v) => v.severity === s)) return s;
  }
  return undefined;
}
