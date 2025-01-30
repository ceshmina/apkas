FROM python:3.13.1-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY .python-version pyproject.toml uv.lock ./
RUN uv python install && uv sync --no-dev

COPY app app
ENV PYTHONPATH=app

ENTRYPOINT ["uv", "run", "uvicorn", "app.main:app"]
CMD ["--host", "0.0.0.0", "--port", "8000"]
