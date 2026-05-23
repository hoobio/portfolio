// Resource-group-scoped deployment. The resource group is pre-created and
// the deploying identity (the GitHub Actions OIDC app registration) only
// has Contributor scoped at the group level - we never create or modify the
// RG from this template.
//
// Cost target: less than 50c/month at portfolio traffic.
// - Container Apps Consumption: 180k vCPU-seconds + 360k GiB-seconds free/month.
//   Scale-to-zero (minReplicas: 0) keeps it idle when nobody's looking.
// - Storage Account Standard_LRS Hot: KB of blobs = ~$0.
// - No Log Analytics workspace, no ACR (image is on GHCR), no Front Door.

targetScope = 'resourceGroup'

@description('Container image, e.g. ghcr.io/hoobio/portfolio:1.2.3')
param containerImage string

@description('Short name component for resources (no dashes, lowercase).')
param shortName string = 'hoobiportfolio'

@description('Public base URL the app advertises (used in sitemap, llms.txt).')
param publicBaseUrl string = ''

@description('App version stamped into /api/health.')
param appVersion string = 'dev'

@description('Public Blob URL where the latest findings.json lives. Empty means findings UI hidden.')
param findingsUrl string = ''

@description('Custom hostname to bind to the Container App ingress, e.g. hoobi.io. Empty disables.')
param customHostname string = ''

@description('Name of the pre-uploaded managed-environment certificate to bind to customHostname.')
param certificateName string = ''

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
    containerImage: containerImage
    publicBaseUrl: publicBaseUrl
    appVersion: appVersion
    findingsUrl: findingsUrl
    customHostname: customHostname
    certificateName: certificateName
    tags: tags
  }
}

output containerAppFqdn string = workload.outputs.containerAppFqdn
output storageAccountName string = workload.outputs.storageAccountName
output sbomBlobBase string = workload.outputs.sbomBlobBase
