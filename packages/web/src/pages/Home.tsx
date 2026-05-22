import type { Portfolio } from '@hoobi-portfolio/schemas';
import { Hero } from '../components/Hero.js';
import { Principles } from '../components/Principles.js';
import { Skills } from '../components/Skills.js';
import { Experience } from '../components/Experience.js';
import { Projects } from '../components/Projects.js';
import { AzureResources } from '../components/AzureResources.js';
import { Themes } from '../components/Themes.js';

export function HomePage({ portfolio }: { portfolio: Portfolio }) {
  return (
    <>
      <Hero profile={portfolio.profile} />
      <Principles principles={portfolio.principles} />
      <Skills skills={portfolio.skills} />
      <Experience experience={portfolio.experience} />
      <Projects projects={portfolio.projects} />
      <AzureResources principles={portfolio.azureResources} />
      <Themes themes={portfolio.themes} />
    </>
  );
}
