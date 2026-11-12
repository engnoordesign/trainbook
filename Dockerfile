# syntax=docker/dockerfile:1

# ---- stage 1: validate + test + stamp a build hash (so every image is a new app "version") ----
FROM node:22-alpine AS build
WORKDIR /src
COPY scripts ./scripts
COPY src ./src
COPY public ./public
RUN node scripts/check.js && node scripts/vault-test.js && node scripts/sw-test.js && node scripts/merge-test.js \
    && node scripts/music-test.js && node scripts/library-test.js && node scripts/figure-test.js && node scripts/server-test.js && node scripts/worker-test.js && node scripts/stamp.js

# ---- stage 2: tiny static web server, runs as a non-root user on port 8080 ----
# (This image serves the app only. The account/sync service lives in the Cloudflare Worker, or `node scripts/serve.js`;
#  here /api/* answers "no account service" and profiles simply stay on the device.)
FROM nginxinc/nginx-unprivileged:1.27-alpine
LABEL org.opencontainers.image.title="TrainBook" \
      org.opencontainers.image.description="Bodyweight training notebook (Arabic / English PWA)"
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/public /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
