# Changelog

## [0.1.1](https://github.com/hoobio/portfolio/compare/v0.1.0...v0.1.1) (2026-05-23)


### Features

* ✨ portfolio UX - lock viewport, styled scrollbar, drag-to-scroll, tap-to-expand ([65253ea](https://github.com/hoobio/portfolio/commit/65253ea179181a06a6aa51b16a39490aea1cb21c))
* server fetches DT findings.json from FINDINGS_URL at startup ([37d87e9](https://github.com/hoobio/portfolio/commit/37d87e91f3cb9a896769a6045fcf5c1b9656e68d))


### Bug Fixes

* 🐛 release-please PR title uses version, not branch name ([80b3b60](https://github.com/hoobio/portfolio/commit/80b3b60e3d5a3c1d5431e97d28af96ee1ecab359))
* 🐛 release-please tag format - drop component prefix (was hoobi-portfolio-vX.Y.Z, now vX.Y.Z) ([0a92004](https://github.com/hoobio/portfolio/commit/0a92004efeededf0ba15f5fc0d1700f84d24d055))
* 🐛 separate-pull-requests=true so release PR title gets version substitution ([6de1d05](https://github.com/hoobio/portfolio/commit/6de1d058f5819b2fb513ef2d9080d962e7448c59))


### Documentation

* 📝 add personal-assistant project, GDPR compliance, cloud cost optimisation ([54a79c7](https://github.com/hoobio/portfolio/commit/54a79c76ba1dade7d969354dd5924b1dea62c363))
* 📝 require conventional commits + gitmoji (for release-please) ([1937b52](https://github.com/hoobio/portfolio/commit/1937b525d83713a99147221369c4db3e4d6c5557))
* 📝 reword project titles and summaries ([82a7e65](https://github.com/hoobio/portfolio/commit/82a7e656091ff9be2629d58d9f079821e8325922))


### Build System

* 📦 swap SBOM generator from cdxgen to syft ([fdea83f](https://github.com/hoobio/portfolio/commit/fdea83f8bdfb801a1c532b19b63cb272859b34c3))


### Continuous Integration

* 👷 Build artefacts -&gt; Build artifacts in step summary header ([6c911c8](https://github.com/hoobio/portfolio/commit/6c911c818835c67c55e47ea619e019168f73ba76))
* 👷 build-bundle composite uses anchore/sbom-action (syft) too ([aac2109](https://github.com/hoobio/portfolio/commit/aac2109da553c5a833c010ebb2a8c0e572771e5c))
* 👷 release-please uses GitHub App token + PR template mirrors bitwarden ([eac0444](https://github.com/hoobio/portfolio/commit/eac0444dae89c04e31a04763f631fc651e6cbd5e))
* 👷 rename pipeline stages + split PDT into UI/API + add Publish release gate ([88c30b2](https://github.com/hoobio/portfolio/commit/88c30b23e9b01de8704cd679c3226afe7b37a0f3))
* Lint (was Lint (oxlint)), Unit Tests and Coverage (was Test + coverage), Build (was Build (web + api + SBOM)), PDT split into UI Tests + API Tests parallel jobs. Release: Build and Publish, Generate SBOM, Publish draft release (no longer flips to live), Deploy to Azure, PDT (Production), and new Publish release job that flips draft to live only after prod PDT passes. All composite uses have descriptive name: fields. test-pdt composite gains a mode: ui|api|all input. ([88c30b2](https://github.com/hoobio/portfolio/commit/88c30b23e9b01de8704cd679c3226afe7b37a0f3))
