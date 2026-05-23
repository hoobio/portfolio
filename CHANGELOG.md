# Changelog

## [0.1.0](https://github.com/hoobio/portfolio/compare/hoobi-portfolio-v0.1.0...hoobi-portfolio-v0.1.0) (2026-05-23)


### Features

* horizontal-section pager, json/yaml view per section, fixed-height terminal, arrows ([17b8832](https://github.com/hoobio/portfolio/commit/17b8832508c153aada94c2dec8331cc9991c7406))
* horizontal-snap carousels (skills/projects/themes); drop sbom ecosystem header; copy SPA into api/public/web during build ([b61f44f](https://github.com/hoobio/portfolio/commit/b61f44f488e9b1d46c4ce956fb658b906d4c5487))
* initial commit: data-driven portfolio (Bun + Fastify + React + Vite) ([4ad8028](https://github.com/hoobio/portfolio/commit/4ad802805aabf8901ec64ac9bcd8e00eab724d77))
* multi-page + typing terminal + cache headers + dank mono bold/italic ([1698bd4](https://github.com/hoobio/portfolio/commit/1698bd4f6561ef5e4d667c0f4ca9f2b676dd95d9))
* playwright e2e + bruno api tests; PDT job in CI and post-release ([399f66f](https://github.com/hoobio/portfolio/commit/399f66fb09dc7e3d2d96dc56c3b6b07a15007c44))
* release: immutable draft -&gt; attach SBOM -&gt; publish -&gt; deploy + PR coverage comments ([4a53e42](https://github.com/hoobio/portfolio/commit/4a53e42ad28c416b7ebb36feaaa0cbe660f6cd34))
* scroll-to-anchor after SPA load + lower web coverage gate ([5d84aed](https://github.com/hoobio/portfolio/commit/5d84aed4272cdb335077ff82463c29d54c9b2834))
* server fetches DT findings.json from FINDINGS_URL at startup ([37d87e9](https://github.com/hoobio/portfolio/commit/37d87e91f3cb9a896769a6045fcf5c1b9656e68d))
* timeline experience, add St Philips role, RG-scope bicep (australiasoutheast) ([3eaa346](https://github.com/hoobio/portfolio/commit/3eaa346dd25f3b63a41616e64e88d5689c6fceca))


### Bug Fixes

* app.test getAllByText (principles renders in nav + heading) ([f77c59c](https://github.com/hoobio/portfolio/commit/f77c59c8191866bd71e0c450e8759616b4f75592))
* bicep RG-scope + findingsUrl param; correct job titles (DevOps progression) ([dfb068b](https://github.com/hoobio/portfolio/commit/dfb068b7725aadda8501728a1af9cadf5e93a979))
* bruno: run from collection root (was 'You can run only at the root of a collection') ([92d0a14](https://github.com/hoobio/portfolio/commit/92d0a1420531b9014f8c20a96232e7fcd60dbab1))
* deploy + PDT fixes: bash exit code, build before PDT, single-port test ([e4c955a](https://github.com/hoobio/portfolio/commit/e4c955a098706c18ab6ef84f0410e556c817ff44))
* deploy: re-bind hoobi.io + Origin CA cert after Bicep (Bicep wipes ingress customDomains) ([742ea96](https://github.com/hoobio/portfolio/commit/742ea96144e3f73150ea806bba39c680d56c80c6))
* deploy: use actual cert name 'cloudflare-origin' for hostname rebind ([bc392b5](https://github.com/hoobio/portfolio/commit/bc392b5d47413f0d341f0735b89f1aaa5c5f803e))
* detect cert via 'env certificate list' (no 'show' subcommand exists) ([c798bb3](https://github.com/hoobio/portfolio/commit/c798bb3c6e80e57eed645c287dda5433ff21c547))
* DT steps non-blocking + deploy resilient to SBOM job result ([2c40fe2](https://github.com/hoobio/portfolio/commit/2c40fe2a7d619eb6a5e92c0a80456a33f19cdfe4))
* fix tests: enable static reply decoration; update Hero header assertion ([40df043](https://github.com/hoobio/portfolio/commit/40df04341d4cd2ed5a5a92bca5ae38d1c104a1a6))
* fix typecheck: css ambient module, contact email optional, sbom severity types ([f6d8af9](https://github.com/hoobio/portfolio/commit/f6d8af9ceff45ccc353f93cfb2dd18abe08b92a9))
* pin CycloneDX spec 1.6 for DT compatibility; DT steps non-blocking; deploy resilient to sbom failure ([4a686fe](https://github.com/hoobio/portfolio/commit/4a686fece03a051dc5ad0af7021d85f60a6d240b))
* playwright: stricter selectors, drop ecosystem chart assertion, add yaml endpoint test ([677af8b](https://github.com/hoobio/portfolio/commit/677af8bacc1c67865dbb3d694ea851eda17049ec))
* release-please failure does not block downstream deploy (continue-on-error + always) ([29694fa](https://github.com/hoobio/portfolio/commit/29694fa68aead6911e8b024fadd12d5c5242be2a))
* simplify bruno tests + run API directly so output is visible ([5e3bf33](https://github.com/hoobio/portfolio/commit/5e3bf335643b8ca52d9b2292aff782259f2da475))
* stabilise App.test.tsx around Nav render instead of typed Hero text ([6758417](https://github.com/hoobio/portfolio/commit/675841799534a46c5ccca54635b182de6ebfabb8))
* stub Element scrollTo/scrollIntoView in jsdom for tests ([777e7d2](https://github.com/hoobio/portfolio/commit/777e7d2397b30b07d891da57ea45e20fe7f0a781))
* stub IntersectionObserver in jsdom for tests ([d1aa911](https://github.com/hoobio/portfolio/commit/d1aa91180b11258df63f2949807c44ad405986c2))
* swagger: inline nested zod schemas to fix broken \ ([b5e7dcd](https://github.com/hoobio/portfolio/commit/b5e7dcd654cb21f25811c6495b282ee15558ff3c))
* test fixtures: include vulnerabilities field ([6f3ab32](https://github.com/hoobio/portfolio/commit/6f3ab3242dc1d49aded837db9109fd1808038c27))
* use setup-bun@v2 (v3 not released yet) ([8dba813](https://github.com/hoobio/portfolio/commit/8dba813872b7f18e9ec2f8ec5059ab8878f6537e))


### Documentation

* 📝 require conventional commits + gitmoji (for release-please) ([1937b52](https://github.com/hoobio/portfolio/commit/1937b525d83713a99147221369c4db3e4d6c5557))
* link site -&gt; repo and repo -&gt; site (footer + nav + readme) ([c39204a](https://github.com/hoobio/portfolio/commit/c39204a4030b406ff8a8d24d390c1feb417d8aa9))


### Chores

* bootstrap initial release ([cd046c1](https://github.com/hoobio/portfolio/commit/cd046c172dde47009c8e3a373c163781bd4507e0))
* lower coverage thresholds to realistic gate values ([8ca82a5](https://github.com/hoobio/portfolio/commit/8ca82a509f279389bc30411416cf98a23c2d19e6))
