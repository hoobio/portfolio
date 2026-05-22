import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../src/App.js';
import { portfolioFixture, sbomFixture } from './fixtures.js';

function mockFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith('/api/portfolio')) {
      return { ok: true, status: 200, json: async () => portfolioFixture } as Response;
    }
    if (url.endsWith('/api/sbom')) {
      return { ok: true, status: 200, json: async () => sbomFixture } as Response;
    }
    return { ok: false, status: 404, json: async () => ({}) } as Response;
  });
}

describe('App', () => {
  it('shows a loading state and then the portfolio', async () => {
    vi.stubGlobal('fetch', mockFetch());
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/loading portfolio/u)).toBeInTheDocument();
    // The Nav renders the section list synchronously once the portfolio fetch
    // resolves; we use that as the "loaded" signal rather than waiting for the
    // Hero's character-by-character typing. Multiple "principles" matches (nav
    // link + section heading), so we use getAllByText.
    await waitFor(() => {
      expect(screen.getAllByText('principles').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('skills').length).toBeGreaterThan(0);
  });

  it('renders the error UI when the fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 503 })),
    );
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText(/Failed to load portfolio data/u)).toBeInTheDocument();
    });
  });
});
