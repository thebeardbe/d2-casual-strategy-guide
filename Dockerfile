# syntax=docker/dockerfile:1

# Stage 1: build the static site. Dev dependencies are needed here (vite, tsc),
# they do not reach the final image.
FROM node:24-alpine AS build
WORKDIR /app

# Copy the manifests first so a source-only change reuses the dependency layer.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html ./
COPY public ./public
COPY src ./src

# tsc -b typechecks as part of the build, so a type error fails the image.
RUN npm run build

# Stage 2: serve the bundle. Only the built files are copied over.
FROM nginx:1.27-alpine AS runtime
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/healthz || exit 1
