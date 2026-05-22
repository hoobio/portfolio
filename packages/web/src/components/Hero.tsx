import { useEffect, useState, type ReactNode } from 'react';
import type { Profile } from '@hoobi-portfolio/schemas';

interface HeroProps {
  profile: Profile;
}

const LINES = (profile: Profile): { text: string; cls?: string }[] => [
  { text: `$ whoami`, cls: 'text-accent-red' },
  { text: profile.name, cls: 'text-text' },
  { text: '' },
  { text: `$ cat ./role`, cls: 'text-accent-red' },
  { text: profile.role, cls: 'text-accent-blue' },
  { text: profile.location, cls: 'text-text-dim' },
  { text: '' },
  { text: `$ cat ./headline`, cls: 'text-accent-red' },
  { text: profile.headline, cls: 'text-accent-cyan' },
  { text: '' },
  { text: `$ cat ./availability`, cls: 'text-accent-red' },
  { text: profile.availability.description, cls: 'text-accent-yellow' },
];

export function Hero({ profile }: HeroProps) {
  const lines = LINES(profile);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= lines.length) return;
    const delay = lines[visible]?.text === '' ? 60 : 140;
    const t = window.setTimeout(() => setVisible((v) => v + 1), delay);
    return () => window.clearTimeout(t);
  }, [visible, lines]);

  return (
    <section id="top" className="pt-12 md:pt-20">
      <div className="rounded-md border border-bg-elev-2 bg-bg-elev overflow-hidden">
        <WindowsTerminalChrome title="PowerShell" />
        <div className="p-6 md:p-8 font-mono text-sm md:text-base leading-relaxed">
          <PromptHeader profile={profile} />
          {lines.slice(0, visible).map((line, idx) => (
            <div key={idx} className={line.cls ?? 'text-text'}>
              {line.text === '' ? ' ' : line.text}
            </div>
          ))}
          {visible < lines.length ? (
            <span aria-hidden className="text-accent-blue blink">
              ▌
            </span>
          ) : (
            <div className="mt-2 text-accent-red">
              $ <span className="blink text-text">▌</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3 font-mono text-sm">
        <ContactCard label="email" items={profile.contact.filter((c) => c.kind === 'email')} />
        <ContactCard
          label="links"
          items={profile.contact.filter((c) => c.kind === 'github' || c.kind === 'linkedin')}
        />
        <ContactCard
          label="cloud"
          items={[
            { kind: 'website', value: '', display: profile.cloudFocus.primary, primary: true },
            ...profile.cloudFocus.secondary.map((s) => ({
              kind: 'website' as const,
              value: '',
              display: `${s.name} (${s.level})`,
              primary: false,
            })),
          ]}
        />
      </div>
    </section>
  );
}

function WindowsTerminalChrome({ title }: { title: string }) {
  return (
    <div className="flex items-stretch select-none">
      {/* Tab strip */}
      <div className="flex items-stretch min-w-0 flex-1">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-elev border-b border-bg-elev-2/30 text-text text-xs font-mono min-w-0">
          <PowerShellIcon />
          <span className="truncate">{title}</span>
          <button
            type="button"
            aria-label="Close tab"
            className="ml-1 text-text-mute hover:text-text"
            tabIndex={-1}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path
                d="M1 1 L9 9 M9 1 L1 9"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-1 px-2 text-text-mute">
          <button type="button" aria-label="New tab" className="hover:text-text" tabIndex={-1}>
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path
                d="M6 1 V11 M1 6 H11"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button type="button" aria-label="Tab menu" className="hover:text-text" tabIndex={-1}>
            <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden>
              <path
                d="M2 4 L6 8 L10 4"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      {/* Window controls */}
      <div className="flex items-stretch text-text-mute">
        <WindowButton ariaLabel="Minimise">
          <path d="M2 8 H12" stroke="currentColor" strokeWidth="1" fill="none" />
        </WindowButton>
        <WindowButton ariaLabel="Maximise">
          <rect x="2.5" y="2.5" width="9" height="9" stroke="currentColor" strokeWidth="1" fill="none" />
        </WindowButton>
        <WindowButton ariaLabel="Close" danger>
          <path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
        </WindowButton>
      </div>
    </div>
  );
}

function WindowButton({
  ariaLabel,
  danger,
  children,
}: {
  ariaLabel: string;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      tabIndex={-1}
      className={
        'px-3 flex items-center justify-center transition-colors ' +
        (danger ? 'hover:bg-accent-red/70 hover:text-white' : 'hover:bg-bg-elev-2/60 hover:text-text')
      }
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
        {children}
      </svg>
    </button>
  );
}

function PowerShellIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="shrink-0 text-accent-blue">
      <rect x="0" y="0" width="14" height="14" rx="1.5" fill="currentColor" fillOpacity="0.12" />
      <path d="M3 3 L7 7 L3 11" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 11 H11" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function PromptHeader({ profile }: { profile: Profile }) {
  // Faux PowerShell preamble that appears before the typed-out lines.
  return (
    <div className="mb-3 text-text-dim text-xs md:text-sm">
      <div>
        <span className="text-text">PowerShell 7.6.1</span>
      </div>
      <div>
        <span className="text-accent-red">Hoobi</span>
        <span className="text-text-mute">@</span>
        <span className="text-text-dim">{profile.location.toUpperCase().split(',')[0]}</span>
      </div>
    </div>
  );
}

interface ContactItem {
  kind: string;
  value: string;
  display: string;
  primary: boolean;
}

function ContactCard({ label, items }: { label: string; items: ContactItem[] }) {
  return (
    <div className="rounded-md border border-bg-elev-2 bg-bg-elev p-4">
      <div className="text-text-mute"># {label}</div>
      <ul className="mt-1">
        {items.map((item, idx) => (
          <li key={idx} className="text-text">
            {item.value ? (
              <a href={item.value} target="_blank" rel="noreferrer">
                {item.display}
              </a>
            ) : (
              item.display
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
