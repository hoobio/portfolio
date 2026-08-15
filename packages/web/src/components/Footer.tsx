import type { Profile } from '@hoobi-portfolio/schemas';
import { apiUrl } from '../api.js';

interface FooterProps {
  profile: Profile;
  generatedAt: string;
}

export function Footer({ profile, generatedAt }: FooterProps) {
  return (
    <footer className="site-footer border-t border-bg-elev-2">
      <div className="site-footer-inner mx-auto max-w-5xl px-6 py-4 font-mono text-xs text-text-mute flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-accent-red">$</span>{' '}
          <span className="text-text-dim">echo</span>{' '}
          <span className="text-accent-cyan">"built from data, served as static files"</span>
        </div>
        <div>
          <a href="https://github.com/hoobio/portfolio" target="_blank" rel="noreferrer">
            source
          </a>
          {' · '}
          <a href={apiUrl('portfolio.json')} target="_blank" rel="noreferrer">portfolio.json</a>
          {' · '}
          <a href="/llms.txt" target="_blank" rel="noreferrer">/llms.txt</a>
          {' · '}
          <a href="/docs" target="_blank" rel="noreferrer">/docs</a>
        </div>
        <div>
          <span aria-hidden>©</span> {new Date(generatedAt).getFullYear()} {profile.name}
        </div>
      </div>
    </footer>
  );
}
