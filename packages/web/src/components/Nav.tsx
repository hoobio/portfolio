import { useEffect, useRef, useState, type MouseEvent } from 'react';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  // Reset the target page's internal vertical scroll, snap the window to
  // the top so the sticky nav doesn't cover the page's top padding, and
  // scroll the horizontal rail (the section's parent) to align the target.
  el.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  const rail = el.parentElement;
  if (rail) {
    rail.scrollTo({ left: el.offsetLeft, behavior: 'smooth' });
  }
  history.replaceState(null, '', `#${id}`);
  return true;
}

const homeSections = [
  { id: 'top', label: 'home' },
  { id: 'principles', label: 'principles' },
  { id: 'skills', label: 'skills' },
  { id: 'experience', label: 'experience' },
  { id: 'projects', label: 'projects' },
  { id: 'azure', label: 'azure' },
  { id: 'themes', label: 'themes' },
  { id: 'sbom', label: 'sbom' },
];

export function Nav() {
  const location = useLocation();
  const onHome = location.pathname === '/';
  const [activeId, setActiveId] = useState<string>('top');

  // HomePage emits the active section as a custom event so we don't have to
  // round-trip through the URL hash (which would race the home scroll fx).
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string }>).detail;
      if (detail?.id) setActiveId(detail.id);
    };
    document.addEventListener('home:active-section', handler);
    return () => document.removeEventListener('home:active-section', handler);
  }, []);

  return (
    <header className="site-nav sticky top-0 z-20 border-b border-bg-elev-2 bg-bg">
      <div className="site-nav-inner mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3 font-mono text-sm">
        <Link to="/" className="site-nav-brand text-text hover:text-accent-blue hover:no-underline shrink-0">
          ~/alex
        </Link>

        {/* Desktop links */}
        <nav className="site-nav-links hidden md:flex gap-4">
          {homeSections.map((s) => {
            const active = onHome && activeId === s.id;
            return (
              <a
                key={s.id}
                href={onHome ? `#${s.id}` : `/#${s.id}`}
                onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                  if (onHome && scrollToSection(s.id)) e.preventDefault();
                }}
                className={clsx(
                  'transition-colors',
                  active
                    ? 'text-accent-blue'
                    : 'text-text-dim hover:text-accent-blue',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {s.label}
              </a>
            );
          })}
        </nav>

        {/* Mobile section picker */}
        {onHome ? <MobileSectionPicker activeId={activeId} /> : null}

        <div className="flex gap-3 items-center font-mono text-xs shrink-0">
          <a
            href="https://github.com/hoobio/portfolio"
            className="text-text-dim hover:text-accent-blue"
            target="_blank"
            rel="noreferrer"
            aria-label="View source on GitHub"
          >
            source
          </a>
          <a
            href="/docs"
            className="text-accent-yellow hover:text-accent-orange"
            target="_blank"
            rel="noreferrer"
          >
            /docs
          </a>
        </div>
      </div>
    </header>
  );
}

function MobileSectionPicker({ activeId }: { activeId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const activeLabel = homeSections.find((s) => s.id === activeId)?.label ?? 'home';

  return (
    <div ref={ref} className="md:hidden relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-center gap-1 px-3 py-1 rounded border border-bg-elev-2 bg-bg-elev text-text-dim hover:text-accent-blue hover:border-accent-blue/40 truncate"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="text-text-mute">~/</span>
        <span className="text-text truncate">{activeLabel}</span>
        <Chevron open={open} />
      </button>
      {open ? (
        <ul
          role="menu"
          className="absolute left-0 right-0 mt-1 rounded border border-bg-elev-2 bg-bg-elev shadow-lg z-30 overflow-hidden"
        >
          {homeSections.map((s) => {
            const active = activeId === s.id;
            return (
              <li key={s.id} role="none">
                <a
                  role="menuitem"
                  href={`#${s.id}`}
                  onClick={(e) => {
                    if (scrollToSection(s.id)) e.preventDefault();
                    setOpen(false);
                  }}
                  className={clsx(
                    'block px-3 py-2 text-sm',
                    active
                      ? 'bg-bg-elev-2 text-accent-blue'
                      : 'text-text-dim hover:bg-bg-elev-2 hover:text-accent-blue',
                  )}
                >
                  <span className="text-text-mute">~/</span>
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className={clsx('transition-transform', open && 'rotate-180')}
      aria-hidden
    >
      <path
        d="M2 4 L5 7 L8 4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
