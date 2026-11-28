#!/usr/bin/env -S docker image build . --tag sober-frontend --file
# docker image build --no-cache --progress plain . --tag sober-frontend --file

FROM oven/bun:alpine AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY patches ./patches

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun ci

COPY . .

RUN bun run build

# -=-

FROM nginx:alpine

LABEL org.opencontainers.image.authors="Chris Post <admin@postfmly.com>" \
    org.opencontainers.image.description="Sobriety tracker (Frontend)" \
    org.opencontainers.image.licenses="GPL-3.0-only" \
    org.opencontainers.image.title="Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Frontend)" \
    org.opencontainers.image.url="https://github.com/chump29/sober"

# hadolint ignore=DL3018
RUN apk add --no-cache tzdata && \
    rm -rf /usr/share/nginx/html/*

WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist .

COPY --chmod=755 healthcheck.sh /usr/local/bin/healthcheck.sh

COPY nginx.conf /etc/nginx/conf.d/default.conf

ENV TZ=Etc/GMT

HEALTHCHECK --interval=60s --timeout=5s --start-period=5s CMD ["/usr/local/bin/healthcheck.sh"]

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
