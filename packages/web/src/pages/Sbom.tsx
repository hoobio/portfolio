import { Sbom } from '../components/Sbom.js';

export function SbomPage() {
  return (
    <div className="pt-12 md:pt-20">
      <header className="mb-8 font-mono">
        <div className="text-text-mute text-sm">
          <span className="text-accent-red">$</span> kubectl describe portfolio --show-sbom
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl text-accent-blue">
          <span className="text-text-mute"># </span>
          software bill of materials
        </h1>
        <p className="mt-2 text-text-dim max-w-3xl">
          Every dependency that ships in this site, generated as a CycloneDX SBOM at
          build time and (when the pipeline has uploaded it) cross-referenced with
          Dependency-Track findings. The whole document is also available raw at{' '}
          <a href="/api/sbom/raw" target="_blank" rel="noreferrer" className="font-mono">
            /api/sbom/raw
          </a>
          .
        </p>
      </header>
      <Sbom embedded />
    </div>
  );
}
