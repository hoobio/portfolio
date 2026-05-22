import type { Portfolio, SbomSummary } from '@hoobi-portfolio/schemas';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

export const api = {
  portfolio: () => fetchJson<Portfolio>('/api/portfolio'),
  sbom: () => fetchJson<SbomSummary>('/api/sbom'),
};
