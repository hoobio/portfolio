import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Nav } from '../src/components/Nav.js';

function withRouter(node: React.ReactNode, initialPath = '/') {
  return <MemoryRouter initialEntries={[initialPath]}>{node}</MemoryRouter>;
}
import { Section } from '../src/components/Section.js';
import { Hero } from '../src/components/Hero.js';
import { Principles } from '../src/components/Principles.js';
import { Skills } from '../src/components/Skills.js';
import { Experience } from '../src/components/Experience.js';
import { Projects } from '../src/components/Projects.js';
import { AzureResources } from '../src/components/AzureResources.js';
import { Themes } from '../src/components/Themes.js';
import { Footer } from '../src/components/Footer.js';
import { portfolioFixture } from './fixtures.js';

describe('Nav', () => {
  it('renders nav links to all sections', () => {
    render(withRouter(<Nav />));
    expect(screen.getByText('principles')).toBeInTheDocument();
    expect(screen.getByText('skills')).toBeInTheDocument();
    expect(screen.getByText('experience')).toBeInTheDocument();
    expect(screen.getByText('projects')).toBeInTheDocument();
    expect(screen.getByText('azure')).toBeInTheDocument();
    expect(screen.getByText('themes')).toBeInTheDocument();
    expect(screen.getByText('sbom')).toBeInTheDocument();
    expect(screen.getByText('/docs')).toBeInTheDocument();
  });
});

describe('Section', () => {
  it('renders a titled section with optional caption', () => {
    render(
      <Section id="x" title="title" caption="cap">
        <p>body</p>
      </Section>,
    );
    expect(screen.getByRole('heading', { name: /title/u })).toBeInTheDocument();
    expect(screen.getByText('cap')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('renders without caption', () => {
    render(
      <Section id="y" title="t">
        <p>body</p>
      </Section>,
    );
    expect(screen.getByRole('heading', { name: /t/u })).toBeInTheDocument();
  });
});

describe('Hero', () => {
  it('progressively reveals the prompt lines', async () => {
    vi.useFakeTimers();
    render(<Hero profile={portfolioFixture.profile} />);
    expect(screen.getByText('shell')).toBeInTheDocument();
    await vi.advanceTimersByTimeAsync(3000);
    vi.useRealTimers();
    await waitFor(() => {
      expect(screen.getByText(portfolioFixture.profile.name)).toBeInTheDocument();
    });
  });
});

describe('Principles', () => {
  it('renders all principles', () => {
    render(<Principles principles={portfolioFixture.principles} />);
    for (const principle of portfolioFixture.principles) {
      expect(screen.getByText(principle.title)).toBeInTheDocument();
    }
  });

  it('shows evidence count details when evidence exists', () => {
    render(<Principles principles={portfolioFixture.principles} />);
    expect(screen.getByText(/evidence \(2\)/u)).toBeInTheDocument();
  });
});

describe('Skills', () => {
  it('renders all skill groups and tags', () => {
    render(<Skills skills={portfolioFixture.skills} />);
    expect(screen.getByText('Platform Engineering')).toBeInTheDocument();
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
    expect(screen.getByText('Languages')).toBeInTheDocument();
    expect(screen.getAllByText('deep')[0]).toBeInTheDocument();
  });
});

describe('Experience', () => {
  it('renders both current and prior roles with formatted ranges', () => {
    render(<Experience experience={portfolioFixture.experience} />);
    expect(screen.getByText('Senior Platform Engineer')).toBeInTheDocument();
    expect(screen.getByText(/2024-01 -> present/u)).toBeInTheDocument();
    expect(screen.getByText(/2021-01 -> 2024-01/u)).toBeInTheDocument();
  });
});

describe('Projects', () => {
  it('renders projects and their links', () => {
    render(<Projects projects={portfolioFixture.projects} />);
    expect(screen.getByText('Command Palette Bitwarden')).toBeInTheDocument();
    expect(screen.getByText('repo')).toBeInTheDocument();
    expect(screen.getByText('open-source')).toBeInTheDocument();
  });
});

describe('AzureResources', () => {
  it('renders Azure principles with their services', () => {
    render(<AzureResources principles={portfolioFixture.azureResources} />);
    expect(screen.getByText('Compute')).toBeInTheDocument();
    expect(screen.getByText('AKS')).toBeInTheDocument();
    expect(screen.getByText('Container Apps')).toBeInTheDocument();
  });
});

describe('Themes', () => {
  it('renders themes with receipts', () => {
    render(<Themes themes={portfolioFixture.themes} />);
    expect(screen.getByText('Identity modernisation')).toBeInTheDocument();
    expect(screen.getByText('PAT migration')).toBeInTheDocument();
  });
});

describe('Footer', () => {
  it('renders the year and author', () => {
    render(<Footer profile={portfolioFixture.profile} generatedAt={portfolioFixture.generatedAt} />);
    expect(screen.getByText(/Alex Hill/u)).toBeInTheDocument();
    expect(screen.getByText('/api/portfolio')).toBeInTheDocument();
    expect(screen.getByText('/llms.txt')).toBeInTheDocument();
  });
});
