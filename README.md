# hoobi-portfolio

> Live: **[hoobi.dev](https://hoobi.dev)**

[![CI](https://img.shields.io/github/actions/workflow/status/hoobio/portfolio/ci.yml?branch=main&label=CI&logo=github-actions)](https://github.com/hoobio/portfolio/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/hoobio/portfolio?label=Release&logo=github&color=181717)](https://github.com/hoobio/portfolio/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![SBOM: CycloneDX](https://img.shields.io/badge/SBOM-CycloneDX-346DDB?logo=cyclonedx&logoColor=white)](https://api.hoobi.dev/portfolio/sbom.json)
[![Last Commit](https://img.shields.io/github/last-commit/hoobio/portfolio)](https://github.com/hoobio/portfolio/commits/main)

A living resume. The portfolio data lives in [`data/`](./data) as YAML files and is the source of truth: edit the YAML and the site updates.

- Backend: none at runtime. The portfolio API is pre-rendered JSON/YAML at build time and published to Azure Blob Storage.
- Frontend: React + Vite. Fetches everything from the API; no hardcoded content.
- Schemas: a shared package validates the YAML on load and types both the generator's output and the frontend.
- SBOM: CycloneDX generated at build time and surfaced both as `sbom.json` and as a visualisation in the UI.
- Infra: Bicep deploys an Azure Static Web App (free tier) for the SPA, and adopts the existing storage account that fronts the API.
- CI/CD: GitHub Actions builds the static site, runs tests, attests the SBOM, and deploys via Bicep.

## Local development

```pwsh
pnpm install --frozen-lockfile
pnpm dev
```

The generator watches `data/` and re-emits on change; Vite serves the SPA at `http://localhost:5173`, proxying `/api/*` and the site-root meta files to the generator's output. Swagger UI at `http://localhost:5173/docs`.

## Editing the portfolio

All content lives under [`data/`](./data). Each file maps to one zod-validated schema; invalid YAML fails the build (and CI).

| File | Contents |
|---|---|
| `profile.yaml` | name, headline, summary, contact, location |
| `principles.yaml` | the engineering principles I work to |
| `skills.yaml` | capability groups |
| `experience.yaml` | role history |
| `projects.yaml` | flagship + OSS projects |
| `azure-resources.yaml` | Azure services grouped by the principle they serve |
| `work-themes.yaml` | recurring engineering themes (with evidence) |

## Production build

```pwsh
pnpm install --frozen-lockfile
pnpm build
```

`pnpm build` runs the schemas typecheck, the generator (emits the static API payload + site-root meta files), then the Vite build. Output: `packages/web/dist/` (the deployable SPA, with the meta files merged in) and `packages/generator/dist-api/` (the API payload, published to blob storage in CI).

## Publish

CI publishes `packages/web/dist/` to an Azure Static Web App and `packages/generator/dist-api/` to the `portfolio` container on the storage account behind `api.hoobi.dev`. There is no container image and nothing runs at request time - see [SETUP.md](./SETUP.md) for the one-time infra setup.

## License

MIT. See [LICENSE](./LICENSE).
