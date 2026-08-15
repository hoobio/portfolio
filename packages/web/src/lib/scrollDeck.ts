export function prefersReducedMotion(): boolean {
  // matchMedia is missing in jsdom.
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Scroll the horizontal home deck to the section with the given id.
 * Resets the target page's internal scroll and snaps the window to the top
 * so the sticky nav never covers the page's top padding.
 */
export function scrollDeckTo(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  const rail = el.parentElement;
  if (!rail) return false;
  el.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  // Smooth-scrolling a multi-page jump sweeps through every intermediate
  // section and leaves the nav indicator trailing; snap instantly instead.
  const distance = Math.abs(rail.scrollLeft - el.offsetLeft);
  const behavior: ScrollBehavior =
    prefersReducedMotion() || distance > rail.clientWidth * 1.5 ? 'auto' : 'smooth';
  rail.scrollTo({ left: el.offsetLeft, behavior });
  history.replaceState(null, '', `#${id}`);
  return true;
}
