# Setup

One-time configuration for deploying this repo to Azure Container Apps via GitHub Actions.

## 1. Azure App Registration (OIDC federated credential)

Create an Entra ID app registration and a federated credential for the deploy environment:

- **Federated credential subject**: `repo:<owner>/<repo>:environment:azure`
- That subject pattern means the deploy job has to run with `environment: azure` (it does — see [.github/workflows/release.yml](./.github/workflows/release.yml)).
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

Group-scoped Contributor is enough: the Bicep template is `targetScope = 'resourceGroup'` and never touches subscription-scope resources.

## 4. First deploy

1. Push to `main`. The `Release` workflow runs release-please.
2. release-please opens a release PR. Merge it.
3. Merge triggers the build: container is built, pushed to GHCR, deployed via Bicep.
4. After the first deploy, grab the storage account name from the workflow summary if you want to upload SBOMs to a known location; subsequent runs will write to `https://<storage>.blob.core.windows.net/sbom/<version>/sbom.cdx.json`.

## 5. Local development

```pwsh
pnpm install --frozen-lockfile
pnpm run dev
```

- API on `http://localhost:8090`
- Web on `http://localhost:5173` (or next free port)

Vite proxies `/api/*`, `/docs`, `/llms.txt`, `/robots.txt`, `/sitemap.xml` to the API.

The SBOM panel reads `packages/api/public/sbom.cdx.json`. Generate it locally with [syft](https://github.com/anchore/syft) and the two scoped catalogger sets the CI uses:

```pwsh
syft scan dir:. --override-default-catalogers javascript-lock-cataloger -o cyclonedx-json=packages/api/public/sbom.cdx.json
# Restart the API (it loads the SBOM at boot)
```

## 6. Container build (local)

```pwsh
docker build -t hoobi-portfolio -f packages/api/Dockerfile .
docker run -p 8090:8090 hoobi-portfolio
```

## 7. Cost target

The deployed footprint is designed to sit well under A$1/month:

- **Container Apps Consumption**: scale-to-zero (`minReplicas: 0`). 180k vCPU-seconds + 360k GiB-seconds per month free per subscription.
- **Storage Account Standard_LRS Hot**: a few KB of SBOM blobs per release is effectively free.
- No Log Analytics, no ACR (using GHCR), no Front Door, no Application Gateway.

## 8. Custom domain

Once the Container App is deployed it has an FQDN like `<short>-app.<env-suffix>.<region>.azurecontainerapps.io`. To point a custom domain at it:

- Easy path: **Cloudflare proxied CNAME** (orange cloud) from your domain to the Container App FQDN. Cloudflare terminates TLS at the edge and reverse-proxies. No certificate work needed in Azure.
- Strict path: **bind the custom domain** to the Container App and bring or generate a TLS cert. See `az containerapp hostname add` / `bind`.
