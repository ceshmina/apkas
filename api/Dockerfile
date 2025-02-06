FROM python:3.13.1-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ARG APP_ENV=production
ENV APP_ENV=${APP_ENV}

COPY .python-version pyproject.toml uv.lock ./
RUN uv python install
RUN if [ "$APP_ENV" = "development" ]; then \
      uv sync; \
    else \
      uv sync --no-dev; \
    fi

COPY app app
ENV PYTHONPATH=app

ENTRYPOINT ["uv", "run", "uvicorn", "app.main:app"]
CMD ["--host", "0.0.0.0", "--port", "8000"]
