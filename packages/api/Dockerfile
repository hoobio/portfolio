# syntax=docker/dockerfile:1.7-labs
FROM oven/bun:1.3.14-alpine AS deps
WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
COPY packages/schemas/package.json packages/schemas/
COPY packages/api/package.json packages/api/
COPY packages/web/package.json packages/web/
RUN bun install --frozen-lockfile

FROM deps AS build
# syft generates the in-image SBOM (the runtime endpoint /api/sbom serves it).
# Pinned to the latest stable at the time of writing.
RUN apk add --no-cache curl bash \
 && curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh \
    | sh -s -- -b /usr/local/bin v1.40.1 \
 && apk del curl
COPY . .
RUN bun run --filter @hoobi-portfolio/web build \
 && bun run --filter @hoobi-portfolio/api build \
 && bun run sbom

FROM oven/bun:1.3.14-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=8090
ENV HOST=0.0.0.0
WORKDIR /app

COPY --from=build /app/packages/api/dist ./dist
COPY --from=build /app/packages/api/public ./public
COPY --from=build /app/packages/web/dist ./public/web
COPY --from=build /app/data ./data
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=build /app/packages/schemas ./packages/schemas

ENV DATA_DIR=/app/data
ENV PUBLIC_DIR=/app/public
ENV WEB_DIST_DIR=/app/public/web
ENV SBOM_PATH=/app/public/sbom.cdx.json

EXPOSE 8090
USER bun
CMD ["bun", "dist/server.js"]
