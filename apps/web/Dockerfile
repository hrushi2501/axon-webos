# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:22.23.2-bookworm-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436

FROM ${NODE_IMAGE} AS dependencies

WORKDIR /app
ENV NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/docs/package.json ./apps/docs/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json

RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspace=web --include-workspace-root=false

FROM dependencies AS build

ARG NEXT_PUBLIC_API_WS_URL="ws://localhost:3001/ws"
ENV NEXT_PUBLIC_API_WS_URL="${NEXT_PUBLIC_API_WS_URL}" \
    NEXT_TELEMETRY_DISABLED=1

COPY apps/web ./apps/web
COPY packages/typescript-config ./packages/typescript-config
RUN npm run build --workspace=web

FROM ${NODE_IMAGE} AS runtime

ARG BUILD_DATE="unknown"
ARG VCS_REF="unknown"
ARG VERSION="dev"

LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.description="Axon browser-based portfolio operating system" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.source="https://github.com/hrushi2501/axon-webos" \
      org.opencontainers.image.title="axon-webos-web" \
      org.opencontainers.image.version="${VERSION}"

WORKDIR /app
ENV APP_VERSION="${VERSION}" \
    HOSTNAME=0.0.0.0 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

RUN rm -rf /usr/local/lib/node_modules/corepack /usr/local/lib/node_modules/npm && \
    rm -f /usr/local/bin/corepack /usr/local/bin/npm /usr/local/bin/npx

COPY --from=build --chown=node:node /app/apps/web/public ./apps/web/public
COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static

USER node:node
EXPOSE 3000
STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["node", "apps/web/server.js"]
