import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Profile } from '@hoobi-portfolio/schemas';

interface HeroProps {
  profile: Profile;
}

interface Line {
  text: string;
  cls: string;
  /** When true, types out one character at a time. */
  typed?: boolean;
}

function makeLines(profile: Profile): Line[] {
  return [
    { text: '$ whoami', cls: 'text-accent-red', typed: true },
    { text: profile.name, cls: 'text-text' },
    { text: '', cls: '' },
    { text: '$ cat ./role', cls: 'text-accent-red', typed: true },
    { text: profile.role, cls: 'text-accent-blue' },
    { text: profile.location, cls: 'text-text-dim' },
    { text: '', cls: '' },
    { text: '$ cat ./headline', cls: 'text-accent-red', typed: true },
    { text: profile.headline, cls: 'text-accent-cyan' },
    { text: '', cls: '' },
    { text: '$ cat ./availability', cls: 'text-accent-red', typed: true },
    { text: profile.availability.description, cls: 'text-accent-yellow' },
  ];
}

const TYPE_INTERVAL_MS = 28;
const POST_LINE_PAUSE_MS = 80;

export function Hero({ profile }: HeroProps) {
  const lines = useMemo(() => makeLines(profile), [profile]);
  const [index, setIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const done = index >= lines.length;
  const currentLine = lines[index];
  const isTypingCurrent = !done && Boolean(currentLine?.typed) && typedChars < (currentLine?.text.length ?? 0);

  useEffect(() => {
    if (done) return;
    const line = lines[index];
    if (!line) return;

    if (line.typed) {
      if (typedChars < line.text.length) {
        const t = window.setTimeout(() => setTypedChars((c) => c + 1), TYPE_INTERVAL_MS);
        return () => window.clearTimeout(t);
      }
      const t = window.setTimeout(() => {
        setIndex((i) => i + 1);
        setTypedChars(0);
      }, POST_LINE_PAUSE_MS);
      return () => window.clearTimeout(t);
    }

    // Non-typed lines: reveal whole-line after a short beat.
    const t = window.setTimeout(() => setIndex((i) => i + 1), POST_LINE_PAUSE_MS);
    return () => window.clearTimeout(t);
  }, [index, typedChars, done, lines]);

  return (
    <section id="top" className="pt-8 md:pt-12">
      <div className="rounded-md border border-bg-elev-2 bg-bg-elev overflow-hidden">
        <WindowsTerminalChrome title="PowerShell" />
        <div className="p-6 md:p-8 font-mono text-sm md:text-base leading-relaxed min-h-[32.5rem]">
          <PromptHeader profile={profile} />
          {lines.slice(0, index).map((line, idx) => (
            <div key={idx} className={line.cls || 'text-text'}>
              {line.text === '' ? ' ' : line.text}
            </div>
          ))}
          {!done && currentLine?.typed ? (
            <div className={currentLine.cls}>
              {currentLine.text.slice(0, typedChars)}
              <span aria-hidden className="text-text blink">
                ▌
              </span>
            </div>
          ) : null}
          {done ? (
            <div className="mt-2 text-accent-red">
              ${' '}
              <span aria-hidden className="blink text-text">
                ▌
              </span>
            </div>
          ) : null}
          {!done && !isTypingCurrent && currentLine && !currentLine.typed ? (
            <span aria-hidden className="text-accent-blue blink">
              ▌
            </span>
          ) : null}
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
      <div className="flex items-stretch min-w-0 flex-1">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-elev border-b border-bg-elev-2 text-text text-xs font-mono min-w-0">
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
      <div className="flex items-stretch text-text-mute">
        <WindowButton ariaLabel="Minimise">
          <path d="M2 8 H12" stroke="currentColor" strokeWidth="1" fill="none" />
        </WindowButton>
        <WindowButton ariaLabel="Maximise">
          <rect x="2.5" y="2.5" width="9" height="9" stroke="currentColor" strokeWidth="1" fill="none" />
        </WindowButton>
        <WindowButton ariaLabel="Close" danger>
          <path
            d="M2 2 L12 12 M12 2 L2 12"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
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
        (danger
          ? 'hover:bg-accent-red hover:text-white'
          : 'hover:bg-bg-elev-2 hover:text-text')
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
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden
      className="shrink-0 text-accent-blue"
    >
      <rect x="0" y="0" width="14" height="14" rx="1.5" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M3 3 L7 7 L3 11"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 11 H11"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PromptHeader({ profile }: { profile: Profile }) {
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
