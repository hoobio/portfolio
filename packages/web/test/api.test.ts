import { describe, expect, it, vi, beforeEach } from 'vitest';
import { api } from '../src/api.js';
import { portfolioFixture, sbomFixture } from './fixtures.js';

describe('api client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and returns the portfolio', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => portfolioFixture,
    });
    vi.stubGlobal('fetch', fetchMock);
    const result = await api.portfolio();
    expect(result.profile.name).toBe(portfolioFixture.profile.name);
    expect(fetchMock).toHaveBeenCalledWith('/api/portfolio', expect.any(Object));
  });

  it('throws when portfolio response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.portfolio()).rejects.toThrow(/500/u);
  });

  it('fetches the SBOM', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => sbomFixture,
    });
    vi.stubGlobal('fetch', fetchMock);
    const result = await api.sbom();
    expect(result.componentCount).toBe(3);
  });
});
