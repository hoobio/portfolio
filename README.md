# hoobi-portfolio

A living resume. The portfolio data lives in [`data/`](./data) as YAML files and is the source of truth: edit the YAML and the site updates.

- Backend: Fastify + zod + auto-generated OpenAPI / Swagger UI. Serves the SPA on `/` and the API on `/api/*`.
- Frontend: React + Vite. Fetches everything from the API; no hardcoded content.
- Schemas: a shared package validates the YAML on load and types the API responses.
- SBOM: CycloneDX generated at build time and surfaced both at `/api/sbom` and as a visualisation in the UI.
- Infra: Bicep deploys the container to Azure Container Apps (free consumption tier).
- CI/CD: GitHub Actions builds the image, runs tests, attests the SBOM, pushes to GHCR, and deploys via Bicep.

## Local development

```pwsh
pnpm install --frozen-lockfile
pnpm dev
```

Backend on `http://localhost:8090`, frontend on `http://localhost:5173` proxied to the API. Swagger UI at `http://localhost:8090/docs`.

## Editing the portfolio

All content lives under [`data/`](./data). Each file maps to one zod-validated schema; invalid YAML fails the server start (and CI).

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
pnpm sbom
node packages/api/dist/server.js
```

## Container

```pwsh
docker build -t hoobi-portfolio -f packages/api/Dockerfile .
docker run -p 8080:8080 hoobi-portfolio
```

## License

MIT. See [LICENSE](./LICENSE).
