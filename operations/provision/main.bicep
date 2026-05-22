// Subscription-scoped deployment. Creates a resource group, the Container Apps
// environment, the Container App that serves the site, and a public-read
// storage account that hosts published SBOMs.
//
// Cost target: less than 50c/month at portfolio traffic.
// - Container Apps Consumption: 180k vCPU-seconds + 360k GiB-seconds free/month.
//   Scale-to-zero (minReplicas: 0) keeps it idle when nobody's looking.
// - Storage Account Standard_LRS Hot: KB of blobs in the SBOM container = ~$0.
// - No Log Analytics workspace, no ACR (image is on GHCR), no Front Door.

targetScope = 'subscription'

@description('Name of the resource group to create or update.')
param resourceGroupName string = 'rg-hoobi-portfolio'

@description('Azure region for all resources.')
param location string = 'australiaeast'

@description('Container image, e.g. ghcr.io/hoobio/portfolio:1.2.3')
param containerImage string

@description('Short name component for resources (no dashes, lowercase).')
param shortName string = 'hoobiportfolio'

@description('Public base URL the app advertises (used in sitemap, llms.txt).')
param publicBaseUrl string = ''

@description('App version stamped into /api/health.')
param appVersion string = 'dev'

@description('Tags applied to all resources.')
param tags object = {
  managed_by: 'bicep'
  project: 'hoobi-portfolio'
}

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module workload 'modules/workload.bicep' = {
  scope: rg
  name: 'workload'
  params: {
    location: location
    shortName: shortName
    containerImage: containerImage
    publicBaseUrl: publicBaseUrl
    appVersion: appVersion
    tags: tags
  }
}

output containerAppFqdn string = workload.outputs.containerAppFqdn
output storageAccountName string = workload.outputs.storageAccountName
output sbomBlobBase string = workload.outputs.sbomBlobBase
