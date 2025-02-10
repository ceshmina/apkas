FROM oven/bun:1.2.2

WORKDIR /project
COPY package.json bun.lock ./
RUN bun install

ENTRYPOINT [ "bun", "run" ]
CMD [ "dev" ]
