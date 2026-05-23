# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Cursor, GitHub Copilot Workspace, etc.) working in this repo. Humans should read [README.md](./README.md) and [SETUP.md](./SETUP.md) first.

## What this repo is

A data-driven personal portfolio site (a "living resume") hosted on Azure Container Apps and proxied through Cloudflare. The content lives in `data/` as YAML; everything else exists to load, validate, serve, render, ship, and harden that data.

## Architecture in one paragraph

YAML in `data/` → validated by zod schemas in `packages/schemas/` on server start → served as JSON by Fastify in `packages/api/` (which also auto-generates an OpenAPI spec + Swagger UI) → rendered by a React + Vite SPA in `packages/web/` that the same API hosts on `/`. CycloneDX SBOM is generated at build time by `bun run sbom`. CI/CD lives in `.github/workflows/` orchestrating composite actions in `operations/pipelines/`. Bicep in `operations/provision/` deploys a Container App + Storage Account at resource-group scope.

## Folder layout to mirror

```
data/                      # YAML, source of truth for portfolio content
packages/
  schemas/                 # shared zod schemas (validated at load time)
  api/                     # Fastify backend, OpenAPI, SPA serving
  web/                     # React + Vite SPA
operations/
  pipelines/<name>/action.yml    # reusable composite actions
  provision/main.bicep            # IaC entrypoint (rg-scoped)
  provision/modules/              # Bicep sub-modules
  variables/<env>.bicepparam      # per-env parameters
.github/workflows/         # thin orchestration over operations/pipelines/
tests/
  e2e/                     # Playwright UI smoke tests
  api/                     # Bruno API tests
```

Place new pipeline logic in `operations/pipelines/`. `.github/workflows/` should stay thin and reference those composites.

## Conventions

- **Package manager**: `bun` (1.3.x). Lockfile is `bun.lock`. Use `bun install --frozen-lockfile` in CI.
- **Runtime**: Bun for dev + production container (`oven/bun:1.3.14-alpine`).
- **TypeScript**: 6.x, strict, ESM, `exactOptionalPropertyTypes: true`.
- **Linter**: `oxlint` (fast Rust linter). `tsc --noEmit` for typecheck.
- **Tests**: vitest for unit + integration; Playwright for UI; Bruno for API.
- **Commit messages**: Conventional Commits format with a gitmoji glyph after the type prefix. One line, short. Examples:
  - `fix: 🐛 detect cert via 'env certificate list' (no 'show' subcommand)`
  - `feat: ✨ server fetches DT findings.json from FINDINGS_URL at startup`
  - `chore: 🔧 lower coverage thresholds to realistic gate values`
  - `docs: 📝 link site -> repo and repo -> site (footer + nav + readme)`

  Types follow the [Conventional Commits](https://www.conventionalcommits.org/) spec: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`. release-please reads these to decide version bumps - lone gitmoji prefixes (e.g. `🐛 fix typo`) don't parse and break the release flow.
- **Branch protection on `main`**: required checks are Lint, Typecheck, Test + coverage, Build, PDT (local). Do not weaken these without a reason captured in the PR description.
- **Prose**: no em-dashes anywhere (use space-hyphen-space or restructure). Commonwealth English. No AI slop ("delve", "navigate", binary contrasts, vague declaratives). Same rule applies to commit messages and inline code comments.
- **Comments in code**: only where the *why* is non-obvious. Don't narrate what the code already says.

## Hard rules

- **Never push directly to `main`**: open a PR, let CI pass, merge.
- **Never bake secrets into the repo**: tenant, subscription, client IDs go in GitHub Actions secrets on the `azure` environment, not in YAML or code.
- **Never expose internal hostnames, internal product names, or workplace-specific terms** in the YAML data. Genericise (e.g. "internal MCP service") if needed.
- **Never break the data contract**: schemas in `packages/schemas/src/index.ts` are the API contract. Changing them requires updating the YAML, the fixtures in `packages/{api,web}/test/fixtures.ts`, and the consumer components.
- **Never set `decorateReply: false` on `@fastify/static`**: the SPA fallback in the not-found handler relies on `reply.sendFile`.
- **Do not regress the security posture**: container runs as non-root, `allowInsecure: false` on the Container App ingress, Origin CA cert binding for Cloudflare.

## Common workflows

### Adding a new portfolio section

1. Add a new YAML file under `data/`.
2. Add a zod schema for it in `packages/schemas/src/index.ts` and export.
3. Add a loader call in `packages/api/src/data-loader.ts` and include it in the `Portfolio` aggregate.
4. Add a route in `packages/api/src/routes/portfolio.ts` if you want a dedicated endpoint.
5. Add a section component in `packages/web/src/components/` and include it in `pages/Home.tsx`.
6. Add a fixture entry to both fixtures files for tests.
7. Run `bun run typecheck` then `bun run test`.

### Adding an Azure resource to the Bicep

1. Edit `operations/provision/modules/workload.bicep` (or add a new module file).
2. Wire it via `operations/provision/main.bicep` if it needs new top-level params.
3. Update `operations/variables/prod.bicepparam`.
4. Verify locally with `az deployment group validate` against the `portfolio` RG.

### Adding a CI step

Drop a new composite action in `operations/pipelines/<step-name>/action.yml`. Reference it from `.github/workflows/ci.yml` or `release.yml` with `uses: ./operations/pipelines/<step-name>`.

## Local dev

```pwsh
bun install --frozen-lockfile
bun run dev               # API + Vite together
# or
bun run dev:api           # API only
bun run dev:web           # Vite only
```

- API: `http://localhost:8090`
- Web (proxied to API): `http://localhost:5173`
- Swagger UI: `http://localhost:8090/docs`

If a previous Vite session is stuck, Vite hops to the next free port (5174, 5175, etc.) - kill the orphans first so you load the right server. The site is a SPA, so HMR doesn't help if you're hitting the wrong port.

## Production realities

- Container Apps **scale-to-zero** is on. First request after idle wakes the container (3-8s cold start). Lean on Cloudflare cache headers (set in `build-app.ts`) so most hits never reach origin.
- Container Apps managed certs use Let's Encrypt HTTP-01, which fights with Cloudflare proxy. We use a **Cloudflare Origin CA cert** uploaded to the Container Apps environment and bound to the hostname.
- SBOM is generated at build time and lives in the image. The pipeline also uploads it to public-read Azure Blob (`https://<storage>.blob.core.windows.net/sbom/<version>/sbom.cdx.json`).
- Dependency-Track integration uploads the SBOM and pulls findings back into a `findings.json` sidecar so the UI can render vulnerability counts. Optional - skipped if `DT_HOST`/`DT_API_KEY` secrets aren't set.

## When in doubt

- Read the YAML in `data/` to understand the shape of the portfolio.
- Read `packages/schemas/src/index.ts` to understand the contract.
- Read `SETUP.md` for one-time configuration steps.
- The CI logs on a failing PR usually point at the specific assertion that broke.
