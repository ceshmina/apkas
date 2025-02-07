FROM python:3.13.1-slim
COPY --from=ghcr.io/astral-sh/uv:0.5.29 /uv /uvx /bin/

ARG APP_ENV=production
ENV APP_ENV=${APP_ENV}

WORKDIR /project
COPY .python-version pyproject.toml uv.lock ./
RUN uv python install && uv sync

COPY app app
ENV PYTHONPATH=app

ENTRYPOINT ["uv", "run", "task"]
CMD ["prod"]
