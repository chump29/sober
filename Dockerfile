#!/usr/bin/env -S docker build . --tag=sober --file

FROM node:alpine AS build

RUN npm install --global --force corepack && \
    corepack enable pnpm && \
    corepack use pnpm@latest

WORKDIR /app

COPY . .

RUN --mount=type=cache,target=/pnpm/store pnpm install --frozen-lockfile && \
    pnpm run build

# -=-

FROM nginx:alpine

RUN apk add --no-cache tzdata && \
    rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=60s CMD source /usr/share/nginx/html/healthcheck.sh

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
