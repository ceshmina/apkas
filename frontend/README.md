# apkas-frontend

## preparation

```bash
cd ../api
docker compose up -d python
```

## development

```bash
docker compose up dev
```

or in devcontainer,

```bash
bun run dev
```

Git is not loaded on the first startup of devcontainer.
Please reload the window (Cmd + Shift + P > Developer: Reload Window) after starting up,

### lint

```bash
docker compose run --rm dev lint
# or
bun run lint
```

### test

```bash
docker compose run --rm dev test
# or
bun run test
```
