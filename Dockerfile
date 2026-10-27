ARG BASE_IMAGE="node:24-slim"
ARG PNPM_IMAGE="ghcr.io/pnpm/pnpm:12"
ARG PNPM_STORE="/pnpm/store"

FROM ${PNPM_IMAGE} AS pnpm
FROM --platform=$BUILDPLATFORM ${PNPM_IMAGE} AS pnpm-native

# Build output (dist/) is the same whatever the platform so it doesn't need emulation
FROM --platform=$BUILDPLATFORM ${BASE_IMAGE} AS build
COPY --from=pnpm-native /opt/pnpm /opt/pnpm
RUN ln -s /opt/pnpm/pnpm /usr/local/bin/pnpm
ARG PNPM_STORE
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=${PNPM_STORE},sharing=locked \
  pnpm install --frozen-lockfile --store-dir ${PNPM_STORE}
COPY . .
RUN pnpm build

FROM ${BASE_IMAGE} AS prod-deps
COPY --from=pnpm /opt/pnpm /opt/pnpm
RUN ln -s /opt/pnpm/pnpm /usr/local/bin/pnpm
ARG PNPM_STORE
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=${PNPM_STORE},sharing=locked \
  pnpm install --frozen-lockfile --store-dir ${PNPM_STORE} --prod

FROM ${BASE_IMAGE}
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY drizzle ./drizzle

RUN mkdir /logs && chown node:node /logs
ENV LOGS_DIR=/logs

EXPOSE 80

USER node
ENV NODE_ENV=production
CMD ["node", "--enable-source-maps", "dist/index.js"]