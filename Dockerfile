ARG APP="api"
ARG BASE_IMAGE="node:24-slim"
ARG PNPM_IMAGE="ghcr.io/pnpm/pnpm:12"
ARG PNPM_STORE="/pnpm/store"

FROM ${PNPM_IMAGE} AS pnpm
FROM --platform=$BUILDPLATFORM ${PNPM_IMAGE} AS pnpm-native

# Build output (**/dist/) is the same whatever the platform so it doesn't need emulation
FROM --platform=$BUILDPLATFORM ${BASE_IMAGE} AS build
ARG APP
ARG PNPM_STORE
ENV pnpm_config_store_dir=${PNPM_STORE}
COPY --from=pnpm-native /opt/pnpm /opt/pnpm
RUN ln -s /opt/pnpm/pnpm /usr/local/bin/pnpm
WORKDIR /repo

COPY . .
RUN --mount=type=cache,id=pnpm,target=${PNPM_STORE},sharing=locked \
  pnpm install --frozen-lockfile --filter "{apps/${APP}}..."

RUN pnpm build apps/${APP}

FROM ${BASE_IMAGE} AS deploy
ARG APP
ARG PNPM_STORE
ENV pnpm_config_store_dir=${PNPM_STORE}
COPY --from=pnpm /opt/pnpm /opt/pnpm
RUN ln -s /opt/pnpm/pnpm /usr/local/bin/pnpm
WORKDIR /repo

COPY --from=build --exclude=**/node_modules/ /repo .
RUN --mount=type=cache,id=pnpm,target=${PNPM_STORE},sharing=locked \
  pnpm --filter "./apps/${APP}" deploy --prod /out

FROM ${BASE_IMAGE}
WORKDIR /app
COPY --from=deploy /out .

RUN mkdir /logs && chown node:node /logs
ENV LOGS_DIR=/logs

EXPOSE 80

USER node
ENV NODE_ENV=production
CMD ["node", "--enable-source-maps", "dist/index.js"]