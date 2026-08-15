// Workload module: Static Web App + the pre-existing API storage account.
// Deployed at resource-group scope by operations/provision/main.bicep.
//
// There is no compute here. The SPA is a Static Web App (Free tier); the
// portfolio API is pre-rendered JSON/YAML published to blob storage by CI.

param location string
param shortName string
param publicBaseUrl string
param tags object

@description('Name of the pre-existing storage account that fronts api.hoobi.dev. Fixed, not uniqueString - it already exists and its custom domain is already validated.')
param apiStorageAccountName string

@description('Public-read blob container that api.hoobi.dev serves from.')
param apiContainerName string = 'portfolio'

@description('Custom domain already bound to the storage account. Declared explicitly: omitting customDomain on an account that has one clears the binding.')
param apiCustomDomain string

@description('Region for the Static Web App. Static Web Apps is not available in Australian regions; this only affects the (unused) managed Functions runtime, not global CDN latency.')
param siteLocation string = 'eastasia'

// --- Pre-existing storage account, adopted rather than created ---
//
// CRITICAL: every property below must match the live account exactly (SKU,
// kind, accessTier, TLS settings) or this PUT either fails outright or
// silently resets something not listed here to its RP default. Run
// `az storage account show -n <name> -g <rg>` and `az deployment group
// what-if` before the first deploy against this resource - see SETUP.md.
resource apiStorage 'Microsoft.Storage/storageAccounts@2024-01-01' = {
  name: apiStorageAccountName
  location: location
  tags: tags
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: true
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowSharedKeyAccess: true
    publicNetworkAccess: 'Enabled'
    customDomain: { name: apiCustomDomain, useSubDomainName: false }
  }
}

resource apiBlobService 'Microsoft.Storage/storageAccounts/blobServices@2024-01-01' = {
  parent: apiStorage
  name: 'default'
  properties: {
    cors: {
      corsRules: [
        {
          // Wildcard is deliberate, not lax: the container is already
          // anonymously public-read, so an origin allow-list would grant no
          // extra privilege. It also sidesteps Cloudflare caching an
          // origin-specific Access-Control-Allow-Origin against the wrong
          // client (Blob Storage doesn't reliably vary on Origin).
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'HEAD', 'OPTIONS']
          allowedHeaders: ['*']
          exposedHeaders: ['*']
          maxAgeInSeconds: 3600
        }
      ]
    }
  }
}

resource apiContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2024-01-01' = {
  parent: apiBlobService
  name: apiContainerName
  properties: {
    publicAccess: 'Blob'
  }
}

// --- Static Web App (Free tier) ---

resource site 'Microsoft.Web/staticSites@2024-04-01' = {
  name: '${shortName}-site'
  location: siteLocation
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    // 'Custom' stops Azure trying to own a workflow file in the repo or poll
    // a GitHub connection - CI pushes content with a deployment token
    // instead. Custom domains are bound out-of-band (see SETUP.md): binding
    // them here would block the deployment on DNS validation completing.
    provider: 'Custom'
    stagingEnvironmentPolicy: 'Disabled'
    allowConfigFileUpdates: true
    enterpriseGradeCdnStatus: 'Disabled'
  }
}

output staticSiteName string = site.name
output staticSiteDefaultHostname string = site.properties.defaultHostname
output apiStorageAccountName string = apiStorage.name
output apiBaseUrl string = 'https://${apiCustomDomain}/${apiContainerName}'
output publicBaseUrl string = publicBaseUrl
