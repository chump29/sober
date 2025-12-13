#!/usr/bin/env -S docker build . --tag=sober-tracker --file

FROM node:25-alpine AS build

RUN npm install --global --force corepack && \
    corepack enable pnpm

WORKDIR /app

COPY . .

RUN --mount=type=cache,target=/pnpm/store pnpm install --frozen-lockfile && \
    pnpm run build

# -=-

FROM nginx:alpine

RUN apk add --no-cache tzdata && \
    rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=1m CMD curl -f http://localhost || exit 1

ENTRYPOINT ["nginx", "-g", "daemon off;"]
