import { useRef, useState } from 'react';
import clsx from 'clsx';
import type { Portfolio } from '@hoobi-portfolio/schemas';
import { Section } from './Section.js';

type Principle = Portfolio['principles'][number];

export function Principles({ principles }: { principles: Portfolio['principles'] }) {
  return (
    <Section
      id="principles"
      title="principles"
      caption="The load-bearing ideas behind everything else on this site."
    >
      <ul className="grid gap-4 md:grid-cols-2">
        {principles.map((p) => (
          <PrincipleCard key={p.id} principle={p} />
        ))}
      </ul>
    </Section>
  );
}

function PrincipleCard({ principle }: { principle: Principle }) {
  const [open, setOpen] = useState(false);
  const downRef = useRef<{ x: number; y: number } | null>(null);
  const hasEvidence = principle.evidence.length > 0;

  const onPointerDown = (e: React.PointerEvent<HTMLLIElement>) => {
    downRef.current = { x: e.clientX, y: e.clientY };
  };

  const onClick = (e: React.MouseEvent<HTMLLIElement>) => {
    if (!hasEvidence) return;
    // Bail if the click actually moved (drag-to-scroll, text selection).
    const start = downRef.current;
    if (start && (Math.abs(e.clientX - start.x) > 5 || Math.abs(e.clientY - start.y) > 5)) return;
    // Bail if the user is selecting text inside this card.
    if (window.getSelection()?.toString()) return;
    setOpen((o) => !o);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    if (!hasEvidence) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((o) => !o);
    }
  };

  return (
    <li
      className={clsx(
        'group rounded-lg border border-bg-elev-2 bg-bg-elev p-5 transition-colors hover:border-accent-blue/40',
        hasEvidence && 'cursor-pointer',
      )}
      onPointerDown={onPointerDown}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={hasEvidence ? 'button' : undefined}
      tabIndex={hasEvidence ? 0 : undefined}
      aria-expanded={hasEvidence ? open : undefined}
    >
      <h3 className="text-lg text-accent-cyan">
        <span className="text-text-mute">## </span>
        {principle.title}
      </h3>
      {principle.subtitle ? (
        <p className="mt-1 text-sm text-text-dim font-mono">{principle.subtitle}</p>
      ) : null}
      <p className="mt-2 text-text">{principle.summary}</p>
      {hasEvidence ? (
        <div className="mt-3 font-mono text-sm">
          <div className="flex items-center gap-1 text-text-dim group-hover:text-accent-blue">
            <Chevron open={open} />
            evidence ({principle.evidence.length})
          </div>
          {open ? (
            <ul
              className="mt-2 ml-4 list-disc text-text-dim"
              // Don't collapse the card when clicking inside the evidence list.
              onClick={(e) => e.stopPropagation()}
            >
              {principle.evidence.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className={clsx('transition-transform', open && 'rotate-90')}
      aria-hidden
    >
      <path
        d="M3 2 L7 5 L3 8"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
