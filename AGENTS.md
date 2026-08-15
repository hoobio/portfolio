# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Cursor, GitHub Copilot Workspace, etc.) working in this repo. Humans should read [README.md](./README.md) and [SETUP.md](./SETUP.md) first.

## What this repo is

A data-driven personal portfolio site (a "living resume") hosted on Azure Static Web Apps, with its API pre-rendered to static JSON/YAML at build time and served from Azure Blob Storage. The content lives in `data/` as YAML; everything else exists to load, validate, pre-render, ship, and harden that data. There is no server at runtime - compute only happens in CI.

## Architecture in one paragraph

YAML in `data/` → validated by zod schemas in `packages/schemas/` → pre-rendered to static JSON/YAML at build time by `packages/generator/` (which also emits `robots.txt`, `sitemap.xml`, `llms.txt`, and a static OpenAPI spec + Swagger UI) → the React + Vite SPA in `packages/web/` fetches that JSON at runtime from a separate origin (`api.hoobi.dev`). CycloneDX SBOM is generated in CI by the pipeline-tools `build-cyclonedx-sbom` step (syft over `pnpm-lock.yaml` and `.github/workflows/`) and baked into `sbom.json` by the generator. CI/CD lives in `.github/workflows/` orchestrating composite actions in `operations/pipelines/`. Bicep in `operations/provision/` deploys a Static Web App and adopts the pre-existing API storage account, both at resource-group scope.

## Folder layout to mirror

```
data/                      # YAML, source of truth for portfolio content
packages/
  schemas/                 # shared zod schemas (validated at load time)
  generator/                # build-time static API emitter (was `api/`)
  web/                     # React + Vite SPA
    vite-plugins/           # site-assets: serves the emitted files in dev/preview
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

- **Package manager**: `pnpm` (11.x). Lockfile is `pnpm-lock.yaml`. Use `pnpm install --frozen-lockfile` in CI. `pnpm-workspace.yaml` sets `minimumReleaseAge: 1440` (24h) - `pnpm add`/`pnpm update` won't resolve a version published more recently than that.
- **Runtime**: Node 24. `tsx` runs the generator, both in dev (`tsx watch`) and in the CI build (`tsx src/emit-static.ts`) - there's nothing to bundle for a runtime it never ships to.
- **TypeScript**: 6.x, strict, ESM, `exactOptionalPropertyTypes: true`.
- **Linter**: `oxlint` (fast Rust linter). `tsc --noEmit` for typecheck.
- **Tests**: vitest for unit + integration; Playwright for UI; Bruno for API.
- **Commit messages**: Conventional Commits format with a gitmoji glyph after the type prefix. One line, short. Examples:
  - `fix: 🐛 detect cert via 'env certificate list' (no 'show' subcommand)`
  - `feat: ✨ pre-render the portfolio API to static JSON at build time`
  - `chore: 🔧 lower coverage thresholds to realistic gate values`
  - `docs: 📝 link site -> repo and repo -> site (footer + nav + readme)`

  Types follow the [Conventional Commits](https://www.conventionalcommits.org/) spec: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`. release-please reads these to decide version bumps - lone gitmoji prefixes (e.g. `🐛 fix typo`) don't parse and break the release flow.
- **Branch protection on `main`**: required checks are Lint, Typecheck, Unit Tests and Coverage, Build, UI Tests, API Tests. Do not weaken these, or the job `name:` values in `ci.yml` that they match against, without a reason captured in the PR description.
- **Prose**: no em-dashes anywhere (use space-hyphen-space or restructure). Commonwealth English. No AI slop ("delve", "navigate", binary contrasts, vague declaratives). Same rule applies to commit messages and inline code comments.
- **Comments in code**: only where the *why* is non-obvious. Don't narrate what the code already says.

## Hard rules

- **Never push directly to `main`**: open a PR, let CI pass, merge.
- **Never bake secrets into the repo**: tenant, subscription, client IDs go in GitHub Actions secrets on the `azure` environment, not in YAML or code.
- **Never expose internal hostnames, internal product names, or workplace-specific terms** in the YAML data. Genericise (e.g. "internal MCP service") if needed.
- **Never break the data contract**: schemas in `packages/schemas/src/index.ts` are the API contract. Changing them requires updating the YAML, the fixtures in `packages/{generator,web}/test/fixtures.ts` (where present), and the consumer components.
- **Never add a second data producer**: `packages/generator/src/emit-static.ts` is the only thing that writes the static API. Components read it through `apiUrl()` in `packages/web/src/api.ts` - never hardcode an `/api/...` path in a component.
- **Do not regress the security posture**: the blob container is read-only public with no write access from the client, storage is HTTPS-only, `staticwebapp.config.json` carries the security headers (HSTS, CSP, `X-Frame-Options`, etc.) that used to come from Cloudflare/Fastify defaults, and there is no standing deployment secret - the Static Web Apps token is fetched fresh from Azure at deploy time via OIDC.

## Common workflows

### Adding a new portfolio section

1. Add a new YAML file under `data/`.
2. Add a zod schema for it in `packages/schemas/src/index.ts` and export.
3. Add a loader call in `packages/generator/src/data-loader.ts` and include it in the `Portfolio` aggregate.
4. Add the slug to `YAML_FILE_MAP`/`SECTION_ACCESSORS` in `packages/generator/src/sections.ts` if you want it emitted as its own `portfolio/<slug>.json` + `.yaml` blob, and to `SECTION_SCHEMAS` in `packages/generator/src/openapi.ts` for the OpenAPI doc.
5. Add a section component in `packages/web/src/components/` and include it in `pages/Home.tsx`.
6. Add a fixture entry to the fixtures files touched by your tests.
7. Run `pnpm run typecheck` then `pnpm run test`, then `pnpm run build` and inspect `packages/generator/dist-api/` to confirm the new files land where expected.

### Adding an Azure resource to the Bicep

1. Edit `operations/provision/modules/workload.bicep` (or add a new module file).
2. Wire it via `operations/provision/main.bicep` if it needs new top-level params.
3. Update `operations/variables/prod.bicepparam`.
4. Verify locally with `az deployment group what-if` against the `portfolio` RG - this is mandatory when touching the `apiStorage` resource, since a mismatched property can silently reset something on the live account (see SETUP.md §4).

### Adding a CI step

Drop a new composite action in `operations/pipelines/<step-name>/action.yml`. Reference it from `.github/workflows/ci.yml` with `uses: ./operations/pipelines/<step-name>`.

## Local dev

```pwsh
pnpm install --frozen-lockfile
pnpm run dev               # generator (watch) + Vite together
# or
pnpm run dev:generator     # generator only, re-emits on data/ or sbom/ changes
pnpm run dev:web           # Vite only
```

- Site: `http://localhost:5173`
- Swagger UI: `http://localhost:5173/docs`

The `site-assets` Vite plugin (`packages/web/vite-plugins/site-assets.ts`) serves the generator's output locally: `/api/*` mirrors what blob storage will serve in production (including matching `Cache-Control` headers), and the site-root meta files (`robots.txt`, `sitemap.xml`, `llms.txt`, `/docs`) are merged into the dev server the same way they're merged into the build output. There's no proxy target to a separate process anymore.

If a previous Vite session is stuck, Vite hops to the next free port (5174, 5175, etc.) - kill the orphans first so you load the right server. The site is a SPA, so HMR doesn't help if you're hitting the wrong port.

To exercise the exact production-shaped artifact locally: `pnpm run build && pnpm run preview` serves the real build via `vite preview` on `http://localhost:4173`. This is what `pnpm run test:e2e` / `test:api` run against.

## Production realities

- Nothing runs at request time. Static Web Apps and Blob Storage both serve pre-built files - there is no cold start to hide, and no probe to keep something warm.
- The API lives on a different origin (`api.hoobi.dev`) from the site (`hoobi.dev`), so every browser fetch is cross-origin. The storage account's blob service CORS rule (wildcard, GET/HEAD/OPTIONS - see `workload.bicep`) is what makes that work; don't narrow it without checking it against every origin the SPA is actually served from (production domain, the SWA default hostname, and localhost during PDT).
- Cloudflare fronts `api.hoobi.dev` only (Blob Storage doesn't serve HTTPS on a custom domain natively) - the site itself can be DNS-only in front of Static Web Apps' own managed certificate. See SETUP.md §8 for the Host-header-override rule this depends on.
- `generatedAt` / `version.json`'s timestamp is deterministic in CI (`BUILD_TIMESTAMP` = the release commit's authored date), so re-running a deploy for the same commit produces byte-identical output and doesn't bust every blob's cache for no reason.
- SBOM + Dependency-Track findings are baked into `sbom.json` at build time, not fetched at runtime - there's no live server to do a runtime merge from a `findings.json` sidecar.

## When in doubt

- Read the YAML in `data/` to understand the shape of the portfolio.
- Read `packages/schemas/src/index.ts` to understand the contract.
- Read `SETUP.md` for one-time configuration steps.
- The CI logs on a failing PR usually point at the specific assertion that broke.
