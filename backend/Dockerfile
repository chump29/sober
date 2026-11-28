#!/usr/bin/env -S docker build . --tag sober-backend --file
# docker build --no-cache --progress plain . --tag sober-backend --file

ARG PYTHON_VERSION="3.15"

FROM ghcr.io/astral-sh/uv:python${PYTHON_VERSION}-alpine AS build

WORKDIR /backend

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_NO_DEV=1 \
    UV_PYTHON_DOWNLOADS=0

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project

COPY . /backend/

# -=-

FROM python:${PYTHON_VERSION}-alpine

LABEL org.opencontainers.image.authors="Chris Post <admin@postfmly.com>" \
    org.opencontainers.image.description="Sobriety tracker (Backend)" \
    org.opencontainers.image.licenses="GPL-3.0-only" \
    org.opencontainers.image.title="Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Backend)" \
    org.opencontainers.image.url="https://github.com/chump29/sober"

# hadolint ignore=DL3018
RUN apk add --no-cache tzdata sqlite

WORKDIR /backend

COPY --from=build /backend/.venv /backend/.venv
COPY --from=build /backend/api.py /backend/env.py /backend/pyproject.toml /backend/

COPY --chmod=755 healthcheck.sh /usr/local/bin/healthcheck.sh

ENV PATH="/backend/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TZ=Etc/GMT

HEALTHCHECK --interval=60s --timeout=5s --start-period=10s CMD ["/usr/local/bin/healthcheck.sh"]

EXPOSE 5560

CMD ["fastapi", "run", "api.py", "--app", "ROUTER", "--port", "5560"]
