// Resource-group-scoped deployment. The resource group is pre-created and
// the deploying identity (the GitHub Actions OIDC app registration) only
// has Contributor scoped at the group level - we never create or modify the
// RG from this template.
//
// Cost target: effectively $0/month at portfolio traffic.
// - Static Web App Free tier: 100GB/month bandwidth, no compute billed.
// - Storage Account Standard_LRS Hot: KB-to-low-MB of JSON/YAML blobs = ~$0.
// - No compute of any kind at runtime. Everything is built and published by CI.

targetScope = 'resourceGroup'

@description('Short name component for resources (no dashes, lowercase).')
param shortName string = 'hoobiportfolio'

@description('Public base URL the site advertises (used in sitemap, llms.txt, robots.txt).')
param publicBaseUrl string = ''

@description('Name of the pre-existing storage account that fronts api.hoobi.dev.')
param apiStorageAccountName string

@description('Public-read blob container that api.hoobi.dev serves from.')
param apiContainerName string = 'portfolio'

@description('Custom domain already bound to the storage account, e.g. api.hoobi.dev.')
param apiCustomDomain string

@description('Region for the Static Web App (not available in Australian regions).')
param siteLocation string = 'eastasia'

@description('Tags applied to all resources.')
param tags object = {
  managed_by: 'bicep'
  project: 'hoobi-portfolio'
}

module workload 'modules/workload.bicep' = {
  name: 'workload'
  params: {
    location: resourceGroup().location
    shortName: shortName
    publicBaseUrl: publicBaseUrl
    apiStorageAccountName: apiStorageAccountName
    apiContainerName: apiContainerName
    apiCustomDomain: apiCustomDomain
    siteLocation: siteLocation
    tags: tags
  }
}

output staticSiteName string = workload.outputs.staticSiteName
output staticSiteDefaultHostname string = workload.outputs.staticSiteDefaultHostname
output apiStorageAccountName string = workload.outputs.apiStorageAccountName
output apiBaseUrl string = workload.outputs.apiBaseUrl
