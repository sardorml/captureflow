# syntax=docker/dockerfile:1.7
#
# Self-hosted CaptureFlow without Cloudflare: SQLite + local disk under /data.
# Two targets share one build:
#   docker build --target web   -t captureflow .
#   docker build --target admin -t captureflow-admin .
# See docker-compose.yml and apps/docs/self-hosting/docker.md.

ARG NODE_IMAGE=node:24-bookworm-slim

FROM ${NODE_IMAGE} AS build
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /repo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch

COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --offline --frozen-lockfile \
      --filter "@captureflow/web..." --filter "@captureflow/admin-app..."

# NEXT_PUBLIC_* are inlined at build; the sentinel origin is swapped for
# APP_URL when the container starts (apps/web/selfhost/origin.ts).
# Your own extension's store listing, for the dashboard's "Add to Chrome" link.
ARG NEXT_PUBLIC_CHROME_WEBSTORE_URL
ENV NEXT_PUBLIC_CHROME_WEBSTORE_URL=${NEXT_PUBLIC_CHROME_WEBSTORE_URL}
ENV CAPTUREFLOW_STANDALONE=1 \
    NEXT_PUBLIC_CAPTUREFLOW_NO_ANALYTICS=1 \
    NEXT_PUBLIC_MARKETING_SITE_URL=https://captureflow-selfhost-origin.invalid \
    NEXT_PUBLIC_APP_WEB_SITE_URL=https://captureflow-selfhost-origin.invalid \
    NEXT_PUBLIC_R2_PUBLIC_BASE_URL=https://captureflow-selfhost-origin.invalid/media
RUN pnpm --filter @captureflow/web build && pnpm --filter @captureflow/web selfhost:build
RUN pnpm --filter @captureflow/admin-app build && pnpm --filter @captureflow/admin-app selfhost:build

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 DATA_DIR=/data
WORKDIR /app
RUN mkdir -p /data && chown node:node /data /app
VOLUME /data

FROM runtime AS web
ENV PORT=3000 CAPTUREFLOW_APP_DIR=/app/apps/web
COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public ./apps/web/public
COPY --from=build --chown=node:node /repo/apps/web/migrations ./apps/web/migrations
COPY --from=build --chown=node:node /repo/apps/web/selfhost/dist/server.mjs ./apps/web/selfhost-server.mjs
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "--disable-warning=ExperimentalWarning", "apps/web/selfhost-server.mjs"]

FROM runtime AS admin
ENV PORT=3001
COPY --from=build --chown=node:node /repo/apps/admin/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=build --chown=node:node /repo/apps/admin/selfhost/dist/server.mjs ./apps/admin/selfhost-server.mjs
USER node
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/login').then(r=>process.exit(r.status<500?0:1),()=>process.exit(1))"
CMD ["node", "--disable-warning=ExperimentalWarning", "apps/admin/selfhost-server.mjs"]
