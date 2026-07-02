# syntax=docker/dockerfile:1.25-labs

# Runtime base. Docker Hardened Image (dhi.io/node:24) by default;
# overridable via `--build-arg RUNTIME_IMAGE=...` from CI. DHI ships
# without the npm bundle and tracks alpine security releases on a
# daily rebuild cadence so musl / busybox / openssl patches land
# without us baking apk upgrades.
ARG RUNTIME_IMAGE=dhi.io/node:24

# ----- build stages on plain node:24-alpine (need apk + corepack) -----
FROM node:24-alpine AS deps
RUN corepack enable && corepack prepare pnpm@11.2.2 --activate
# CI=true tells pnpm to error rather than prompt when its pre-run
# deps-status check decides node_modules needs refreshing. Without it,
# the build stage's `pnpm run build` aborts with
# ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY inside Docker.
ENV CI=true
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/schemas/package.json packages/schemas/
COPY packages/api/package.json packages/api/
COPY packages/web/package.json packages/web/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @hoobi-portfolio/web run build \
 && pnpm --filter @hoobi-portfolio/api run build

# Assemble a self-contained runtime tree with prod deps only. Requires
# `injectWorkspacePackages: true` in pnpm-workspace.yaml so the deploy
# stage inlines workspace refs (e.g. @hoobi-portfolio/schemas).
FROM build AS deploy
RUN pnpm --filter @hoobi-portfolio/api deploy --prod /tmp/api-deploy

# ----- runtime stage -----
# Pinned via RUNTIME_IMAGE build-arg (declared at the top of the file).
# When a Docker Hardened Image is configured for this repo the base is
# minimal + daily-rebuilt and skips the npm bundle, which keeps the SBOM
# scan focused on what we actually ship.
FROM ${RUNTIME_IMAGE} AS runtime
# dhi.io/node is distroless - no shell, no package manager, just node.
# That means no RUN steps work here; everything below is COPY/ENV only.
# Bonus: DHI ships without an npm bundle, so the source of the stale
# ip-address / brace-expansion entries from previous alpine runs is
# gone.
ENV NODE_ENV=production
ENV PORT=8090
ENV HOST=0.0.0.0
WORKDIR /app

COPY --from=deploy /tmp/api-deploy/package.json ./package.json
COPY --from=deploy /tmp/api-deploy/node_modules ./node_modules
COPY --from=build  /app/packages/api/dist ./dist
COPY --from=build  /app/packages/api/public ./public
COPY --from=build  /app/packages/web/dist ./public/web
COPY --from=build  /app/data ./data

ENV DATA_DIR=/app/data
ENV PUBLIC_DIR=/app/public
ENV WEB_DIST_DIR=/app/public/web
ENV SBOM_PATH=/app/public/sbom.cdx.json

EXPOSE 8090
# DHI's node image already runs as a non-root user by default, so no
# explicit USER is needed. (When swapping back to node:24-alpine, add
# `USER node` here.)
CMD ["node", "dist/server.js"]
