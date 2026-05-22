import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const homeSections = [
  { id: 'principles', label: 'principles' },
  { id: 'skills', label: 'skills' },
  { id: 'experience', label: 'experience' },
  { id: 'projects', label: 'projects' },
  { id: 'azure', label: 'azure' },
  { id: 'themes', label: 'themes' },
];

export function Nav() {
  const location = useLocation();
  const onHome = location.pathname === '/';
  return (
    <header className="sticky top-0 z-20 border-b border-bg-elev-2 bg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3 font-mono text-sm">
        <Link to="/" className="text-accent-blue hover:no-underline">
          <span className="text-accent-red">~</span>/<span className="text-accent-cyan">alex</span>
        </Link>
        <nav className="hidden md:flex gap-4">
          {homeSections.map((s) => (
            <a
              key={s.id}
              href={onHome ? `#${s.id}` : `/#${s.id}`}
              className="text-text-dim hover:text-accent-blue"
            >
              {s.label}
            </a>
          ))}
          <Link
            to="/sbom"
            className={clsx(
              'hover:text-accent-blue',
              location.pathname === '/sbom' ? 'text-accent-blue' : 'text-text-dim',
            )}
          >
            sbom
          </Link>
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
