import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom doesn't implement scrollTo / scrollIntoView. The horizontal-pager
// uses them on the rail and target elements; without these stubs, tests
// throw `TypeError: rail.scrollTo is not a function`.
if (typeof Element !== 'undefined') {
  if (typeof Element.prototype.scrollTo !== 'function') {
    Element.prototype.scrollTo = () => {};
  }
  if (typeof Element.prototype.scrollIntoView !== 'function') {
    Element.prototype.scrollIntoView = () => {};
  }
}
if (typeof window !== 'undefined' && typeof window.scrollTo !== 'function') {
  window.scrollTo = (() => {}) as typeof window.scrollTo;
}

// jsdom doesn't ship IntersectionObserver. The horizontal-pager uses it to
// track the active page; in tests we just want it to not throw.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: readonly number[] = [];
  }
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    IntersectionObserverStub;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
