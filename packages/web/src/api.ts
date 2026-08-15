import type { Portfolio, SbomSummary } from '@hoobi-portfolio/schemas';

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';
export const API_BASE = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE;

export function apiUrl(path: string): string {
  return `${API_BASE}/${path.replace(/^\//u, '')}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

export const api = {
  portfolio: () => fetchJson<Portfolio>(apiUrl('portfolio.json')),
  sbom: () => fetchJson<SbomSummary>(apiUrl('sbom.json')),
};
