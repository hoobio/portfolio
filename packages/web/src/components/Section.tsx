import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  title: string;
  caption?: string;
  children: ReactNode;
}

export function Section({ id, title, caption, children }: SectionProps) {
  return (
    <section id={id} className="pt-20 scroll-mt-16">
      <header className="mb-6 font-mono">
        <div className="text-text-mute text-sm">
          <span className="text-accent-red">$</span> cat ./{id}.yaml
        </div>
        <h2 className="mt-1 text-2xl md:text-3xl text-accent-blue">
          <span className="text-text-mute"># </span>
          {title}
        </h2>
        {caption ? <p className="mt-1 text-text-dim">{caption}</p> : null}
      </header>
      {children}
    </section>
  );
}
