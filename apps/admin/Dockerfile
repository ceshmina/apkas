FROM oven/bun:1.2.20

WORKDIR /admin
COPY package.json bun.lock ./
COPY packages/diary/package.json packages/diary/
COPY apps/admin/package.json apps/admin/
RUN bun install

COPY . .

WORKDIR /admin/apps/admin
RUN bun run build

CMD ["bun", "run", "start", "--port", "4000"]
