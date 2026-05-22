import { useEffect, useState } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import type { Portfolio } from '@hoobi-portfolio/schemas';
import { api } from './api.js';
import { buildPersonJsonLd, injectJsonLd } from './lib/jsonld.js';
import { Nav } from './components/Nav.js';
import { Footer } from './components/Footer.js';
import { HomePage } from './pages/Home.js';
import { SbomPage } from './pages/Sbom.js';

export function App() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    api
      .portfolio()
      .then((data) => {
        setPortfolio(data);
        injectJsonLd(buildPersonJsonLd(data));
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      });
  }, []);

  useEffect(() => {
    if (!portfolio) return;
    const pageSuffix = location.pathname === '/sbom' ? ' - SBOM' : '';
    document.title = `${portfolio.profile.name} - ${portfolio.profile.role}${pageSuffix}`;
  }, [portfolio, location.pathname]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 font-mono text-accent-red">
        <p className="hash">Failed to load portfolio data.</p>
        <pre className="mt-2 text-text-dim">{error}</pre>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 font-mono text-text-dim">
        <span className="prompt">loading portfolio</span>
        <span className="blink">_</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 mx-auto max-w-6xl w-full px-6 pb-24">
        <Routes>
          <Route path="/" element={<HomePage portfolio={portfolio} />} />
          <Route path="/sbom" element={<SbomPage />} />
          <Route path="*" element={<HomePage portfolio={portfolio} />} />
        </Routes>
        <Outlet />
      </main>
      <Footer profile={portfolio.profile} generatedAt={portfolio.generatedAt} />
    </div>
  );
}
