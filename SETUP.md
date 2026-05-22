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
| `AZURE_RESOURCE_GROUP` | `rg-hoobi-portfolio` | Resource group name |
| `AZURE_LOCATION` | `australiaeast` | Azure region |

Optional **secrets** for Dependency-Track integration (skipped silently if not set):

| Secret | Purpose |
|---|---|
| `DT_HOST` | Dependency-Track hostname, no scheme |
| `DT_API_KEY` | API key with `PROJECT_CREATION_UPLOAD` + `VULNERABILITY_ANALYSIS` permissions |

## 3. Azure RBAC for the app registration

The deploy job creates resources and uploads blobs. On the target subscription:

- **Contributor** on the subscription (or the resource group if you pre-create it)
- **Storage Blob Data Contributor** scoped at the resource group (covers future deploys' storage accounts)

```pwsh
$sub = "<your subscription id>"
$client = "<your app registration client id>"
$rg = "rg-hoobi-portfolio"

az role assignment create --assignee $client --role "Contributor" --scope "/subscriptions/$sub"
az role assignment create --assignee $client --role "Storage Blob Data Contributor" --scope "/subscriptions/$sub/resourceGroups/$rg"
```

## 4. First deploy

1. Push to `main`. The `Release` workflow runs release-please.
2. release-please opens a release PR. Merge it.
3. Merge triggers the build: container is built, pushed to GHCR, deployed via Bicep.
4. After the first deploy, grab the storage account name from the workflow summary if you want to upload SBOMs to a known location; subsequent runs will write to `https://<storage>.blob.core.windows.net/sbom/<version>/sbom.cdx.json`.

## 5. Local development

```pwsh
bun install --frozen-lockfile
bun run dev
```

- API on `http://localhost:8090`
- Web on `http://localhost:5173` (or next free port)

Vite proxies `/api/*`, `/docs`, `/llms.txt`, `/robots.txt`, `/sitemap.xml` to the API.

To render the SBOM panel locally:

```pwsh
bun run sbom
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
