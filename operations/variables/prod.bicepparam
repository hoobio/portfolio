using '../provision/main.bicep'

param shortName = 'hoobiportfolio'
param publicBaseUrl = 'https://hoobi.io'
param findingsUrl = ''
param customHostname = 'hoobi.io'
param certificateName = 'cloudflare-origin'

// containerImage and appVersion are injected by the GitHub Actions workflow:
//   az deployment group create ... \
//     --parameters containerImage=ghcr.io/hoobio/portfolio:1.2.3 \
//     --parameters appVersion=1.2.3
param containerImage = 'ghcr.io/hoobio/portfolio:latest'
param appVersion = 'dev'
