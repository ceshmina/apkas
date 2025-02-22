# apkas-api

```bash
docker compose up python
```

or in devcontainer,

```bash
uv run task dev
```

Git is not loaded on the first startup of devcontainer.
Please reload the window (Cmd + Shift + P > Developer: Reload Window) after starting up,

## mypy

```bash
docker compose run python task typecheck
# or
uv run task typecheck
```

## pytest

```bash
docker compose run python task test
# or
uv run task test
```

For other tasks, see [pyproject.toml](./pyproject.toml).
