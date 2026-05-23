# syntax=docker/dockerfile:1.7-labs

# Default to Docker Hardened Image (DHI) for the runtime stage so the OS
# layer tracks alpine security releases without us baking apk upgrades
# into every build. CI overrides this via --build-arg when desired.
ARG RUNTIME_IMAGE=docker.io/dhi/node:24

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

# ----- runtime stage on Docker Hardened Image (DHI) node -----
# DHI ships a minimal, daily-rebuilt node base whose OS layer keeps pace
# with upstream alpine security releases (musl, busybox, openssl, etc.)
# without us having to bake apk upgrades into every build. The image is
# auth-gated so CI logs into docker.io with DHI_USERNAME / DHI_PULL_SECRET
# before this stage pulls.
#
# RUNTIME_IMAGE is passed as a build arg so the tag stays controlled by
# the workflow rather than baked into source. Default lands on a known
# DHI node 24 tag; CI overrides it explicitly via --build-arg.
ARG RUNTIME_IMAGE=docker.io/dhi/node:24
FROM ${RUNTIME_IMAGE} AS runtime
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
CMD ["node", "dist/server.js"]
