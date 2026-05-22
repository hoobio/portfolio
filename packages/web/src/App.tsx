import { useEffect, useState } from 'react';
import type { Portfolio } from '@hoobi-portfolio/schemas';
import { api } from './api.js';
import { buildPersonJsonLd, injectJsonLd } from './lib/jsonld.js';
import { Hero } from './components/Hero.js';
import { Principles } from './components/Principles.js';
import { Skills } from './components/Skills.js';
import { Experience } from './components/Experience.js';
import { Projects } from './components/Projects.js';
import { AzureResources } from './components/AzureResources.js';
import { Themes } from './components/Themes.js';
import { Sbom } from './components/Sbom.js';
import { Footer } from './components/Footer.js';
import { Nav } from './components/Nav.js';

export function App() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .portfolio()
      .then((data) => {
        setPortfolio(data);
        injectJsonLd(buildPersonJsonLd(data));
        document.title = `${data.profile.name} - ${data.profile.role}`;
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      });
  }, []);

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
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-5xl px-6 pb-24">
        <Hero profile={portfolio.profile} />
        <Principles principles={portfolio.principles} />
        <Skills skills={portfolio.skills} />
        <Experience experience={portfolio.experience} />
        <Projects projects={portfolio.projects} />
        <AzureResources principles={portfolio.azureResources} />
        <Themes themes={portfolio.themes} />
        <Sbom />
      </main>
      <Footer profile={portfolio.profile} generatedAt={portfolio.generatedAt} />
    </div>
  );
}
