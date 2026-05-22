const sections = [
  { id: 'principles', label: 'principles' },
  { id: 'skills', label: 'skills' },
  { id: 'experience', label: 'experience' },
  { id: 'projects', label: 'projects' },
  { id: 'azure', label: 'azure' },
  { id: 'themes', label: 'themes' },
  { id: 'sbom', label: 'sbom' },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-bg-elev-2 bg-bg">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3 font-mono text-sm">
        <a href="#top" className="text-accent-blue hover:no-underline">
          <span className="text-accent-red">~</span>/<span className="text-accent-cyan">alex</span>
        </a>
        <nav className="hidden gap-4 md:flex">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="text-text-dim hover:text-accent-blue">
              {s.label}
            </a>
          ))}
        </nav>
        <a href="/docs" className="text-accent-yellow hover:text-accent-orange" target="_blank" rel="noreferrer">
          /docs
        </a>
      </div>
    </header>
  );
}
