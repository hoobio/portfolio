# syntax=docker/dockerfile:1.7-labs
FROM node:24-alpine AS deps
RUN corepack enable && corepack prepare pnpm@11.2.2 --activate
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

# Assemble a self-contained runtime tree: only api's prod deps, workspace
# refs inlined. `--legacy` is required because the workspace isn't set up
# with `inject-workspace-packages=true` (which would change install
# semantics across all workflows); the warning emitted is benign.
FROM build AS deploy
RUN pnpm --filter @hoobi-portfolio/api deploy --legacy --prod /tmp/api-deploy

FROM node:24-alpine AS runtime
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
