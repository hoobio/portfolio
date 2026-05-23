import type { MouseEvent } from 'react';
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
  return (
    <header className="site-nav sticky top-0 z-20 border-b border-bg-elev-2 bg-bg">
      <div className="site-nav-inner mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3 font-mono text-sm">
        <Link to="/" className="site-nav-brand text-accent-blue hover:no-underline">
          <span className="text-accent-red">~</span>/<span className="text-accent-cyan">alex</span>
        </Link>
        <nav className="site-nav-links hidden md:flex gap-4">
          {homeSections.map((s) => (
            <a
              key={s.id}
              href={onHome ? `#${s.id}` : `/#${s.id}`}
              onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                if (onHome && scrollToSection(s.id)) e.preventDefault();
              }}
              className="text-text-dim hover:text-accent-blue"
            >
              {s.label}
            </a>
          ))}
        </nav>
        <div className="flex gap-3 items-center font-mono text-xs">
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
