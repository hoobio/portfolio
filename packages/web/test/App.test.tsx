import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
    render(<App />);
    expect(screen.getByText(/loading portfolio/u)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(portfolioFixture.profile.name)).toBeInTheDocument();
    });
    expect(screen.getByText(/Senior Platform Engineer/u)).toBeInTheDocument();
  });

  it('renders the error UI when the fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 503 })),
    );
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to load portfolio data/u)).toBeInTheDocument();
    });
  });
});
