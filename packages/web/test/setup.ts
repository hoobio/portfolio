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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
