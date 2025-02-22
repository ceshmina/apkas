FROM oven/bun:1.2.2

WORKDIR /project/admin
COPY package.json bun.lock ./
RUN bun install

ENTRYPOINT [ "bun", "run" ]
CMD [ "dev" ]
