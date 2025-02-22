FROM python:3.13.1-slim
COPY --from=ghcr.io/astral-sh/uv:0.5.29 /uv /uvx /bin/

ARG APP_ENV=production
ENV APP_ENV=${APP_ENV}

WORKDIR /project/api
COPY .python-version pyproject.toml uv.lock ./
RUN uv python install
RUN if [ "$APP_ENV" = "development" ]; then \
      uv sync; \
    else \
      uv sync --no-dev; \
    fi

COPY app app
ENV PYTHONPATH=app

ENTRYPOINT ["uv", "run"]
CMD ["--no-sync", "task", "prod"]
