# syntax=docker/dockerfile:1

# ---- stage 1: validate + stamp a build hash (so every image is a new app "version") ----
FROM node:22-alpine AS build
WORKDIR /src
COPY scripts ./scripts
COPY public ./public
RUN node scripts/check.js && node scripts/stamp.js

# ---- stage 2: tiny static web server, runs as a non-root user on port 8080 ----
FROM nginxinc/nginx-unprivileged:1.27-alpine
LABEL org.opencontainers.image.title="TrainBook" \
      org.opencontainers.image.description="Bodyweight training notebook (Arabic / English PWA)"
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/public /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
