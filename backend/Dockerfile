#!/usr/bin/env -S docker build . --tag=sober-backend --file

FROM ghcr.io/astral-sh/uv:python3.14-alpine AS build

WORKDIR /backend

ENV UV_LINK_MODE=copy
ENV UV_NO_DEV=1
ENV UV_PYTHON_DOWNLOADS=0
ENV UV_OFFLINE=1

COPY pyproject.toml uv.lock api.py healthcheck.sh /backend/
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --no-install-project

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen

RUN rm pyproject.toml uv.lock

# -=-

FROM python:3.14-alpine

WORKDIR /backend

COPY --from=build /backend .

ENV PATH="/backend/.venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

HEALTHCHECK --interval=60s CMD source /backend/healthcheck.sh

EXPOSE 5556

CMD ["fastapi", "run", "/backend/api.py", "--port", "5556"]
