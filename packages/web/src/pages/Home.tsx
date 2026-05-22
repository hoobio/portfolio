import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import type { Portfolio } from '@hoobi-portfolio/schemas';
import { Hero } from '../components/Hero.js';
import { Principles } from '../components/Principles.js';
import { Skills } from '../components/Skills.js';
import { Experience } from '../components/Experience.js';
import { Projects } from '../components/Projects.js';
import { AzureResources } from '../components/AzureResources.js';
import { Themes } from '../components/Themes.js';
import { Sbom } from '../components/Sbom.js';

const PAGES = [
  'top',
  'principles',
  'skills',
  'experience',
  'projects',
  'azure',
  'themes',
  'sbom',
] as const;
type PageId = (typeof PAGES)[number];

export function HomePage({ portfolio }: { portfolio: Portfolio }) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  // Scroll to the section matching the hash on load and when the hash changes.
  // Same pattern as the Nav click handler: only touch the horizontal rail,
  // never let the browser scroll the window so the page's top padding stays
  // visible under the sticky nav.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const hash = (location.hash.replace(/^#/u, '') || 'top') as PageId;
    const idx = PAGES.indexOf(hash);
    if (idx < 0) return;
    const target = rail.children[idx] as HTMLElement | undefined;
    if (!target) return;
    target.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    rail.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
  }, [location.hash]);

  // Track which page is most visible (drives the opacity). We intentionally
  // do NOT write back to the URL hash here: doing that mid-scroll races
  // hash-driven scrollIntoView calls (the previous bug where Nav clicks
  // didn't seem to land).
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const sections = Array.from(rail.children) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        let bestIdx = activeIndex;
        let bestRatio = 0;
        for (const entry of entries) {
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIdx = sections.indexOf(entry.target as HTMLElement);
          }
        }
        if (bestIdx >= 0 && bestIdx !== activeIndex) setActiveIndex(bestIdx);
      },
      { root: rail, threshold: [0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [activeIndex]);

  const goTo = (idx: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const clamped = Math.max(0, Math.min(PAGES.length - 1, idx));
    const target = rail.children[clamped] as HTMLElement | undefined;
    if (!target) return;
    target.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    rail.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    history.replaceState(null, '', `#${PAGES[clamped]}`);
  };

  return (
    <div className="-mx-6 relative">
      <ArrowButton
        direction="left"
        disabled={activeIndex === 0}
        onClick={() => goTo(activeIndex - 1)}
      />
      <ArrowButton
        direction="right"
        disabled={activeIndex === PAGES.length - 1}
        onClick={() => goTo(activeIndex + 1)}
      />
      <div
        ref={railRef}
        className="relative flex overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:thin]"
      >
        <Page id="top" index={0} activeIndex={activeIndex}>
          <Hero profile={portfolio.profile} />
        </Page>
        <Page id="principles" index={1} activeIndex={activeIndex}>
          <Principles principles={portfolio.principles} />
        </Page>
        <Page id="skills" index={2} activeIndex={activeIndex}>
          <Skills skills={portfolio.skills} />
        </Page>
        <Page id="experience" index={3} activeIndex={activeIndex}>
          <Experience experience={portfolio.experience} />
        </Page>
        <Page id="projects" index={4} activeIndex={activeIndex}>
          <Projects projects={portfolio.projects} />
        </Page>
        <Page id="azure" index={5} activeIndex={activeIndex}>
          <AzureResources principles={portfolio.azureResources} />
        </Page>
        <Page id="themes" index={6} activeIndex={activeIndex}>
          <Themes themes={portfolio.themes} />
        </Page>
        <Page id="sbom" index={7} activeIndex={activeIndex}>
          <Sbom />
        </Page>
      </div>
      <PageDots activeIndex={activeIndex} />
    </div>
  );
}

interface PageProps {
  id: PageId;
  index: number;
  activeIndex: number;
  children: React.ReactNode;
}

function Page({ id, index, activeIndex, children }: PageProps) {
  const active = index === activeIndex;
  return (
    <section
      id={id}
      data-page={id}
      className={clsx(
        'snap-center shrink-0 w-full px-6 transition-opacity duration-300 overflow-y-auto',
        // nav (~3.25rem) + footer (~3rem) + safety buffer
        'min-h-[calc(100dvh-7rem)]',
        active ? 'opacity-100' : 'opacity-30 hover:opacity-60',
      )}
    >
      {children}
    </section>
  );
}

interface ArrowButtonProps {
  direction: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}

function ArrowButton({ direction, disabled, onClick }: ArrowButtonProps) {
  const isLeft = direction === 'left';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isLeft ? 'Previous page' : 'Next page'}
      className={clsx(
        'hidden md:flex fixed top-1/2 -translate-y-1/2 z-30 size-10 items-center justify-center rounded-full border border-bg-elev-2 bg-bg-elev text-text-dim transition-all',
        isLeft ? 'left-4' : 'right-4',
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : 'hover:text-accent-blue hover:border-accent-blue cursor-pointer',
      )}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        {isLeft ? (
          <path d="M11 4 L5 9 L11 14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M7 4 L13 9 L7 14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

function PageDots({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="sticky bottom-4 mt-4 flex justify-center gap-2 font-mono text-xs text-text-mute pointer-events-none">
      {PAGES.map((id, i) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => {
            const el = document.getElementById(id);
            if (el) {
              el.scrollTop = 0;
              window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
              const rail = el.parentElement;
              if (rail) rail.scrollTo({ left: el.offsetLeft, behavior: 'smooth' });
              history.replaceState(null, '', `#${id}`);
              e.preventDefault();
            }
          }}
          className={clsx(
            'pointer-events-auto rounded-full size-2 transition-colors',
            i === activeIndex ? 'bg-accent-blue' : 'bg-bg-elev-2 hover:bg-text-dim',
          )}
          aria-label={`Go to ${id}`}
        />
      ))}
    </div>
  );
}
