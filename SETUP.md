# Setup

One-time configuration for deploying this repo to Azure Static Web Apps + Blob Storage via GitHub Actions.

## 1. Azure App Registration (OIDC federated credential)

Create an Entra ID app registration and a federated credential for the deploy environment:

- **Federated credential subject**: `repo:<owner>/<repo>:environment:azure`
- That subject pattern means the deploy job has to run with `environment: azure` (it does — see [.github/workflows/ci.yml](./.github/workflows/ci.yml)).
- Audience: `api://AzureADTokenExchange`

## 2. GitHub: create the `azure` environment + secrets

In the repo's **Settings → Environments → New environment**, name it `azure`. Set these as **environment secrets** (the federated workflow consumes them via `secrets.*`):

| Secret | Source |
|---|---|
| `AZURE_TENANT_ID` | Entra tenant containing the app registration |
| `AZURE_CLIENT_ID` | Application (client) ID of the app registration |
| `AZURE_SUBSCRIPTION_ID` | Subscription where resources will be created |

Optional **environment variables** (non-sensitive, can stay as repo or env vars):

| Variable | Default | Purpose |
|---|---|---|
| `AZURE_RESOURCE_GROUP` | `portfolio` | Pre-existing resource group name |

Optional **secrets** for Dependency-Track integration (skipped silently if not set):

| Secret | Purpose |
|---|---|
| `DT_HOST` | Dependency-Track hostname, no scheme |
| `DT_API_KEY` | API key with `PROJECT_CREATION_UPLOAD` + `VULNERABILITY_ANALYSIS` permissions |

## 3. Azure RBAC for the app registration

Pre-create the resource group, then scope the app registration's permissions at the group level:

```pwsh
$client = "<your app registration client id>"
$sub    = "<your subscription id>"
$rg     = "portfolio"
$loc    = "australiasoutheast"

az group create --name $rg --location $loc

az role assignment create --assignee $client --role "Contributor" --scope "/subscriptions/$sub/resourceGroups/$rg"
az role assignment create --assignee $client --role "Storage Blob Data Contributor" --scope "/subscriptions/$sub/resourceGroups/$rg"
```

Group-scoped Contributor is enough: the Bicep template is `targetScope = 'resourceGroup'` and never touches subscription-scope resources. Contributor also covers `az staticwebapp secrets list`, which the deploy job uses to fetch a fresh Static Web Apps deployment token at run time rather than storing a standing one.

## 4. The API storage account

Unlike everything else, the storage account that fronts `api.hoobi.dev` is **not created by this repo's Bicep** - it's adopted. Create it once, by hand or via a separate one-off script, in the same resource group:

- Name: `hoobiportfolioapi` (must match `apiStorageAccountName` in [operations/variables/prod.bicepparam](./operations/variables/prod.bicepparam))
- `Standard_LRS`, `StorageV2`, Hot tier, `allowBlobPublicAccess: true`, HTTPS-only, TLS 1.2 minimum
- A registered custom domain `api.hoobi.dev` (see §6 below for the DNS side)

Bicep then manages its CORS rules, the public-read `portfolio` container, and re-asserts its `customDomain` on every deploy. **Before the first Bicep deploy against an existing account**, run `az storage account show -n hoobiportfolioapi -g portfolio` and `az deployment group what-if` and confirm the template's declared properties (SKU, kind, `useSubDomainName`) match exactly - a storage account PUT with a mismatched `customDomain` clears the binding.

## 5. First deploy

1. Push to `main`. The `Release` workflow runs release-please.
2. release-please opens a release PR. Merge it.
3. Merge triggers the build: the site and the API payload are built, the SBOM is generated and attested, and both are published (SPA to the Static Web App, API payload to `hoobiportfolioapi`).
4. Verify on the Static Web App's default hostname (`*.azurestaticapps.net`, in the deploy job summary) before binding `hoobi.dev` - see §6.

## 6. Local development

```pwsh
pnpm install --frozen-lockfile
pnpm run dev
```

- Site: `http://localhost:5173` (Vite), API + site-root meta files proxied from the generator's watched output
- Preview of a real production-shaped build: `pnpm run build && pnpm run preview` → `http://localhost:4173`

## 7. Cost target

The deployed footprint is designed to sit at effectively $0/month at portfolio traffic:

- **Static Web Apps Free tier**: 100GB/month bandwidth, no compute billed - there is nothing running at request time.
- **Storage Account Standard_LRS Hot**: a few hundred KB of JSON/YAML/SBOM blobs = a few cents.
- No Log Analytics, no compute of any kind, no container registry.

## 8. Custom domains

Two separate domains, two separate Azure resources, both fronted by Cloudflare for DNS.

### `hoobi.dev` → Static Web App

Recommended: **grey-cloud (DNS only)**. Static Web Apps already provides global distribution and a free auto-renewing managed certificate; proxying through Cloudflare on top adds a hop and a second cache layer that fights the cache headers in `staticwebapp.config.json`, without buying anything back for a public read-only site.

```pwsh
az staticwebapp hostname set -n hoobiportfolio-site -g portfolio --hostname hoobi.dev --validation-method dns-txt-token
az staticwebapp hostname show -n hoobiportfolio-site -g portfolio --hostname hoobi.dev --query validationToken -o tsv
```

1. Add the returned token as a Cloudflare `TXT _dnsauth.hoobi.dev` record (TXT records are never proxied).
2. Once validated, add the apex record as a Cloudflare-flattened `CNAME hoobi.dev → <site>.azurestaticapps.net`, **DNS only**.
3. Free tier allows 2 custom domains - add `www.hoobi.dev` the same way and let Static Web Apps redirect it.

If you do want `hoobi.dev` orange-clouded, validate and let the certificate issue while grey-clouded first (SWA can't complete a `hoobi.dev` cert handshake while Cloudflare intercepts with `Host: hoobi.dev`), then switch SSL mode to **Full (strict)**.

### `api.hoobi.dev` → Blob Storage

Azure Blob custom domains do **not** serve HTTPS, so this one **must** be orange-clouded - Cloudflare terminates TLS.

1. Cloudflare DNS: `CNAME api.hoobi.dev → hoobiportfolioapi.blob.core.windows.net`, **proxied**.
2. Cloudflare SSL/TLS mode: **Full (strict)**.
3. Cloudflare **Origin Rule** (free plan): Host Header Override → `hoobiportfolioapi.blob.core.windows.net`. Cloudflare uses the overridden Host for SNI, which is what lets Full (strict) succeed against the storage account's `*.blob.core.windows.net` certificate. Without this rule, `api.hoobi.dev` returns a 526.
4. Cloudflare **Cache Rule**: `hostname eq "api.hoobi.dev"` → Eligible for cache, Edge TTL: respect origin headers. Cloudflare's free plan does not cache `application/json` by default - without this rule every request reaches the storage account directly.

### Moving off hoobi.io

This is a domain move, not just a new host. Before decommissioning the old container:

- Cloudflare 301 redirect rules from `hoobi.io` to `hoobi.dev` (including the old `/api/*` paths, if any inbound links exist).
- Google Search Console change-of-address from hoobi.io to hoobi.dev.
- Keep the redirects live for 6–12 months.

Only once `hoobi.dev` and `api.hoobi.dev` are verified working end to end: delete the old Container App, its managed environment, the Cloudflare Origin CA certificate, and the old `hoobiportfoliosbom*` storage account. Removing resources from the Bicep template does not delete the live Azure resources - deployment runs in Incremental mode, never `--mode Complete`.
