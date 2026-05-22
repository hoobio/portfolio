using '../provision/main.bicep'

param resourceGroupName = 'rg-hoobi-portfolio'
param location = 'australiaeast'
param shortName = 'hoobiportfolio'
param publicBaseUrl = ''

// containerImage and appVersion are injected by the GitHub Actions workflow:
//   az deployment sub create ... \
//     --parameters containerImage=ghcr.io/hoobio/portfolio:1.2.3 \
//     --parameters appVersion=1.2.3
param containerImage = 'ghcr.io/hoobio/portfolio:latest'
param appVersion = 'dev'
