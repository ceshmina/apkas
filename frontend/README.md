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
