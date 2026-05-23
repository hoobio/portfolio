# Changelog

## [0.1.4](https://github.com/hoobio/portfolio/compare/v0.1.3...v0.1.4) (2026-05-23)


### Features

* ✨ add build/release/SBOM badges to README + native-styled badges in site SBOM section ([2503892](https://github.com/hoobio/portfolio/commit/2503892464960a22289de2c4c34cf59a39412482))
* ✨ consolidate ci.yml + release.yml + codeql.yml into a single workflow ([5b7df5d](https://github.com/hoobio/portfolio/commit/5b7df5d966cfceaf1d6e26c7636af950fdf2b2d7))
* ✨ gate publish-release on CodeQL success + link SBOM + CodeQL in trust signal ([ca2deb1](https://github.com/hoobio/portfolio/commit/ca2deb1f67b75835a2fa465b8737e9b1ced9dfc1))
* ✨ promote data/observability/compliance to deep skills + drop list-marker on group titles ([d611ab1](https://github.com/hoobio/portfolio/commit/d611ab1f33b9d322f409c35afb25846b2c3922be))
* ✨ show role duration (years + months) under experience date range ([a04ae45](https://github.com/hoobio/portfolio/commit/a04ae45b1d618a0c4a8730bdd669d7bd60a662f8))


### Bug Fixes

* 🐛 mint release-please App token for publish-release (GITHUB_TOKEN 401 on App-authored release) ([cb9c9a8](https://github.com/hoobio/portfolio/commit/cb9c9a8ee53b72b01ab06e32ae85e590ecdf19f2))
* 🐛 wire jsonSchemaTransformObject so Swagger UI resolves $ref schemas ([148ebb2](https://github.com/hoobio/portfolio/commit/148ebb23d3b3c1ec4783daa2975bcef4a2c55956))


### Documentation

* 📝 add ADO/GitHub administration + incident management skill groups ([264cd98](https://github.com/hoobio/portfolio/commit/264cd9822b1b8ad7ba7abef337f93f68eda82bf9))
* 📝 tighten portfolio copy + reclassify Earmark as open-source ([1d0100f](https://github.com/hoobio/portfolio/commit/1d0100faccc4465882ae25ebde51ef7df835c62a))
* 📝 tweak identity labels + expand observability stack (Mimir, Tempo) + reorder skill groups ([6fe1184](https://github.com/hoobio/portfolio/commit/6fe118468001cc9fe343962003328fe6edbd74f4))

## [0.1.3](https://github.com/hoobio/portfolio/compare/v0.1.2...v0.1.3) (2026-05-23)


### Bug Fixes

* 🐛 bump pipeline-tools refs to v2.2.1 (chmod/chown fix for SBOM file) ([4b272d3](https://github.com/hoobio/portfolio/commit/4b272d383888f1b4362da2220e676a213606118d))
* 🐛 stop swallowing DT upload failures (no more continue-on-error) ([dd4b4cd](https://github.com/hoobio/portfolio/commit/dd4b4cd6d8860a237580b0d393deb22ad0fbc5fe))

## [0.1.2](https://github.com/hoobio/portfolio/compare/v0.1.1...v0.1.2) (2026-05-23)


### Features

* ✨ add publish_release dispatch input for emergency release rebuilds ([95ac3b8](https://github.com/hoobio/portfolio/commit/95ac3b826ccaa073df1a89f577aa01021da7f3f4))
* ✨ nav active indicator + mobile section picker + shared terminal prompt ([f8afe4c](https://github.com/hoobio/portfolio/commit/f8afe4c0ecf6b9de95c2eb23d623c88c637fc6b8))
* **ci:** pipeline-tools native SBOM + per-PR DT scan with HTML report ([#12](https://github.com/hoobio/portfolio/issues/12)) ([c9388e9](https://github.com/hoobio/portfolio/commit/c9388e91e0623b717cab30c3bce915423ca70c40))


### Bug Fixes

* 🐛 DT channel/mark-latest/prune logic honours publish_release dispatch ([9693a37](https://github.com/hoobio/portfolio/commit/9693a375134eaf7353977ac8b1ec8c13a730e0ab))
* 🐛 hero test uses new 'shell' tab title ([c9bc0b7](https://github.com/hoobio/portfolio/commit/c9bc0b77e397510a24838e4af3f6c5f182855476))
* 🐛 install syft in Dockerfile build stage (sbom step needs it) ([6ba4baa](https://github.com/hoobio/portfolio/commit/6ba4baa5f3baba3d40347cc6992e1248249fdcfe))


### Miscellaneous Chores

* **deps:** bump actions/attest-sbom from 3 to 4 ([f831f44](https://github.com/hoobio/portfolio/commit/f831f4468368a38e5705af9f1909e16776c6ea8c))
* **deps:** bump actions/attest-sbom from 3 to 4 ([1ead1fe](https://github.com/hoobio/portfolio/commit/1ead1fe0279fc3b274ecae60da7eb3f468c3cfc2))
* **deps:** bump azure/login from 2 to 3 ([0c5ff01](https://github.com/hoobio/portfolio/commit/0c5ff01908bc46b3ecc68e27f26d9d60438a8843))
* **deps:** bump azure/login from 2 to 3 ([76457f0](https://github.com/hoobio/portfolio/commit/76457f0c48175348771a85add82573c1920f72e5))
* **deps:** bump docker/login-action from 3 to 4 ([0e6d7d8](https://github.com/hoobio/portfolio/commit/0e6d7d83841b0bb49d6622f2e55b24e1845d5063))
* **deps:** bump docker/login-action from 3 to 4 ([fd80c90](https://github.com/hoobio/portfolio/commit/fd80c905a985d8442e11616cc4891d94aa808a14))
* **deps:** bump docker/setup-buildx-action from 3 to 4 ([be0d10b](https://github.com/hoobio/portfolio/commit/be0d10bfcfd5f0f855dd5a7a6f5b6ae5b926b5ee))
* **deps:** bump docker/setup-buildx-action from 3 to 4 ([b348346](https://github.com/hoobio/portfolio/commit/b348346382743b278597c4645e9a9e4591c6d05e))
* **deps:** bump hoobio/pipeline-tools from 1.6.0 to 2.1.0 ([58991dc](https://github.com/hoobio/portfolio/commit/58991dcb5211d4a7f82cce495285bbbcad8f0367))
* **deps:** bump hoobio/pipeline-tools from 1.6.0 to 2.1.0 ([04a7178](https://github.com/hoobio/portfolio/commit/04a71781b8c686c6bd26b67b7c4697ff60bd4d49))


### Continuous Integration

* 👷 add dependabot (npm + actions + docker) and CodeQL workflow ([9fc8ed5](https://github.com/hoobio/portfolio/commit/9fc8ed584f7f955c77e3ef08020fcb044b7540dd))
* 👷 dependabot only groups github-actions minor/patch (majors stay individual) ([4fb045f](https://github.com/hoobio/portfolio/commit/4fb045fcbbc079089df216f1e0736647a516dff9))

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
