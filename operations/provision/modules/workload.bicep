// Workload module: Container Apps Environment + Container App + Storage.
// Deployed at resource-group scope by infra/main.bicep.

param location string
param shortName string
param containerImage string
param publicBaseUrl string
param appVersion string
param findingsUrl string = ''
param tags object

// --- Storage account for public-read SBOMs ---

resource storage 'Microsoft.Storage/storageAccounts@2024-01-01' = {
  name: take('${shortName}sbom${uniqueString(resourceGroup().id)}', 24)
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
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2024-01-01' = {
  parent: storage
  name: 'default'
  properties: {
    cors: {
      corsRules: [
        {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'HEAD']
          allowedHeaders: ['*']
          exposedHeaders: ['*']
          maxAgeInSeconds: 3600
        }
      ]
    }
  }
}

resource sbomContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2024-01-01' = {
  parent: blobService
  name: 'sbom'
  properties: {
    publicAccess: 'Blob'
  }
}

// --- Container Apps environment (Consumption only, no Log Analytics) ---

resource appEnv 'Microsoft.App/managedEnvironments@2025-01-01' = {
  name: '${shortName}-env'
  location: location
  tags: tags
  properties: {
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
    zoneRedundant: false
  }
}

// --- Container App ---

resource app 'Microsoft.App/containerApps@2025-01-01' = {
  name: '${shortName}-app'
  location: location
  tags: tags
  properties: {
    environmentId: appEnv.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8090
        transport: 'auto'
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
    }
    template: {
      containers: [
        {
          name: 'portfolio'
          image: containerImage
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'PORT', value: '8090' }
            { name: 'HOST', value: '0.0.0.0' }
            { name: 'LOG_LEVEL', value: 'info' }
            { name: 'PUBLIC_BASE_URL', value: publicBaseUrl }
            { name: 'APP_VERSION', value: appVersion }
            { name: 'FINDINGS_URL', value: findingsUrl }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: { path: '/api/health', port: 8090 }
              initialDelaySeconds: 5
              periodSeconds: 30
              timeoutSeconds: 3
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: { path: '/api/health', port: 8090 }
              initialDelaySeconds: 3
              periodSeconds: 10
              timeoutSeconds: 3
              failureThreshold: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
        rules: [
          {
            name: 'http-burst'
            http: {
              metadata: {
                concurrentRequests: '20'
              }
            }
          }
        ]
      }
    }
  }
}

output containerAppFqdn string = app.properties.configuration.ingress.fqdn
output storageAccountName string = storage.name
output sbomBlobBase string = '${storage.properties.primaryEndpoints.blob}sbom/'
