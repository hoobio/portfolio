# syntax=docker/dockerfile:1.7-labs
FROM node:24-alpine AS deps
# Pull latest alpine package patches into the base layer. The default
# node:24-alpine image lags upstream alpine security releases by a few
# days; `apk upgrade` picks up musl + busybox patches that the image
# hasn't yet been rebuilt with.
RUN apk --no-cache upgrade
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

FROM node:24-alpine AS runtime
RUN apk --no-cache upgrade
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
USER node
CMD ["node", "dist/server.js"]
